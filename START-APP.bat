@echo off
title Switch My House - local app
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed yet.
  echo  1. Go to https://nodejs.org
  echo  2. Click the big green LTS download button
  echo  3. Run the installer, click Next until Finish
  echo  4. Double-click this file again
  echo.
  pause
  exit /b
)
if not exist node_modules (
  echo First run - downloading packages. Takes a few minutes. Please wait...
  call npm install --no-audit --no-fund
)
echo Starting the app - your browser will open in a moment...
start "" http://localhost:3000
echo.
echo  KEEP THIS BLACK WINDOW OPEN while you use the app.
echo  Close it (or press Ctrl+C) to stop the app.
echo.
call npm run dev
pause
