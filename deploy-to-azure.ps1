# Azure Deployment Script for GitHub Student Pack Users
# Make sure Azure CLI is installed: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

Write-Host "🚀 Starting Azure deployment for Agentic-XAI..." -ForegroundColor Green

# Set variables (you can customize these)
$resourceGroup = "agentic-xai-rg"
$appName = "agentic-xai-$(Get-Random -Maximum 9999)"  # Unique name
$location = "East US"
$planName = "agentic-xai-plan"

Write-Host "📝 App name will be: $appName" -ForegroundColor Yellow

# Check if already logged in
Write-Host "🔑 Checking Azure login..." -ForegroundColor Blue
$account = az account show 2>$null
if (!$account) {
    Write-Host "❌ Not logged in. Please login with your student account..." -ForegroundColor Red
    az login
} else {
    Write-Host "✅ Already logged in to Azure" -ForegroundColor Green
}

# Create resource group
Write-Host "📦 Creating resource group..." -ForegroundColor Blue
az group create --name $resourceGroup --location $location

# Create App Service Plan (Free tier)
Write-Host "💰 Creating App Service Plan (Free tier)..." -ForegroundColor Blue
az appservice plan create --name $planName --resource-group $resourceGroup --sku F1 --is-linux

# Create Web App
Write-Host "🌐 Creating Web App..." -ForegroundColor Blue
az webapp create --resource-group $resourceGroup --plan $planName --name $appName --runtime "PYTHON|3.11"

# Configure startup command
Write-Host "⚙️ Configuring startup command..." -ForegroundColor Blue
az webapp config set --resource-group $resourceGroup --name $appName --startup-file "python app.py"

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Blue
az webapp config appsettings set --resource-group $resourceGroup --name $appName --settings GOOGLE_API_KEY="AIzaSyA2TmD3yc-yJrCafcVCcLUHVkvKreKrCU8"

# Deploy code
Write-Host "📤 Deploying code..." -ForegroundColor Blue
az webapp up --name $appName --resource-group $resourceGroup --location $location --runtime "PYTHON:3.11"

Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Your API is available at: https://$appName.azurewebsites.net" -ForegroundColor Cyan
Write-Host "🧪 Test endpoint: https://$appName.azurewebsites.net/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Test your API: https://$appName.azurewebsites.net/health" -ForegroundColor White
Write-Host "2. Update Vercel frontend with: REACT_APP_API_BASE=https://$appName.azurewebsites.net" -ForegroundColor White
Write-Host "3. Redeploy frontend on Vercel" -ForegroundColor White 