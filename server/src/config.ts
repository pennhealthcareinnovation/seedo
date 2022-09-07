import { DefaultAzureCredential } from '@azure/identity'
import { SecretClient, parseKeyVaultSecretIdentifier } from '@azure/keyvault-secrets'
import { AppConfigurationClient, isSecretReference, parseSecretReference } from '@azure/app-configuration'

/**
 * Load configuration from Azure AppConfig and Vauilt 
 * Store a summary report of the loaded config under the key REPORT
 * */
export async function configuration() {
  const { APP_CONFIG_FILTER, APP_CONFIG_CONNECTION } = process.env
  if (!APP_CONFIG_FILTER)
    throw ('FATAL -- APP_CONFIG_FILTER not defined!')

  if (!APP_CONFIG_CONNECTION)
    throw ('FATAL -- APP_CONFIG_CONNECTION not defined!')

  const client = new AppConfigurationClient(APP_CONFIG_CONNECTION)
  const settingsIterator = client.listConfigurationSettings({
    labelFilter: APP_CONFIG_FILTER
  })

  let config = {}
  let report = ''
  for await (const setting of settingsIterator) {
    // allow local environment variables to override cloud config values
    if (process.env?.[setting.key]) {
      config[setting.key] = process.env[setting.key]
      report += `\n [LOCAL .ENV] ${setting.key}: ***`
    } else {

      if (isSecretReference(setting)) {
        const parsedSecretRef = parseSecretReference(setting)
        const { name: secretName, vaultUrl } = parseKeyVaultSecretIdentifier(parsedSecretRef.value.secretId)
        const secretClient = new SecretClient(vaultUrl, new DefaultAzureCredential());
        const secret = await secretClient.getSecret(secretName)
        config[setting.key] = secret.value
        report += `\n ${setting.key}: ***`
      } else {
        config[setting.key] = setting.value
        report += `\n ${setting.key}: ${setting.value}`
      }

      if (setting.contentType.toLowerCase() == 'boolean')
        config[setting.key] = ['true', '1'].includes(config[setting.key].toLowerCase())
      else if (setting.contentType.toLowerCase() == 'integer')
        config[setting.key] = parseInt(config[setting.key])
    }
  }

  config['REPORT'] = `Azure App Config (filters: ${APP_CONFIG_FILTER.replace(/,/g, ', ')}): ${report}`
  return config
}