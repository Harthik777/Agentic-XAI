# Manual Azure Deployment Script
# This script deploys the application to Azure App Service

Write-Host "🚀 Starting manual deployment to Azure..." -ForegroundColor Green

# Check if Azure CLI is available
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✅ Azure CLI found: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install Azure CLI first." -ForegroundColor Red
    Write-Host "Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Azure
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Azure. Please run: az login" -ForegroundColor Red
    exit 1
}

# Deploy to Azure
Write-Host "📦 Deploying to Azure App Service..." -ForegroundColor Yellow

try {
    az webapp deployment source config-zip --resource-group agentic-xai-rg --name agentic-xai-401 --src . --output json
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your app is available at: https://agentic-xai-401.azurewebsites.net" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Deployment failed. Please check the error above." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green 