@echo off
title I Prompt

echo.
echo ================================================
echo           Starting I Prompt
echo ================================================
echo.

:: Clear port 3000 if occupied
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo Clearing port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
    timeout /t 1 >nul
)

echo Starting server and opening browser...
echo.

:: Start the server and open browser after 5 seconds
start /b timeout /t 5 >nul 2>&1 ^& start http://localhost:3000

:: Run the development server
npm run dev 