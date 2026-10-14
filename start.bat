@echo off
cd /d %~dp0

echo ============================================
echo   Stardew Login Backend - start (build + run)
echo ============================================

if not defined JAVA_HOME (
  if exist "C:\Program Files\Zulu\zulu-21" set "JAVA_HOME=C:\Program Files\Zulu\zulu-21"
)

echo [1/3] 检查并初始化 MySQL 数据库 stardew ...
set "MYSQL=mysql"
"mysql" --version >nul 2>&1 || set "MYSQL=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
"%MYSQL%" --version >nul 2>&1
if errorlevel 1 (
  echo     [警告] 未找到 MySQL 客户端，无法自动初始化数据库。
  echo            请确认已安装 MySQL，且 bin 目录在 PATH 或脚本路径正确。
)
net start MySQL80 >nul 2>&1
net start MySQL >nul 2>&1
"%MYSQL%" -uroot -p123456 -e "CREATE DATABASE IF NOT EXISTS stardew DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" >nul 2>&1
"%MYSQL%" -uroot -p123456 stardew -N -e "SELECT 1 FROM user LIMIT 1" >nul 2>&1
if errorlevel 1 (
  echo     未检测到 user 表，执行 stardew_init.sql 初始化 ...
  "%MYSQL%" -uroot -p123456 stardew < stardew_init.sql >nul 2>&1
) else (
  echo     user 表已存在，跳过初始化（保留已有数据）
)

echo [2/3] 使用 Maven 重新打包后端（target 每次开机被清空，必须重新构建）...
if exist "target\springBootTest-0.0.1-SNAPSHOT.jar" (
  echo     target jar 已存在，跳过重新打包（如需强制重建请先删除 target 文件夹）
) else (
  if not exist mvnw.cmd (
    echo     mvnw.cmd 不存在，请确认项目完整。
    pause
    exit /b 1
  )
  call mvnw.cmd package -DskipTests -q
  if errorlevel 1 (
    echo     打包失败，请检查 Maven 或网络是否可用。
    pause
    exit /b 1
  )
)

echo [3/3] 启动后端（端口 8081）...
netstat -ano | findstr ":8081" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
  echo     端口 8081 已被占用，请先运行 stop.bat 停止旧进程。
  pause
  exit /b 1
)
start "StardewBackend" javaw -jar target\springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081
echo 启动完成！浏览器访问： http://localhost:8081/
