# WSL2 Port Forwarding for Directus

## The Problem

WSL2 runs in a virtual network that's not directly accessible from other machines on your LAN. Your nginx proxy manager at 192.168.1.215 cannot reach the WSL2 instance directly.

## The Solution

You need to forward port 8055 from Windows (192.168.1.245) to WSL2's internal IP.

## Quick Setup

### Option 1: Run PowerShell Script (Easiest)

1. Open **Windows PowerShell as Administrator**
2. Navigate to your project:
   ```powershell
   cd C:\Users\[YourUsername]\GitHub\raffle-spinner\backend
   ```
3. Run the setup script:
   ```powershell
   .\setup-wsl-port-forward.ps1
   ```

### Option 2: Manual Commands

Run these commands in **Windows PowerShell as Administrator**:

```powershell
# Get WSL2 IP
$wslIp = (wsl hostname -I).Split()[0]

# Set up port forwarding
netsh interface portproxy add v4tov4 listenport=8055 listenaddress=0.0.0.0 connectport=8055 connectaddress=$wslIp

# Allow through firewall
New-NetFirewallRule -DisplayName "WSL2 Directus" -Direction Inbound -Protocol TCP -LocalPort 8055 -Action Allow
```

## Verify It's Working

After setup, test from another machine on your network:
```bash
curl http://192.168.1.245:8055/server/info
```

Or configure your nginx proxy manager at 192.168.1.215 to proxy to:
- **Host**: 192.168.1.245
- **Port**: 8055

## Important Notes

1. **WSL2 IP Changes**: The WSL2 IP can change when Windows restarts. You may need to run the script again after a reboot.

2. **Automatic Setup on Boot**: To make this permanent, create a Windows Task Scheduler task that runs the PowerShell script at startup.

3. **Check Current Forwarding Rules**:
   ```powershell
   netsh interface portproxy show v4tov4
   ```

4. **Remove Port Forwarding**:
   ```powershell
   netsh interface portproxy delete v4tov4 listenport=8055 listenaddress=0.0.0.0
   ```

## Nginx Proxy Manager Configuration

Once port forwarding is set up, configure your Nginx Proxy Manager:

1. Create a new proxy host
2. Domain: `admin.drawday.app`
3. Forward to: `http://192.168.1.245:8055`
4. Enable WebSocket support if needed

## Alternative: Use Docker Desktop

If port forwarding is too complex, consider installing Docker Desktop for Windows, which handles networking automatically and makes containers accessible from your LAN without additional configuration.