@echo off
chcp 936 >nul
setlocal
title 小黄人项目 - 一键启动

rem ============================================================
rem  两个项目的绝对路径：换电脑 / 挪目录，只改下面这两行
rem ============================================================
set "BACK_DIR=D:\workSpace\springBootTest"
set "FRONT_DIR=C:\Users\Administrator\Desktop\hong-main (1)\hong-main\minion-vue"

set "BACK_HEALTH=http://localhost:8080/api/health"
set "FRONT_HEALTH=http://localhost:5173/api/health"
set "FRONT_PAGE=http://localhost:5173/"

set "HAS_CURL="
where curl >nul 2>nul && set "HAS_CURL=1"

echo ============================================================
echo   小黄人项目 · 一键启动
echo     后端 Spring Boot  -^>  8080
echo     前端 Vue + Vite    -^>  5173
echo ============================================================
echo.

rem ---------- 0. 两个目录都得在 ----------
if not exist "%BACK_DIR%\start.bat" (
  echo [错误] 找不到后端： "%BACK_DIR%\start.bat"
  echo        挪过位置的话，改本脚本开头的 BACK_DIR。
  echo.
  pause
  exit /b 1
)
if not exist "%FRONT_DIR%\start.bat" (
  echo [错误] 找不到前端： "%FRONT_DIR%\start.bat"
  echo        挪过位置的话，改本脚本开头的 FRONT_DIR。
  echo.
  pause
  exit /b 1
)

rem ---------- 1. MySQL 起码得活着 ----------
netstat -ano | findstr /C:":3306 " | findstr "LISTENING" >nul
if errorlevel 1 (
  echo [警告] 3306 没在监听，MySQL 可能没启动，后端会连不上库。
  echo.
)

rem ---------- 2. 后端 ----------
set "BACK_SKIP="
netstat -ano | findstr /C:":8080 " | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo [跳过] 8080 已经有服务在跑，不重复启动后端。
  set "BACK_SKIP=1"
) else (
  echo [1/2] 正在新窗口里启动后端 ...（首次要打包，可能等 1-3 分钟）
  start "小黄人 - 后端 8080" /D "%BACK_DIR%" cmd /k start.bat
)

call :wait_http "%BACK_HEALTH%" 8080 "后端 8080" 300
if errorlevel 1 goto failed

rem ---------- 3. 前端 ----------
echo.
netstat -ano | findstr /C:":5173 " | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo [跳过] 5173 已经有服务在跑，不重复启动前端。
) else (
  echo [2/2] 正在新窗口里启动前端 ...
  start "小黄人 - 前端 5173" /D "%FRONT_DIR%" cmd /k start.bat
)

call :wait_http "%FRONT_HEALTH%" 5173 "前端 5173（含 vite 代理）" 300
if errorlevel 1 goto failed

rem ---------- 4. 开浏览器 ----------
echo.
echo 打开浏览器 ...
start "" "%FRONT_PAGE%"

echo.
echo ============================================================
echo   全部就绪
echo     页面      %FRONT_PAGE%
echo     测试账号  13800000000 / 123456
echo     停止服务  双击「小黄人项目-一键停止.bat」
echo ============================================================
echo.
pause
exit /b 0

:failed
echo.
echo ------------------------------------------------------------
echo   有服务没起来。按顺序查：
echo     1. 看刚才弹出的那个窗口里最后几行报错
echo     2. 后端单独跑：  cd /d "%BACK_DIR%"   ^&^& start.bat
echo     3. 前端单独跑：  cd /d "%FRONT_DIR%"  ^&^& start.bat
echo   常见原因：MySQL 没启动、依赖没下完、8080/5173 被别人占了
echo ------------------------------------------------------------
echo.
pause
exit /b 1

rem ============================================================
rem  等待某个地址返回健康信息（最多等 %4 秒，每 2 秒探一次）
rem  %1=地址  %2=端口  %3=显示名  %4=超时秒数
rem ============================================================
:wait_http
set /a _elapsed=0
:wait_http_loop
ping -n 3 127.0.0.1 >nul
set /a _elapsed+=2
if defined HAS_CURL (
  curl -s --max-time 3 %~1 2>nul | findstr /C:"banana" >nul
  if not errorlevel 1 (
    echo    [OK]   %~3 已就绪
    exit /b 0
  )
) else (
  netstat -ano | findstr /C:":%2 " | findstr "LISTENING" >nul
  if not errorlevel 1 (
    echo    [OK]   %~3 端口已监听
    exit /b 0
  )
)
if %_elapsed% geq %4 (
  echo    [超时] %~3 等了 %4 秒还没就绪
  exit /b 1
)
goto wait_http_loop
