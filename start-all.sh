#!/bin/bash

echo "Starting Unified Ticket Platform..."
echo "================================"

# Start Backend Server
echo "Starting Backend Server on port 5000..."
cd "$(dirname "$0")"
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start User Dashboard
echo "Starting User Dashboard on port 5173..."
cd client
npm run dev &
USER_PID=$!

# Wait for user dashboard to start
sleep 2

# Start Admin Dashboard
echo "Starting Admin Dashboard on port 3001..."
cd ../admin-app
npm run dev &
ADMIN_PID=$!

# Wait for admin dashboard to start
sleep 2

# Start Organizer Dashboard
echo "Starting Organizer Dashboard on port 3002..."
cd ../organizer-app
npm run dev &
ORGANIZER_PID=$!

echo ""
echo "================================"
echo "All applications started!"
echo "================================"
echo "Backend API:     http://localhost:5000"
echo "User Dashboard:  http://localhost:5173"
echo "Admin Dashboard: http://localhost:3001"
echo "Organizer Dashboard: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop all applications"
echo ""

# Function to kill all processes on exit
cleanup() {
    echo "Stopping all applications..."
    kill $BACKEND_PID $USER_PID $ADMIN_PID $ORGANIZER_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for all background processes
wait
