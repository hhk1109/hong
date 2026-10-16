@echo off
chcp 936 >nul
setlocal
cd /d "%~dp0"
set "LOG=%~dp0diag-progress.log"
echo START > "%LOG%"

set "JAVA=C:/Program Files\Zulu\zulu-21\bin\java.exe"
set "JAVAW=C:/Program Files\Zulu\zulu-21\bin\javaw.exe"
set "MVN=C:/Users/Administrator/.m2/wrapper/dists/apache-maven-3.9.9-bin/4nf9hui3q3djbarqar9g711ggc/apache-maven-3.9.9/bin/mvn.cmd"
echo STEP1-vars >> "%LOG%"

if not exist "%MVN%" ( echo STEP2-mvn-missing >> "%LOG%" ) else ( echo STEP2-mvn-ok >> "%LOG%" )

netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if errorlevel 1 ( echo STEP3-mysql-down >> "%LOG%" ) else ( echo STEP3-mysql-ok >> "%LOG%" )

set "MYSQL=C:/Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
"%MYSQL%" -uroot -p123456 -e "USE stardew; SELECT 1 FROM user LIMIT 1;" >nul 2>&1
if errorlevel 1 ( echo STEP4-sql-fail >> "%LOG%" ) else ( echo STEP4-sql-ok >> "%LOG%" )

cd /d "%~dp0springBootTest-backend"
if exist "target\springBootTest-0.0.1-SNAPSHOT.jar" ( echo STEP5-target-ok >> "%LOG%" ) else ( echo STEP5-target-missing >> "%LOG%" )

netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
if not errorlevel 1 ( echo STEP6-port-occupied >> "%LOG%" ) else ( echo STEP6-port-free >> "%LOG%" )

set "SERVER__PORT="
set "SERVER__HOST="
start "" "%JAVAW%" -Dfile.encoding=UTF-8 -jar target\springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081 > backend.log 2>&1
echo STEP7-javaw-launched >> "%LOG%"

ping -n 6 127.0.0.1 >nul
netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
if errorlevel 1 ( echo STEP8-8081-down >> "%LOG%" ) else ( echo STEP8-8081-up >> "%LOG%" )
echo DONE >> "%LOG%"
endlocal
