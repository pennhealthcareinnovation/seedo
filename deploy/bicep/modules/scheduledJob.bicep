param location string
param jobName string
param prefix string
param appName string
param envShortName string
param managedIdentityId string
param containerAppEnvId string
param containerRegistryFQDN string
param imageTag string
param env array
param cronExpression string
param command array

resource jobTasks 'Microsoft.App/jobs@2023-05-01' = {
  location: location
  name: '${prefix}-${appName}-${envShortName}-${jobName}'
  tags: { environment: envShortName }
  identity: {
    type: 'SystemAssigned, UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    environmentId: containerAppEnvId
    configuration: {
      triggerType: 'Schedule'
      scheduleTriggerConfig: {
        cronExpression: cronExpression
        parallelism: 1
        replicaCompletionCount: 1
      }
      replicaTimeout: 60 * 60
      replicaRetryLimit: 1
      registries: [{ server: containerRegistryFQDN, identity: managedIdentityId }]
    }
    template: {
      containers: [{
        name: 'server'
        image: '${containerRegistryFQDN}/${appName}-server:${imageTag}'
        command: command
        resources: {
          cpu: json('0.5')
          memory: '1Gi'
        }
        env: env
      }]
    }
  }
}
