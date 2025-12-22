# PermiPay Smart Contract Deployment Script
# Deploy PermiPayBilling with ERC-7715 Advanced Permissions Support

# Your credentials (from .env)
$PRIVATE_KEY = "d378f74dacb800344bb36165c9b89f0cb101a1a9b4c247d64d755b4fc85a6daf"
$ETHERSCAN_API_KEY = "W3GP4K6Z2Z6DNXJDZ4FEFM83STPZG1MAA3"
$TREASURY_ADDRESS = "0xYourWalletAddress"  # Replace with your actual wallet address

# Contract parameters
$USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
$SEPOLIA_RPC = "https://rpc.sepolia.org"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PermiPay Contract Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install Foundry if not installed
Write-Host "Checking Foundry installation..." -ForegroundColor Yellow
$forgeExists = Get-Command forge -ErrorAction SilentlyContinue

if (-not $forgeExists) {
    Write-Host "Foundry not found. Installing..." -ForegroundColor Yellow
    
    # Install Rust first (required for Foundry)
    Write-Host "Installing Rust..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://sh.rustup.rs" -OutFile "$env:TEMP\rustup-init.exe"
    & "$env:TEMP\rustup-init.exe" -y
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "Installing Foundry..." -ForegroundColor Yellow
    cargo install --git https://github.com/foundry-rs/foundry foundry-cli anvil cast chisel forge
    
    Write-Host "Foundry installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Foundry is already installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "Deploying PermiPayBilling_ERC7715 to Sepolia..." -ForegroundColor Yellow
Write-Host ""

# Deploy contract
$deployCommand = @"
forge create PermiPayBilling_ERC7715 ``
  --rpc-url $SEPOLIA_RPC ``
  --private-key $PRIVATE_KEY ``
  --constructor-args $USDC_SEPOLIA $TREASURY_ADDRESS ``
  --verify ``
  --etherscan-api-key $ETHERSCAN_API_KEY
"@

Write-Host "Executing: $deployCommand" -ForegroundColor Gray
Write-Host ""

# Execute deployment
Set-Location "D:\Projects\PermiPay\permipayapp\contracts"
Invoke-Expression $deployCommand

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy the deployed contract address above" -ForegroundColor White
Write-Host "2. Update .env file:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_PERMIPAY_BILLING_CONTRACT=0x..." -ForegroundColor Gray
Write-Host "3. Update src/constants/chains.ts with the address" -ForegroundColor White
Write-Host "4. Deploy ServiceRegistry contract (optional)" -ForegroundColor White
Write-Host ""
