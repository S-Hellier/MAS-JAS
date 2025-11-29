#!/bin/bash

# Test Deployed Backend Script
# This script tests your deployed Vercel backend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the backend URL from frontend config or use default
BACKEND_URL="${1:-https://pantry-partner-cis0fylsv-scott-helliers-projects.vercel.app}"

echo -e "${BLUE}🧪 Testing Deployed Backend${NC}"
echo -e "${BLUE}📍 URL: ${BACKEND_URL}${NC}\n"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local headers=$4
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo -e "  ${BLUE}${method} ${endpoint}${NC}"
    
    if [ -n "$headers" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "$headers" \
            "${BACKEND_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            "${BACKEND_URL}${endpoint}")
    fi
    
    # Split response and status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "  ${GREEN}✅ Success (${http_code})${NC}"
        if [ -n "$body" ]; then
            echo "$body" | jq . 2>/dev/null || echo "$body" | head -5
        fi
    else
        echo -e "  ${RED}❌ Failed (${http_code})${NC}"
        echo "$body" | head -10
    fi
    echo ""
}

# Test 1: Health Check
test_endpoint "GET" "/health" "Health Check"

# Test 2: API Base Route (should return 404 or route info)
test_endpoint "GET" "/" "Root Endpoint"

# Test 3: Auth endpoint (should require user ID)
test_endpoint "GET" "/api/v1/auth/me" "Auth Endpoint (no user ID - should fail)" "x-user-id: test-user-123"

# Test 4: Pantry endpoint (should require user ID)
test_endpoint "GET" "/api/v1/pantry" "Pantry Endpoint (with test user ID)" "x-user-id: test-user-123"

# Test 5: Admin endpoint (should require admin key)
test_endpoint "GET" "/api/v1/admin/metrics" "Admin Endpoint (no key - should fail)"

echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "If health check passes, your backend is deployed and running!"
echo -e "Other endpoints may require proper authentication/authorization."
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Check Vercel dashboard for deployment logs"
echo -e "2. Verify environment variables are set in Vercel"
echo -e "3. Test with your frontend app"
echo ""

