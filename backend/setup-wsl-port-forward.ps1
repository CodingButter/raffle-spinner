# PowerShell script to set up port forwarding from Windows to WSL2
# Run this in Windows PowerShell as Administrator

Write-Host "Setting up port forwarding for Directus..." -ForegroundColor Green

# Get WSL2 IP address
$wslIp = (wsl hostname -I).Trim().Split()[0]
Write-Host "WSL2 IP: $wslIp" -ForegroundColor Cyan

# Remove existing port proxy if it exists
Write-Host "Removing existing port proxy..." -ForegroundColor Yellow
netsh interface portproxy delete v4tov4 listenport=8055 listenaddress=0.0.0.0 2>$null

# Add port forwarding
Write-Host "Adding port forwarding from 0.0.0.0:8055 to ${wslIp}:8055..." -ForegroundColor Yellow
netsh interface portproxy add v4tov4 listenport=8055 listenaddress=0.0.0.0 connectport=8055 connectaddress=$wslIp

# Check if firewall rule exists
$firewallRule = Get-NetFirewallRule -DisplayName "WSL2 Directus" -ErrorAction SilentlyContinue

if ($firewallRule) {
    Write-Host "Firewall rule already exists" -ForegroundColor Green
} else {
    Write-Host "Creating firewall rule..." -ForegroundColor Yellow
    New-NetFirewallRule -DisplayName "WSL2 Directus" -Direction Inbound -Protocol TCP -LocalPort 8055 -Action Allow
}

# Show current port proxy rules
Write-Host "`nCurrent port forwarding rules:" -ForegroundColor Green
netsh interface portproxy show v4tov4

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "Directus should now be accessible at:" -ForegroundColor Cyan
Write-Host "  - http://192.168.1.245:8055 (from your network)" -ForegroundColor White
Write-Host "  - http://localhost:8055 (from Windows)" -ForegroundColor White

# Test the connection
Write-Host "`nTesting connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8055/server/info" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Connection successful!" -ForegroundColor Green
    }
} catch {
    Write-Host "Connection failed. Make sure Directus is running in WSL2." -ForegroundColor Red
    Write-Host "Run in WSL2: cd /home/codingbutter/GitHub/raffle-spinner/backend" -ForegroundColor Yellow
    Write-Host "Then run: docker compose up -d" -ForegroundColor Yellow
}