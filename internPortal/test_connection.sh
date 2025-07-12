#!/bin/bash

echo "🧪 Frontend-Backend Connection Test Script"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Function to test API endpoints
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response "$url")
    status_code=${response: -3}
    
    if [[ "$status_code" == "$expected_status" ]]; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $status_code)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (Status: $status_code, Expected: $expected_status)"
        ((FAILED++))
    fi
}

# Function to test with authentication
test_auth_endpoint() {
    local url=$1
    local description=$2
    local token=$3
    local expected_status=$4
    
    echo -n "Testing $description... "
    
    if [[ -n "$token" ]]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response -H "Authorization: Bearer $token" "$url")
    else
        response=$(curl -s -w "%{http_code}" -o /tmp/response "$url")
    fi
    
    status_code=${response: -3}
    
    if [[ "$status_code" == "$expected_status" ]]; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $status_code)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (Status: $status_code, Expected: $expected_status)"
        ((FAILED++))
    fi
}

echo ""
echo "🔧 Backend API Tests"
echo "-------------------"

# Test backend health
test_endpoint "http://localhost:5000/api/health" "Backend Health Check" "200"

# Test authentication endpoints
echo ""
echo "🔐 Authentication Tests"
echo "----------------------"

# Test login endpoint
echo -n "Testing Student Login... "
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"alex@student.edu","password":"password123","role":"student"}' \
    http://localhost:5000/api/auth/login)

if echo "$login_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASSED${NC}"
    # Extract token for further tests
    STUDENT_TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Response: $login_response"
    ((FAILED++))
fi

# Test admin login
echo -n "Testing Admin Login... "
admin_login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@asim.edu","password":"admin123","role":"admin"}' \
    http://localhost:5000/api/auth/login)

if echo "$admin_login_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ADMIN_TOKEN=$(echo "$admin_login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Response: $admin_login_response"
    ((FAILED++))
fi

echo ""
echo "📋 Protected Endpoints Tests"
echo "----------------------------"

# Test protected endpoints with student token
test_auth_endpoint "http://localhost:5000/api/auth/me" "Student Profile Access" "$STUDENT_TOKEN" "200"
test_auth_endpoint "http://localhost:5000/api/jobs" "Jobs List Access" "$STUDENT_TOKEN" "200"
test_auth_endpoint "http://localhost:5000/api/applications" "Applications Access" "$STUDENT_TOKEN" "200"
test_auth_endpoint "http://localhost:5000/api/leaderboard" "Leaderboard Access" "$STUDENT_TOKEN" "200"

# Test admin endpoints
test_auth_endpoint "http://localhost:5000/api/auth/me" "Admin Profile Access" "$ADMIN_TOKEN" "200"
test_auth_endpoint "http://localhost:5000/api/users" "Admin Users Access" "$ADMIN_TOKEN" "200"

echo ""
echo "🌐 Frontend Tests"
echo "----------------"

# Test frontend server
test_endpoint "http://localhost:5173" "Frontend Server" "200"

echo ""
echo "📊 Test Summary"
echo "--------------"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [[ $FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 All tests passed! Frontend and Backend are properly connected.${NC}"
    echo ""
    echo "🔑 Test Credentials:"
    echo "   Student: alex@student.edu / password123"
    echo "   Admin: admin@asim.edu / admin123"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend API: http://localhost:5000/api"
else
    echo -e "\n${RED}❌ Some tests failed. Please check the issues above.${NC}"
fi

echo ""
echo "💡 Next Steps:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Try logging in with the test credentials"
echo "   3. Test all the buttons and navigation"
echo "   4. Check the backend status indicator in the header"
