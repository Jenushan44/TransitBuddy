#!/bin/bash

#python3 -m grpc_tools.protoc -I=backend --python_out=backend backend/gtfs-realtime.proto

cd frontend
npm ci
npm run build
cd ..

