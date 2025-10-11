# Azure Deployment Guide for AiLootGenerator API

This document provides step-by-step instructions for deploying the AiLootGenerator .NET 8.0 Web API to Azure App Service.

## Prerequisites

- Azure CLI installed on your machine
- .NET 8.0 SDK installed
- An active Azure subscription
- OpenAI API key
- Qdrant instance (cloud or self-hosted)

## Step 1: Azure CLI Login

First, authenticate with Azure using the Azure CLI:

```bash
az login
```

This will open a browser window for authentication. After successful login, you'll see your subscription details.

### Optional: Set Default Subscription (if you have multiple)

```bash
az account list --output table
az account set --subscription "your-subscription-id"
```

## Step 2: Create Resource Group

Create a resource group to contain all your Azure resources:

```bash
az group create --name AiLootGeneratorRG --location "West Europe"
```

## Step 3: Create Azure App Service Resources

### Create App Service Plan (Free Tier)

```bash
az appservice plan create --name ailootgenerator-plan --resource-group AiLootGeneratorRG --sku F1
```

**Note:** We use Windows App Service because .NET 8.0 is not yet available on Linux App Service at the time of this writing.

### Create Web App

```bash
az webapp create --resource-group AiLootGeneratorRG --plan ailootgenerator-plan --name ailootgenerator-api
```

### Configure Web App for .NET 8.0

```bash
az webapp config set --resource-group AiLootGeneratorRG --name ailootgenerator-api --net-framework-version v8.0
```

## Step 4: Configure Application Settings

### Set OpenAI Configuration

Replace `your-openai-api-key-here` with your actual OpenAI API key:

```bash
az webapp config appsettings set --resource-group AiLootGeneratorRG --name ailootgenerator-api --settings "OpenAI__ApiKey=your-openai-api-key-here" "OpenAI__ChatModel=gpt-4o-mini" "OpenAI__EmbeddingModel=text-embedding-3-small"
```

### Set Qdrant Configuration

**For Qdrant Cloud:**

```bash
az webapp config appsettings set --resource-group AiLootGeneratorRG --name ailootgenerator-api --settings "Qdrant__Host=your-qdrant-cloud-url" "Qdrant__Port=6333" "Qdrant__UseHttps=true" "Qdrant__CollectionName=warhammer_lore" "Qdrant__MaxSearchResults=5" "Qdrant__SimilarityThreshold=0.7"
```

**For Local/Self-hosted Qdrant:**

```bash
az webapp config appsettings set --resource-group AiLootGeneratorRG --name ailootgenerator-api --settings "Qdrant__Host=your-qdrant-host" "Qdrant__Port=6334" "Qdrant__UseHttps=false" "Qdrant__CollectionName=warhammer_lore" "Qdrant__MaxSearchResults=5" "Qdrant__SimilarityThreshold=0.7"
```

## Step 5: Prepare Application for Deployment

### Navigate to Backend Directory

```bash
cd c:\Dev\AiLootGenerator\backend\src
```

### Build and Publish Application

```bash
dotnet publish --configuration Release --output ./publish
```

### Create Deployment Package

```bash
Compress-Archive -Path "./publish/*" -DestinationPath "./deployment.zip" -Force
```

## Step 6: Deploy Application

Deploy the application package to Azure:

```bash
az webapp deployment source config-zip --resource-group AiLootGeneratorRG --name ailootgenerator-api --src "./deployment.zip"
```

## Step 7: Verify Deployment

### Test Health Endpoint

```bash
curl https://ailootgenerator-api.azurewebsites.net/api/health
```

Expected response:

```json
{
  "status": "Healthy",
  "timestamp": "2025-10-11T16:43:37.0802927Z",
  "services": {
    "openAI": "Healthy",
    "qdrant": "Healthy"
  }
}
```

### Access Swagger UI

Open your browser and navigate to:

```
https://ailootgenerator-api.azurewebsites.net/swagger/index.html
```

## Alternative Deployment Methods

### Option 1: Using Visual Studio Publish Profile

1. Right-click the project in Visual Studio
2. Select "Publish"
3. Choose "Azure App Service (Windows)"
4. Select your subscription and resource group
5. Choose your existing App Service
6. Click "Publish"

### Option 2: Using GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: windows-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: 8.0.x

      - name: Build and publish
        run: |
          cd backend/src
          dotnet publish -c Release -o publish

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: "ailootgenerator-api"
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: "./backend/src/publish"
```

## Monitoring and Logs

### View Application Logs

```bash
az webapp log tail --resource-group AiLootGeneratorRG --name ailootgenerator-api
```

### Download Log Files

```bash
az webapp log download --resource-group AiLootGeneratorRG --name ailootgenerator-api
```

## Configuration Management

### Environment-Specific Settings

The application uses different configuration files:

- `appsettings.json` - Base configuration
- `appsettings.Development.json` - Development overrides
- `appsettings.Production.json` - Production overrides

### Updating Configuration

To update app settings after deployment:

```bash
az webapp config appsettings set --resource-group AiLootGeneratorRG --name ailootgenerator-api --settings "SettingName=SettingValue"
```

## Cost Management

### Free Tier Limitations

The F1 (Free) App Service plan includes:

- 1 GB storage
- 165 minutes/day compute time
- Custom domains not supported
- No auto-scaling
- No deployment slots

### Scaling Up (if needed)

To upgrade to a paid plan:

```bash
az appservice plan update --name ailootgenerator-plan --resource-group AiLootGeneratorRG --sku B1
```

## Troubleshooting

### Common Issues

1. **Application won't start**

   - Check application logs: `az webapp log tail`
   - Verify .NET version configuration
   - Check application settings

2. **CORS Issues**

   - Verify CORS policy in `Program.cs`
   - Ensure frontend URL is in allowed origins

3. **Database Connection Issues**

   - Verify Qdrant configuration
   - Check OpenAI API key validity

4. **Deployment Failures**
   - Ensure deployment package is not corrupted
   - Check available storage space
   - Verify resource group and app service names

### Health Check Troubleshooting

If health check shows "Unhealthy":

- **OpenAI Unhealthy**: Check API key configuration
- **Qdrant Unhealthy**: Verify Qdrant host and port settings

## Security Considerations

1. **API Keys**: Never commit API keys to source control
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS appropriately for your frontend domains
4. **Authentication**: Consider implementing authentication for production use

## Useful Commands

### Stop/Start Web App

```bash
az webapp stop --resource-group AiLootGeneratorRG --name ailootgenerator-api
az webapp start --resource-group AiLootGeneratorRG --name ailootgenerator-api
```

### Restart Web App

```bash
az webapp restart --resource-group AiLootGeneratorRG --name ailootgenerator-api
```

### Delete Resources (Cleanup)

```bash
az group delete --name AiLootGeneratorRG --yes
```

## URLs and Endpoints

After successful deployment:

- **API Base URL**: `https://ailootgenerator-api.azurewebsites.net`
- **Health Check**: `https://ailootgenerator-api.azurewebsites.net/api/health`
- **Swagger UI**: `https://ailootgenerator-api.azurewebsites.net/swagger/index.html`
- **Swagger JSON**: `https://ailootgenerator-api.azurewebsites.net/swagger/v1/swagger.json`

## Next Steps

1. Set up custom domain (if needed)
2. Configure SSL certificate
3. Set up monitoring and alerts
4. Implement CI/CD pipeline
5. Configure backup strategy
6. Set up staging environment

---

_Last updated: October 11, 2025_
_API Version: .NET 8.0_
_Azure App Service: Windows, Free Tier_
