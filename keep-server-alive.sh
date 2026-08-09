#!/bin/bash
cd /home/z/my-project
while true; do
    echo "[$(date)] Starting server..."
    NODE_OPTIONS="--max-old-space-size=256" bun run start > /home/z/my-project/prod.log 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to be ready or die
    for i in {1..30}; do
        if ! ps -p $SERVER_PID > /dev/null 2>&1; then
            echo "[$(date)] Server exited early"
            break
        fi
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ --connect-timeout 2 | grep -q "200"; then
            echo "[$(date)] Server is ready"
            break
        fi
        sleep 1
    done
    
    # Keep making requests to keep it alive
    while ps -p $SERVER_PID > /dev/null 2>&1; do
        curl -s -o /dev/null http://localhost:3000/ --connect-timeout 2 || true
        sleep 10
    done
    
    echo "[$(date)] Server died, restarting in 3 seconds..."
    sleep 3
done
