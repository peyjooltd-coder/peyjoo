# PM2 background setup - run as Administrator for Windows startup
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "=== Divar Vancouver - Background setup ===" -ForegroundColor Cyan

$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) {
    $env:Path = $nodeDir + ";" + $env:Path
}

Write-Host ("Node: " + (node -v))

if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "Installing PM2 globally..."
    npm install -g pm2
}

Write-Host "Rebuilding better-sqlite3..."
npm run fix:sqlite

if (-not (Test-Path "dist\index.html")) {
    Write-Host "First production build..."
    npm run build
}

Write-Host "Starting PM2 apps..."
$prevErr = $ErrorActionPreference
$ErrorActionPreference = "Continue"
pm2 delete divar-api 2>&1 | Out-Null
pm2 delete divar-web 2>&1 | Out-Null
pm2 delete divar-rebuild 2>&1 | Out-Null
$ErrorActionPreference = $prevErr
pm2 start ecosystem.config.cjs
pm2 save

Write-Host ""
Write-Host "Installing Windows startup (needs Admin)..." -ForegroundColor Yellow
try {
    pm2 install pm2-windows-startup 2>$null
    pm2-startup install
    pm2 save
    Write-Host "Windows startup: OK" -ForegroundColor Green
}
catch {
    Write-Host "Startup skipped - run as Administrator for auto-start on boot" -ForegroundColor Yellow
}

Write-Host ""
pm2 status
Write-Host ""
Write-Host "App: http://142.44.160.190:15173/" -ForegroundColor Green
Write-Host "Logs: npm run bg:logs" -ForegroundColor Gray
Write-Host "Stop: npm run bg:stop" -ForegroundColor Gray
