param name string
param principalId string
param principalType string

resource vault 'Microsoft.KeyVault/vaults@2023-02-01' existing = {
  name: name
}

// Assign RBAC roles even though we're currently not using RBAC
var keyVaultReaderRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '21090545-7ca7-4776-b22c-e363652d74d2')
resource SecretReaderRole 'Microsoft.Authorization/roleAssignments@2020-08-01-preview' = {
  name: guid(vault.id, principalId, keyVaultReaderRoleId)
  scope: vault
  properties: {
    roleDefinitionId: keyVaultReaderRoleId
    principalId: principalId
    principalType: principalType
  }
}

// Assign access policy
resource keyVaultAccessPolicy 'Microsoft.KeyVault/vaults/accessPolicies@2022-07-01' = {
  name: 'add'
  parent: vault
  properties: {
    accessPolicies: [
      {
        objectId: principalId
        tenantId: tenant().tenantId
        permissions: {
          keys: ['List', 'Get']
          secrets: ['List', 'Get']
          certificates: ['List', 'Get']
        }
      }
    ]
  }
}
