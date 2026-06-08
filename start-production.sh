#!/bin/bash
set -e

# Start Python model API in the background
echo "Starting Python model service..."
python3 python-backend/app.py &

# Start the Node.js API server in the foreground
# (Python loads the model async; Express proxy handles not-ready gracefully)
echo "Starting Node.js API server..."
exec node --enable-source-maps artifacts/api-server/dist/index.mjs
