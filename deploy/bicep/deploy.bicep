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

resource job 'Microsoft.App/jobs@2023-05-01' = {
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
    environmentId: containerAppEnv.id
    scheduleTriggerConfig: {
      
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
          { name: 'APP_CONFIG_URI', value: 'https://use2-chci-ch-seedo-config.azconfig.io' }
          { name: 'APP_CONFIG_FILTER', value: '${envShortName},shared' }
        ]
      }]
    }
  }
}
