param resourceId string
param principalId string
param principalType string = 'ServicePrincipal'

@description('https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles')
param roleId string

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2020-10-01-preview' = {
  name: guid(resourceGroup().id, resourceId, roleId, principalId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleId)
    principalId: principalId
    principalType: principalType
  }
}
