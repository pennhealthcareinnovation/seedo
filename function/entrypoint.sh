echo "Azure login.."
az login \
  --output none \
  --service-principal \
  --tenant $AZURE_TENANT_ID \
  --username $AZURE_CLIENT_ID \
  --password $AZURE_CLIENT_SECRET

echo "Azure Function deploy.."
az functionapp deployment source config-zip \
  --resource-group $AZURE_RESOURCE_GROUP \
  --name $AZURE_FUNCTION_APP_NAME \
  --src /home/node/deploy_package.zip