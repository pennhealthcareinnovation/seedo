param location string

@description('Standard prefix pattern for the Azure subscription')
param prefix string

@description('Program or app name that the container is associated with')
param appName string

param principalId string
param principalType string

resource appConfig 'Microsoft.AppConfiguration/configurationStores@2023-03-01' = {
  name: '${prefix}-${appName}-config'
  location: location
  sku: {
    name: 'standard'
  }
  properties: {
    disableLocalAuth: true
    publicNetworkAccess: 'Enabled'
  }
}

var roleDefinitionResourceId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '516239f1-63e1-4d78-a4de-a74fb236a071')

resource AppConfigDataReaderRole 'Microsoft.Authorization/roleAssignments@2020-08-01-preview' = {
  name: guid(appConfig.id, principalId, roleDefinitionResourceId)
  scope: appConfig
  properties: {
    roleDefinitionId: roleDefinitionResourceId
    principalId: principalId
    principalType: principalType
  }
}

output endpoint string = appConfig.properties.endpoint
