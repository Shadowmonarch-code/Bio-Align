#!/bin/bash
cd /home/z/my-project
while true; do
    echo "Starting Next.js dev server at $(date)..."
    bun run dev 2>&1 | tee -a /home/z/my-project/dev.log
    echo "Server exited at $(date) with code $?. Restarting in 3 seconds..."
    sleep 3
done
