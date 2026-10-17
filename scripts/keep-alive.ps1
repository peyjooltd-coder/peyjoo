# Keep peyjoo.com origin processes alive. Safe to run repeatedly.
$ErrorActionPreference = "Continue"
$env:PM2_HOME = "C:\Users\Administrator\.pm2"
$env:Path = "C:\Program Files\nodejs;C:\Users\Administrator\AppData\Roaming\npm;" + $env:Path
$pm2 = "C:\Users\Administrator\AppData\Roaming\npm\pm2.cmd"
$log = "C:\Users\Administrator\.pm2\peyjoo-keepalive.log"

function Write-KeepLog([string]$msg) {
  $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg"
  Add-Content -Path $log -Value $line -ErrorAction SilentlyContinue
}

function Test-Url([string]$url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 8
    return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500)
  } catch {
    return $false
  }
}

try { Import-Module WebAdministration -ErrorAction SilentlyContinue } catch {}

$site = $null
try { $site = Get-Website -Name "peyjoo" -ErrorAction SilentlyContinue } catch {}
if ($site -and $site.State -ne "Started") {
  Start-Website -Name "peyjoo" -ErrorAction SilentlyContinue
  Write-KeepLog "Started IIS site peyjoo"
}

$pool = $null
try { $pool = Get-WebAppPoolState -Name "peyjoo" -ErrorAction SilentlyContinue } catch {}
if ($pool -and $pool.Value -ne "Started") {
  Start-WebAppPool -Name "peyjoo" -ErrorAction SilentlyContinue
  Write-KeepLog "Started IIS pool peyjoo"
}

$apiOk = Test-Url "http://127.0.0.1:13001/api/health"
$webOk = Test-Url "http://127.0.0.1:15173/api/health"
$djangoOk = Test-Url "http://127.0.0.1:8000/manage/login/"

if (-not $apiOk -or -not $webOk) {
  if (Test-Path $pm2) {
    if (-not $apiOk) {
      & $pm2 restart divar-api
      Write-KeepLog "Restarted divar-api (health failed)"
      Start-Sleep -Seconds 4
    }
    if (-not (Test-Url "http://127.0.0.1:15173/api/health")) {
      & $pm2 restart divar-web
      Write-KeepLog "Restarted divar-web (health failed)"
    }
  } else {
    Write-KeepLog "pm2.cmd missing"
  }
}

if (-not $djangoOk -and (Test-Path $pm2)) {
  & $pm2 restart peyjoo-django
  Start-Sleep -Seconds 4
  if (-not (Test-Url "http://127.0.0.1:8000/manage/login/")) {
    $eco = "C:\Users\Administrator\Documents\divarvanciver\divarvanciver\divarvanciver\ecosystem.config.cjs"
    & $pm2 start $eco --only peyjoo-django
    & $pm2 save
    Write-KeepLog "Started peyjoo-django (health failed)"
  } else {
    Write-KeepLog "Restarted peyjoo-django (health failed)"
  }
}
