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
  --src /root/deploy_package.zip

# substitte env templating
echo "Finalizing docker-compose.yml.."
awk '{while(match($0,"[$]{[^}]*}")) {var=substr($0,RSTART+2,RLENGTH -3);gsub("[$]{"var"}",ENVIRON[var])}}1' < docker-compose.yml > docker-compose.yml.injected
cp docker-compose.yml docker-compose.original
cp docker-compose.yml.injected docker-compose.yml

echo "Deploy App Service deploy (server, web).."
az webapp config container set \
  --resource-group $AZURE_RESOURCE_GROUP \
  --name $AZURE_APP_SERVICE_NAME \
  --multicontainer-config-type compose \
  --multicontainer-config-file docker-compose.yml