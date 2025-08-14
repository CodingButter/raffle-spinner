# PowerShell script to open Windows Firewall for Directus
# Run this in Windows PowerShell as Administrator

Write-Host "Configuring Windows Firewall for Directus..." -ForegroundColor Green

# Remove existing rules if any
Write-Host "Removing old firewall rules..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "WSL2 Directus" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "WSL2 Directus Inbound" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "WSL2 Directus Outbound" -ErrorAction SilentlyContinue

# Create comprehensive firewall rules
Write-Host "Creating firewall rules..." -ForegroundColor Yellow

# Inbound rule for port 8055
New-NetFirewallRule -DisplayName "WSL2 Directus Inbound" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8055 `
    -Action Allow `
    -Profile Any `
    -Enabled True

# Also create a rule for the specific program if Docker Desktop is installed
$dockerPath = "${env:ProgramFiles}\Docker\Docker\resources\com.docker.backend.exe"
if (Test-Path $dockerPath) {
    New-NetFirewallRule -DisplayName "Docker Backend for Directus" `
        -Direction Inbound `
        -Program $dockerPath `
        -Action Allow `
        -Profile Any `
        -Enabled True
    Write-Host "Added Docker Desktop firewall rule" -ForegroundColor Green
}

# Create a rule allowing all traffic from your nginx server
New-NetFirewallRule -DisplayName "Allow Nginx Proxy Manager" `
    -Direction Inbound `
    -Protocol TCP `
    -RemoteAddress 192.168.1.215 `
    -LocalPort 8055 `
    -Action Allow `
    -Profile Any `
    -Enabled True

Write-Host "`nFirewall rules created!" -ForegroundColor Green

# Test local access
Write-Host "`nTesting local access..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://192.168.1.245:8055/server/info" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Local access successful!" -ForegroundColor Green
    }
} catch {
    Write-Host "Local access failed. Checking alternative addresses..." -ForegroundColor Yellow
    
    # Try localhost
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8055/server/info" -UseBasicParsing -TimeoutSec 5
        Write-Host "Localhost access works!" -ForegroundColor Green
    } catch {
        Write-Host "Service may not be running" -ForegroundColor Red
    }
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "`nDirectus should now be accessible from:" -ForegroundColor Cyan
Write-Host "  - Your nginx proxy at 192.168.1.215" -ForegroundColor White
Write-Host "  - Any device on your network at http://192.168.1.245:8055" -ForegroundColor White
Write-Host "`nIf it still doesn't work, try temporarily disabling Windows Defender Firewall to test:" -ForegroundColor Yellow
Write-Host "  netsh advfirewall set allprofiles state off" -ForegroundColor Gray
Write-Host "  (Remember to turn it back on: netsh advfirewall set allprofiles state on)" -ForegroundColor Gray