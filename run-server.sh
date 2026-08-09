#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=256"

# Start server
node .next/standalone/server.js &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"

# Keep alive loop
while true; do
    # Check if server is still running
    if ! ps -p $SERVER_PID > /dev/null 2>&1; then
        echo "Server died, restarting..."
        node .next/standalone/server.js &
        SERVER_PID=$!
        echo "New PID: $SERVER_PID"
        sleep 3
    fi
    
    # Make a keep-alive request every 5 seconds
    curl -s -o /dev/null http://localhost:3000/ --connect-timeout 2 || true
    sleep 5
done
