param containerAppEnvName string
param containerRegistryFQDN string
// param serverHostname string
param location string = resourceGroup().location
param subscriptionId string = subscription().subscriptionId

@description('Program or app name that the container is associated with')
param appName string = 'seedo'

@description('Standard prefix pattern for the Azure subscription')
param prefix string = 'use2-chci-ch'

@description('Short name for the environment, e.g. dev, test, prod')
param envShortName string

@description('The tag of the image to deploy, we\'ll use the commit sha1 as the unique image tag')
param imageTag string = 'latest'

@description('Suffix to use for container revisions e.g. use2-chci-ch-coordn8-dev-server-[revisionSuffix]. Typicall short git sha.')
param revisionSuffix string = ''

resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: containerAppEnvName
  scope: resourceGroup(subscriptionId, 'use2-chci-ch-shared-rg')
}

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: '${prefix}-${appName}-${envShortName}-identity'
}

resource vault 'Microsoft.KeyVault/vaults@2023-02-01' existing = {
  name: '${prefix}-vault'
  scope: resourceGroup(subscriptionId, 'use2-chci-ch-vault-rg')
}

resource job 'Microsoft.App/containerApps@2023-05-02-preview' = {
  location: location
  name: '${prefix}-${appName}-${envShortName}-job'
  tags: { environment: envShortName }
  identity: {
    type: 'SystemAssigned, UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        allowInsecure: false
        traffic: [{ latestRevision: true, weight: 100 }]
        corsPolicy: {
          allowedOrigins: ['*']
        }
      }
      registries: [{ server: containerRegistryFQDN, identity: managedIdentity.id }]
      secrets: [
        { name: 'postgres-password'
          identity: managedIdentity.id
          keyVaultUrl: '${vault.properties.vaultUri}secrets/museq-dev-postgres-password'
        }
        { name: 'databricks-token'
          identity: managedIdentity.id
          keyVaultUrl: '${vault.properties.vaultUri}secrets/museq-dev-databricks-token'
        }
      ]
    }
    template: {
      containers: [{
        name: 'server'
        image: '${containerRegistryFQDN}/${appName}-server:${imageTag}'
        resources: {
          cpu: json('0.5')
          memory: '1Gi'
        }
        env: [
          { name: 'AZURE_CLIENT_ID', value: managedIdentity.id }
          { name: 'SERVER_PORT', value: '3000' }
          { name: 'POSTGRES_HOST', value: 'dev-postgres.chci-ch.uphs.upenn.edu' }
          { name: 'POSTGRES_USER', value: 'muse_queue_dev@use2-chci-ch-dev-postgres' }
          { name: 'POSTGRES_DB', value: 'muse_queue_dev' }
          { name: 'QUEUE_URL', value: 'https://${serverHostname}/api' }
          { name: 'DATABRICKS_HOSTNAME', value: 'adb-5482059864227934.14.azuredatabricks.net' }
          { name: 'DATABRICKS_HTTP_PATH', value: '/sql/1.0/warehouses/a82b3cf0b4f72b96' }
          
          { name: 'DATABRICKS_TOKEN', secretRef: 'databricks-token' }
          { name: 'POSTGRES_PASSWORD', secretRef: 'postgres-password' }
        ]
      }]
      revisionSuffix: revisionSuffix != '' ? revisionSuffix : null
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}
