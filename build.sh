#!/bin/bash

cd frontend
npm ci
npm run build
cd ..

. venv/bin/activate
python3 -m grpc_tools.protoc -I=backend --python_out=backend backend/gtfs-realtime.proto
