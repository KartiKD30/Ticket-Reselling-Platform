@echo off
echo Starting Unified Ticket Platform...
echo ================================

REM Start Backend Server
echo Starting Backend Server on port 5000...
start "Backend Server" cmd /k "node server.js"

REM Wait for backend to start
timeout /t 3 /nobreak > nul

REM Start User Dashboard
echo Starting User Dashboard on port 5173...
start "User Dashboard" cmd /k "cd client && npm run dev"

REM Wait for user dashboard to start
timeout /t 2 /nobreak > nul

REM Start Admin Dashboard
echo Starting Admin Dashboard on port 3001...
start "Admin Dashboard" cmd /k "cd admin-app && npm run dev"

REM Wait for admin dashboard to start
timeout /t 2 /nobreak > nul

REM Start Organizer Dashboard
echo Starting Organizer Dashboard on port 3002...
start "Organizer Dashboard" cmd /k "cd organizer-app && npm run dev"

echo.
echo ================================
echo All applications started!
echo ================================
echo Backend API:     http://localhost:5000
echo User Dashboard:  http://localhost:5173
echo Admin Dashboard: http://localhost:3001
echo Organizer Dashboard: http://localhost:3002
echo.
echo Close this window to stop all applications
pause
