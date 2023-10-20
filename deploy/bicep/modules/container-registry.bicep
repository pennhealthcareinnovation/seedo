param containerRegistryName string
param principalId string
param principalType string


resource registry 'Microsoft.ContainerRegistry/registries@2023-06-01-preview' existing = {
  name: containerRegistryName
}

var pullRole = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
resource AcrPullRole 'Microsoft.Authorization/roleAssignments@2020-08-01-preview' = {
  name: guid(registry.id, principalId, pullRole)
  scope: registry
  properties: {
    roleDefinitionId: pullRole
    principalId: principalId
    principalType: principalType
  }
}

var pushRole = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '8311e382-0749-4cb8-b61a-304f252e45ec')
resource AcrPushRole 'Microsoft.Authorization/roleAssignments@2020-08-01-preview' = {
  name: guid(registry.id, principalId, pushRole)
  scope: registry
  properties: {
    roleDefinitionId: pushRole
    principalId: principalId
    principalType: principalType
  }
}
