#!/usr/bin/env bash
python -m grpc_tools.protoc -I. --python_out=./backend ./backend/gtfs-realtime.proto

cd frontend
npm ci
npm run build
cd ..

