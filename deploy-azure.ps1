# Azure CLI Deployment Script for Students
# Make sure you have Azure CLI installed: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login to Azure (use your student email)
az login

# Create Resource Group
az group create --name "agentic-xai-rg" --location "East US"

# Create App Service Plan (Free tier for students)
az appservice plan create --name "agentic-xai-plan" --resource-group "agentic-xai-rg" --sku F1 --is-linux

# Create Web App
az webapp create --resource-group "agentic-xai-rg" --plan "agentic-xai-plan" --name "your-unique-app-name" --runtime "PYTHON|3.11" --deployment-local-git

# Set environment variables
az webapp config appsettings set --resource-group "agentic-xai-rg" --name "your-unique-app-name" --settings GOOGLE_API_KEY="AIzaSyA2TmD3yc-yJrCafcVCcLUHVkvKreKrCU8"

# Set startup command
az webapp config set --resource-group "agentic-xai-rg" --name "your-unique-app-name" --startup-file "startup.sh"

Write-Host "✅ Azure App Service created!"
Write-Host "🌐 Your app will be available at: https://your-unique-app-name.azurewebsites.net"
Write-Host "📝 Now push your code to deploy!" 