import { DefaultAzureCredential } from '@azure/identity'
import { SecretClient, parseKeyVaultSecretIdentifier } from '@azure/keyvault-secrets'
import { AppConfigurationClient, ConfigurationSetting, isSecretReference, parseSecretReference } from '@azure/app-configuration'
import fs from 'fs'

/**
 * Load configuration from Azure AppConfig and Vauilt 
 * Store a summary report of the loaded config under the key REPORT
 * 
 * NOTE: in order to use a managed identity in Azure, you must set the AZURE_CLIENT_ID 
 *    environment variable to matched the CLIENT_ID of the managed identity
 * */
const CACHE_PATH = '.env.cache'
const CACHE_TTL = 1000 * 60 * 15 // 15 minutes

export async function azureConfig() {
  if (process.env?.CACHE_AZURE_CONFIG?.toLowerCase() == 'true') {
    /** check for cache file */
    if (fs.existsSync(CACHE_PATH)) {
      const cacheStat = fs.statSync(CACHE_PATH)
      const cacheAge = Date.now() - cacheStat.mtimeMs
      const cache = fs.readFileSync(CACHE_PATH, 'utf8')
      const config = JSON.parse(cache)

      if (process.env?.OFFLINE_DEV?.toLowerCase() == 'true') {
        config['CACHED'] = `OFFLINE_DEV enabled; using cached Azure app config from ${CACHE_PATH}`
        config['OFFLINE_DEV'] = true
        return config
      } else if (cacheAge < CACHE_TTL) {
        config['CACHED'] = `Using cached Azure app config from ${CACHE_PATH} (age: ${(cacheAge / 1000).toFixed(0)} seconds)`
        return config
      }
    }
  }

  const { APP_CONFIG_FILTER, APP_CONFIG_URI, } = process.env
  if (!APP_CONFIG_FILTER)
    throw ('FATAL -- APP_CONFIG_FILTER not defined!')

  if (!APP_CONFIG_URI)
    throw ('FATAL -- APP_CONFIG_URI not defined!')

  const credentials = new DefaultAzureCredential()
  const client = new AppConfigurationClient(APP_CONFIG_URI, credentials)
  const settingsIterator = client.listConfigurationSettings({ labelFilter: APP_CONFIG_FILTER })
  //@ts-ignore - typing error in @azure/core-paging
  const allSettings = (await settingsIterator.byPage({ maxPageSize: 1000 }).next()).value.items as ConfigurationSetting<string>[]

  let config: Record<string, any> = {}
  let report = ''
  for (const setting of allSettings) {
    // allow local environment variables to override cloud config values
    if (process.env?.[setting.key]) {
      config[setting.key] = process.env[setting.key]!
      report += `\n [LOCAL .ENV] ${setting.key}: ${process.env?.[setting.key]}`
    } else {

      if (isSecretReference(setting)) {
        const parsedSecretRef = parseSecretReference(setting)
        const { name: secretName, vaultUrl } = parseKeyVaultSecretIdentifier(parsedSecretRef.value.secretId)
        const secretClient = new SecretClient(vaultUrl, credentials);
        const secret = await secretClient.getSecret(secretName)
        if (secret?.value) {
          config[setting.key] = secret.value
          report += `\n ${setting.key}: ***`
        } else {
          throw (`FATAL -- Unable to load secret ${secretName} from Key Vault ${vaultUrl}`)
        }

      } else {
        config[setting.key] = setting.value!
        report += `\n ${setting.key}: ${setting.value}`
      }

      if (setting.contentType?.toLowerCase() == 'boolean') {
        config[setting.key] = ['true', '1'].includes(config[setting.key].toLowerCase())
      } else if (setting.contentType?.toLowerCase() == 'integer') {
        config[setting.key] = parseInt(config[setting.key])
      }
    }
  }

  config['REPORT'] = `Azure App Config (filters: ${APP_CONFIG_FILTER.replace(/,/g, ', ')}): ${report}`

  /** store cache */
  if (process.env?.CACHE_AZURE_CONFIG?.toLowerCase() == 'true') {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(config))
  }

  return config
}