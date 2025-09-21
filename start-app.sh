#!/bin/bash

echo "🚀 Starting Financial App on Kali Linux..."
echo "=================================="

# Kill any existing processes on these ports
echo "🔄 Cleaning up existing processes..."
pkill -f "node.*src/index.js" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

# Function to start server
start_server() {
    echo "🖥️  Starting Backend Server..."
    cd /home/sb121/financial-app/server
    node src/index.js &
    SERVER_PID=$!
    echo "✅ Server started with PID: $SERVER_PID"
}

# Function to start client
start_client() {
    echo "🌐 Starting Frontend Client..."
    cd /home/sb121/financial-app/client
    npm start &
    CLIENT_PID=$!
    echo "✅ Client started with PID: $CLIENT_PID"
}

# Start both services
start_server
sleep 3
start_client

echo ""
echo "🎉 Financial App is starting up!"
echo "=================================="
echo "🖥️  Backend API: http://localhost:3001"
echo "🌐 Frontend App: http://localhost:5000"
echo "💳 Credit Card Recommendations: Enhanced with AI algorithms"
echo "🏦 CA Dashboard: Professional meeting management"
echo "📊 Analytics: Real-time financial insights"
echo ""
echo "⏳ Please wait for the frontend to compile..."
echo "🔗 The app will automatically open in your browser"
echo ""
echo "To stop the application, press Ctrl+C"

# Wait for user interrupt
trap 'echo "🛑 Stopping Financial App..."; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit' INT
wait
