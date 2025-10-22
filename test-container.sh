#!/bin/bash

echo "Testing Docker container Git setup..."
echo "======================================"
echo ""

# Check if container is running
if ! docker ps | grep -q noti; then
    echo "❌ Container 'noti' is not running"
    echo "Start it with: docker-compose up -d"
    exit 1
fi

echo "✅ Container is running"
echo ""

echo "1. Checking notes directory mount..."
docker exec noti ls -la /app/notes/ | head -5

echo ""
echo "2. Checking Git config in container..."
docker exec noti cat /app/notes/.git/config

echo ""
echo "3. Checking SSH keys in container..."
docker exec noti ls -la /tmp/home/.ssh/

echo ""
echo "4. Testing Git status..."
docker exec noti git -C /app/notes status

echo ""
echo "5. Testing SSH connection to GitHub..."
docker exec noti ssh -T git@github.com 2>&1 | head -3

echo ""
echo "6. Checking environment variables..."
docker exec noti env | grep -E "NOTES_DIR|HOME"

echo ""
echo "Done!"
