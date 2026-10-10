@echo off
rem Starts the System Design Study Plan app and opens it in your browser.
rem Keep this window open while you study; close it to stop the app.
cd /d "%~dp0app"

if not exist "node_modules\vite\bin\vite.js" (
  echo First run: installing dependencies outside OneDrive. This takes a minute...
  powershell -NoProfile -ExecutionPolicy Bypass -File "tools\install-deps.ps1"
  if errorlevel 1 (
    echo.
    echo Installing failed. Check that Node.js is installed, then run this file again.
    pause
    exit /b 1
  )
)

echo Starting the app at http://localhost:5180 ...
node "node_modules\vite\bin\vite.js" --open
if errorlevel 1 (
  echo.
  echo The app could not start. If it says port 5180 is in use, the app is probably
  echo already running in another window: open http://localhost:5180 in your browser.
  pause
)
