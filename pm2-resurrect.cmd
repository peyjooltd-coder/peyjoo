@echo off
set PM2_HOME=C:\Users\Administrator\.pm2
set PATH=C:\Program Files\nodejs;C:\Users\Administrator\AppData\Roaming\npm;%PATH%
cd /d C:\Users\Administrator\Documents\divarvanciver\divarvanciver\divarvanciver
"C:\Users\Administrator\AppData\Roaming\npm\pm2.cmd" resurrect
if errorlevel 1 (
  "C:\Users\Administrator\AppData\Roaming\npm\pm2.cmd" start ecosystem.config.cjs
)
"C:\Users\Administrator\AppData\Roaming\npm\pm2.cmd" save
