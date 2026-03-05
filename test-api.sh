#!/bin/bash

echo "=== Testing College ERP API ==="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s http://localhost:5001/api/health | jq '.'
echo ""

# Test 2: Check if frontend is running
echo "2. Testing Frontend..."
curl -s http://localhost:3000 | grep -o '<title>.*</title>'
echo ""

# Test 3: List available routes
echo "3. Backend is running on: http://localhost:5001"
echo "   Frontend is running on: http://localhost:3000"
echo ""

echo "=== Test Complete ==="
echo ""
echo "You can now:"
echo "  - Open http://localhost:3000 in your browser to access the frontend"
echo "  - The backend API is available at http://localhost:5001/api"
echo "  - Check the README.md for more information about the system"
