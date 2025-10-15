#!/bin/bash

# Pantry API Test Script
# Quick command-line tests for the Pantry API

BASE_URL="http://localhost:3001/api/v1/pantry"
USER_ID="816614f4-b6eb-4806-9e87-0ed87d62c317"

echo "🧪 Testing Pantry API..."
echo "Base URL: $BASE_URL"
echo "User ID: $USER_ID"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}Testing: $description${NC}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -H "x-user-id: $USER_ID" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "x-user-id: $USER_ID" \
            "$BASE_URL$endpoint")
    fi
    
    # Split response and status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success ($http_code)${NC}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Failed ($http_code)${NC}"
        echo "$body"
    fi
    echo ""
}

# Check if jq is installed for pretty JSON
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not found. Install it for prettier JSON output: brew install jq"
    echo ""
fi

# Test 1: Health Check
test_endpoint "GET" "/../health" "" "Health Check"

# Test 2: Get All Items (should be empty initially)
test_endpoint "GET" "/pantry" "" "Get All Items"

# Test 3: Create a new item
ITEM_DATA='{
  "name": "Test Bananas",
  "brand": "Test Brand",
  "quantity": 5,
  "unit": "pieces",
  "category": "produce",
  "expirationDate": "2024-01-20",
  "nutritionInfo": {
    "calories": 105,
    "protein": 1.3,
    "carbohydrates": 27,
    "fat": 0.4
  },
  "barcode": "9999999999999",
  "notes": "Test item for API testing"
}'

test_endpoint "POST" "/pantry" "$ITEM_DATA" "Create New Item"

# Test 4: Get all items again (should have 1 item now)
test_endpoint "GET" "/pantry" "" "Get All Items (after creation)"

# Test 5: Get items by category
test_endpoint "GET" "/pantry?category=produce" "" "Get Items by Category"

# Test 6: Search items
test_endpoint "GET" "/pantry?search=banana" "" "Search Items"

# Test 7: Get items expiring soon
test_endpoint "GET" "/pantry/expiring?days=30" "" "Get Items Expiring Soon"

# Test 8: Check barcode
test_endpoint "GET" "/pantry/barcode/9999999999999" "" "Check Barcode Exists"

# Test 9: Test invalid request (missing required fields)
INVALID_DATA='{
  "name": "Invalid Item"
}'

test_endpoint "POST" "/pantry" "$INVALID_DATA" "Test Invalid Request (should fail)"

echo -e "${YELLOW}🎉 API Testing Complete!${NC}"
echo ""
echo "💡 Tips:"
echo "   - Use Postman for more comprehensive testing"
echo "   - Check the API documentation for all available endpoints"
echo "   - Use the seed script to populate with sample data: npm run db:seed"
