param containerRegistryName string
param principalId string
param principalType string

var roleDefinitionResourceId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')

resource registry 'Microsoft.ContainerRegistry/registries@2023-06-01-preview' existing = {
  name: containerRegistryName
}

resource AcrPullRole 'Microsoft.Authorization/roleAssignments@2020-08-01-preview' = {
  name: guid(registry.id, principalId, roleDefinitionResourceId)
  scope: registry
  properties: {
    roleDefinitionId: roleDefinitionResourceId
    principalId: principalId
    principalType: principalType
  }
}
