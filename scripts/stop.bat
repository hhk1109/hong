@echo off
chcp 936 >nul
setlocal

echo Stopping frontend (5173)...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1

echo Stopping backend (8081)...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if errorlevel 1 (echo   [ OK ] Frontend stopped.) else (echo   [WARN] Frontend still running.)
netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
if errorlevel 1 (echo   [ OK ] Backend stopped.) else (echo   [WARN] Backend still running.)
echo Done.
endlocal
