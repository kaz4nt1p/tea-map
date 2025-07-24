#!/bin/bash

echo "🔨 Building Tea Map application in Docker..."

# Build the Docker image
docker build -t tea-map-builder -f Dockerfile.build .

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    # Create a temporary container to extract files
    echo "📦 Extracting built files..."
    docker create --name tea-map-temp tea-map-builder
    
    # Extract the .next directory
    docker cp tea-map-temp:/app/.next ./build-output/
    
    # Extract package.json and other necessary files
    docker cp tea-map-temp:/app/package.json ./build-output/
    docker cp tea-map-temp:/app/next.config.js ./build-output/
    
    # Clean up temporary container
    docker rm tea-map-temp
    
    echo "✅ Built files extracted to ./build-output/"
    echo "📁 Contents:"
    ls -la build-output/
else
    echo "❌ Build failed!"
    exit 1
fi