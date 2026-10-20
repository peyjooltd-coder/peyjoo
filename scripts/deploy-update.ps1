# PeyJoo — pull latest main, build, restart PM2
# Run in PowerShell on the Windows server (as Administrator if needed).

$ErrorActionPreference = "Stop"

# Try common repo paths
$candidates = @(
  "C:\Users\Administrator\Documents\divarvanciver\divarvanciver",
  "C:\Users\Administrator\Documents\divarvanciver\peyjoo",
  "C:\Users\Administrator\Documents\peyjoo",
  "C:\peyjoo",
  (Get-Location).Path
)

$root = $null
foreach ($p in $candidates) {
  if (Test-Path (Join-Path $p "package.json")) {
    if (Test-Path (Join-Path $p "src\pages\DatingPage.jsx")) {
      $root = $p
      break
    }
  }
}

if (-not $root) {
  Write-Host "ERROR: peyjoo repo not found. cd into the repo folder and run again." -ForegroundColor Red
  exit 1
}

Write-Host "Repo: $root" -ForegroundColor Cyan
Set-Location $root

git fetch origin
git reset --hard origin/main
$sha = (git log -1 --oneline)
Write-Host "Now at: $sha" -ForegroundColor Green

npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

if (Test-Path "server\package.json") {
  Push-Location server
  npm install --omit=dev
  Pop-Location
}

npm run bg:restart
Start-Sleep -Seconds 2
npm run bg:status

Write-Host ""
Write-Host "DONE. Open https://peyjoo.com and hard-refresh." -ForegroundColor Green
Write-Host "Expected commit tip: $sha" -ForegroundColor Green
Write-Host "If Dating profile card still top: close iOS app fully and reopen." -ForegroundColor Yellow
