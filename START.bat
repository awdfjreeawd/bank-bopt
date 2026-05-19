@echo off
chcp 65001 >nul
title Nebula — запуск
cd /d "%~dp0"

echo === Nebula Casino + Bank ===
echo.

start "Nebula API" cmd /k "cd /d %~dp0server && npm run start"
timeout /t 2 /nobreak >nul
start "Nebula Web" cmd /k "cd /d %~dp0web && npm run dev"

echo.
echo API:  http://localhost:3847
echo Web:  http://localhost:5173
echo.
echo Для десктопа после запуска web: cd desktop ^&^& npm start
echo Для Telegram: настрой bot\.env и npm start в папке bot
echo.
pause
