@echo off
chcp 936 >nul
setlocal
cd /d "%~dp0.."

set "JAVA=C:\Program Files\Zulu\zulu-21\bin\java.exe"
set "JAVAW=C:\Program Files\Zulu\zulu-21\bin\javaw.exe"
set "NODE=D:\Program Files\nodejs\node.exe"
if not exist "%NODE%" set "NODE=node.exe"

set "BACKEND_DIR=%~dp0..\hong-main\springBootTest-backend"
set "FRONTEND_DIR=%~dp0..\hong-main\stardew-login-page"
set "JAR=%BACKEND_DIR%\target\springBootTest-0.0.1-SNAPSHOT.jar"

echo [1/4] Checking MySQL (3306)...
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo   WARNING: MySQL is not running on port 3306. Backend may fail.
) else (
    echo   MySQL OK.
)

echo [2/4] Initializing admin tables (idempotent)...
set "MYSQL=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if exist "%MYSQL%" (
    "%MYSQL%" -uroot -p123456 --default-character-set=utf8mb4 < "%BACKEND_DIR%\sql\admin_init.sql" >nul 2>&1
    if errorlevel 1 (echo   WARNING: admin_init.sql failed, tables may be missing.) else (echo   Tables OK.)
) else (
    echo   WARNING: mysql.exe not found, skip DB init.
)

echo [3/4] Starting backend (port 8081)...
if not exist "%JAR%" (
    echo   JAR not found, building with Maven...
    call "C:\Users\Administrator\.m2\wrapper\dists\apache-maven-3.9.9-bin\4nf9hui3q3djbarqar9g711ggc\apache-maven-3.9.9\bin\mvn.cmd" -q -DskipTests -f "%BACKEND_DIR%\pom.xml" package
)
netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo   Backend already running on 8081, skip.
) else (
    start "" "%JAVAW%" -Dfile.encoding=UTF-8 -jar "%JAR%" --server.port=8081
    echo   Backend starting...
)

echo [4/4] Starting frontend (port 5173)...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo   Frontend already running on 5173, skip.
) else (
    start "stardew-frontend" /min cmd /c ""%NODE%" "%FRONTEND_DIR%\server.js""
    echo   Frontend starting...
)

timeout /t 12 /nobreak >nul
netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
if errorlevel 1 (echo   [FAIL] Backend is DOWN on 8081) else (echo   [ OK ] Backend  : http://localhost:8081)
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if errorlevel 1 (echo   [FAIL] Frontend is DOWN on 5173) else (echo   [ OK ] Frontend : http://localhost:5173)

start "" http://localhost:5173
echo Done.
endlocal
