param location string = resourceGroup().location
param subscriptionId string = subscription().subscriptionId

param containerAppEnvName string
param containerRegistryFQDN string

@description('Program or app name that the container is associated with')
param appName string = 'seedo'

@description('Standard prefix pattern for the Azure subscription')
param prefix string = 'use2-chci-ch'

@description('Short name for the environment, e.g. dev, test, prod')
param envShortName string

module managedIdentity 'modules/managed-identity.bicep' = {
  name: 'managedIdentity'
  params: {
    location: location
    prefix: prefix
    appName: appName
    envShortName: envShortName
  }
}

module resourceGroupRole 'modules/role-assignment.bicep' = {
  name: 'resourceGroupRoleAssignment'
  params: {
    resourceId: resourceGroup().id
    principalId: managedIdentity.outputs.principalId
    roleId: 'b24988ac-6180-42a0-ab88-20f7382dd24c' // contributor
  }
}

var containerRegistryName = split(containerRegistryFQDN, '.')[0]
module registry 'modules/container-registry.bicep' = {
  name: 'registry'
  scope: resourceGroup(subscriptionId, 'use2-chci-ch-shared-rg')
  params: {
    principalType: 'ServicePrincipal' 
    principalId: managedIdentity.outputs.principalId
    containerRegistryName: containerRegistryName
  }
}

module appConfig 'modules/app-config.bicep' = {
  name: 'appConfig'
  params: {
    principalType: 'ServicePrincipal' 
    principalId: managedIdentity.outputs.principalId
    location: location
    prefix: prefix
    appName: appName
  }
}

resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: containerAppEnvName
  scope: resourceGroup(subscriptionId, 'use2-chci-ch-shared-rg')
}

module appEnvManagedAppContributor 'modules/role-assignment.bicep' = {
  name: 'appEnvManagedAppContributor'
  scope: resourceGroup(subscriptionId, 'use2-chci-ch-shared-rg')
  params: {
    resourceId: containerAppEnv.id
    principalId: managedIdentity.outputs.principalId
    roleId: '641177b8-a67a-45b9-a033-47bc880bb21e' // Managed Application Contributor Role
  }
}

module appEnvContributor 'modules/role-assignment.bicep' = {
  name: 'appEnvContributor'
  scope: resourceGroup(subscriptionId, 'use2-chci-ch-shared-rg')
  params: {
    resourceId: containerAppEnv.id
    principalId: managedIdentity.outputs.principalId
    roleId: 'b24988ac-6180-42a0-ab88-20f7382dd24c' // Contributor
  }
}

module keyVault 'modules/key-vault.bicep' = {
  name: 'keyVault'
  scope: resourceGroup(subscriptionId, 'use2-chci-ch-vault-rg')
  params: {
    name: '${prefix}-vault'
    principalType: 'ServicePrincipal' 
    principalId: managedIdentity.outputs.principalId
  }
}
