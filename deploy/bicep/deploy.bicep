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

// @description('Suffix to use for container revisions e.g. use2-chci-ch-coordn8-dev-server-[revisionSuffix]. Typicall short git sha.')
// param revisionSuffix string = ''

resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: containerAppEnvName
  scope: resourceGroup(subscriptionId, 'use2-chci-ch-shared-rg')
}

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: '${prefix}-${appName}-${envShortName}-identity'
}

var env = [
  { name: 'AZURE_CLIENT_ID', value: managedIdentity.properties.clientId }
  { name: 'SERVER_PORT', value: '3000' }
  { name: 'APP_CONFIG_URI', value: 'https://use2-chci-ch-seedo-config.azconfig.io' }
  { name: 'APP_CONFIG_FILTER', value: '${envShortName},shared' }
]

module jobTask 'modules/scheduledJob.bicep' = {
  name: 'jobTask'
  params: {
    location: location
    prefix: prefix
    appName: appName
    envShortName: envShortName
    managedIdentityId: managedIdentity.id
    containerAppEnvId: containerAppEnv.id
    containerRegistryFQDN: containerRegistryFQDN
    imageTag: imageTag
    env: env
    
    jobName: 'tasks'
    cronExpression: '0 12 * * *' // 8AM EST
    command: ['/bin/bash', '-c', 'npm run cli:prod tasks']
  }
} 

module summariesTask 'modules/scheduledJob.bicep' = {
  name: 'summariesTask'
  params: {
    location: location
    prefix: prefix
    appName: appName
    envShortName: envShortName
    managedIdentityId: managedIdentity.id
    containerAppEnvId: containerAppEnv.id
    containerRegistryFQDN: containerRegistryFQDN
    imageTag: imageTag
    env: env
    
    jobName: 'summaries'
    cronExpression: '0 14 * * 6' // Saturday 10AM EST
    command: ['/bin/bash', '-c', 'npm run cli:prod summaries']
  }
} 

module syncTask 'modules/scheduledJob.bicep' = {
  name: 'syncTask'
  params: {
    location: location
    prefix: prefix
    appName: appName
    envShortName: envShortName
    managedIdentityId: managedIdentity.id
    containerAppEnvId: containerAppEnv.id
    containerRegistryFQDN: containerRegistryFQDN
    imageTag: imageTag
    env: env
    
    jobName: 'sync'
    cronExpression: '0 12 * * 6' // Saturday 8AM EST
    command: ['/bin/bash', '-c', 'npm run cli:prod sync']
  }
} 
