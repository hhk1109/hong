@echo off
echo Creating logon scheduled task for Stardew backend...
schtasks /create /tn "StardewBackend" /sc onlogon /tr "\"C:\Users\Administrator\Desktop\hong-main\springBootTest-backend\start.bat\"" /rl highest /f
if errorlevel 1 (
  echo FAILED: run this as Administrator, or schtasks is blocked in this environment.
) else (
  echo OK: task 'StardewBackend' created; backend will auto-start on next logon.
)
pause
