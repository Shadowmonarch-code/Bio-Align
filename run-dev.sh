#!/bin/bash
cd /home/z/my-project
while true; do
    echo "Starting dev server at $(date)..."
    bun run dev 2>&1 &
    SERVER_PID=$!
    
    # Wait for ready or death
    for i in {1..60}; do
        if ! ps -p $SERVER_PID > /dev/null 2>&1; then
            break
        fi
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ --connect-timeout 2 | grep -q "200"; then
            echo "Server ready"
            break
        fi
        sleep 1
    done
    
    # Keep alive while running
    while ps -p $SERVER_PID > /dev/null 2>&1; do
        curl -s -o /dev/null http://localhost:3000/ --connect-timeout 2 || true
        sleep 5
    done
    
    echo "Server died at $(date), restarting..."
    sleep 3
done
