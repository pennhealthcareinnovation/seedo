@description('Standard prefix pattern for the Azure subscription')
param prefix string

@description('Program or app name that the container is associated with')
param appName string

@description('Short name for the environment, e.g. dev, test, prod')
param envShortName string

param location string = resourceGroup().location

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${prefix}-${appName}-${envShortName}-identity'
  location: location
    tags: {
    environment: envShortName
  }
}

output principalId string = identity.properties.principalId
output resourceId string = identity.id
output clientId string = identity.properties.clientId
