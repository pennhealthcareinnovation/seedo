import { DefaultAzureCredential } from '@azure/identity'
import { SecretClient, parseKeyVaultSecretIdentifier } from '@azure/keyvault-secrets'
import { AppConfigurationClient, isSecretReference, parseSecretReference } from '@azure/app-configuration'

export async function configuration() {
  const credential = new DefaultAzureCredential()
  const APP_CONFIG_CONNECTION = process?.env?.APP_CONFIG_CONNECTION
  if (!APP_CONFIG_CONNECTION)
    throw ('APP_CONFIG_CONNECTION not defined!')

  const client = new AppConfigurationClient(APP_CONFIG_CONNECTION)
  const settingsIterator = client.listConfigurationSettings({
    labelFilter: 'shared,seedo/dev'
  })

  let config = {}
  for await (const setting of settingsIterator) {
    if (isSecretReference(setting)) {
      const parsedSecretRef = parseSecretReference(setting)
      const { name: secretName, vaultUrl } = parseKeyVaultSecretIdentifier(parsedSecretRef.value.secretId)
      const secretClient = new SecretClient(vaultUrl, new DefaultAzureCredential());
      const secret = await secretClient.getSecret(secretName)
      config[setting.key] = secret.value
    } else {
      config[setting.key] = setting.value
    }
  }

  return config
}