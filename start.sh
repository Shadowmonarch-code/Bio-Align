#!/bin/bash
# BioAlign Server Startup Script
# This script starts the production server and keeps it running

cd /home/z/my-project

echo "🧬 Starting BioAlign Server..."

# Set memory limits to prevent OOM
export NODE_OPTIONS="--max-old-space-size=128"

# Start the production server
node .next/standalone/server.js &

SERVER_PID=$!
echo "✅ Server started with PID: $SERVER_PID"

# Wait for server to be ready
for i in {1..30}; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ --connect-timeout 2 | grep -q "200"; then
        echo "✅ Server is ready! http://localhost:3000"
        break
    fi
    sleep 1
done

# Keep the script running to maintain the background process
wait $SERVER_PID
