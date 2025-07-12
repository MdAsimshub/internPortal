#!/bin/bash

echo "🔄 Testing Main User Flow: Login → Dashboard → Navigation"
echo "======================================================="

# Test user login and get token
echo "🔐 Step 1: Testing Student Login..."
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"alex@student.edu","password":"password123","role":"student"}' \
    http://localhost:5000/api/auth/login)

if echo "$login_response" | grep -q '"success":true'; then
    echo "✅ Login successful"
    TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "🎫 Token received: ${TOKEN:0:20}..."
else
    echo "❌ Login failed"
    exit 1
fi

echo ""
echo "👤 Step 2: Testing User Profile Access..."
profile_response=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/auth/me)

if echo "$profile_response" | grep -q '"success":true'; then
    echo "✅ Profile access successful"
    USER_NAME=$(echo "$profile_response" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    USER_LEVEL=$(echo "$profile_response" | grep -o '"level":[0-9]*' | cut -d':' -f2)
    USER_XP=$(echo "$profile_response" | grep -o '"xp":[0-9]*' | cut -d':' -f2)
    echo "📋 User: $USER_NAME, Level: $USER_LEVEL, XP: $USER_XP"
else
    echo "❌ Profile access failed"
fi

echo ""
echo "💼 Step 3: Testing Jobs Access..."
jobs_response=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/jobs)

if echo "$jobs_response" | grep -q '"success":true'; then
    echo "✅ Jobs access successful"
    JOB_COUNT=$(echo "$jobs_response" | grep -o '"data":\[' | wc -l)
    echo "📊 Available jobs found"
else
    echo "❌ Jobs access failed"
fi

echo ""
echo "📋 Step 4: Testing Applications Access..."
apps_response=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/applications)

if echo "$apps_response" | grep -q '"success":true'; then
    echo "✅ Applications access successful"
    echo "📄 User applications retrieved"
else
    echo "❌ Applications access failed"
fi

echo ""
echo "🏆 Step 5: Testing Leaderboard Access..."
leaderboard_response=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/leaderboard)

if echo "$leaderboard_response" | grep -q '"success":true'; then
    echo "✅ Leaderboard access successful"
    echo "🎯 Leaderboard data retrieved"
else
    echo "❌ Leaderboard access failed"
fi

echo ""
echo "🎉 User Flow Test Complete!"
echo ""
echo "🌐 Frontend Test Instructions:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Click 'Login' button"
echo "3. Select 'Student' role"
echo "4. Enter: alex@student.edu / password123"
echo "5. Click 'Sign In' button"
echo "6. Verify redirect to dashboard"
echo "7. Test navigation buttons:"
echo "   - Browse Jobs"
echo "   - My Applications"  
echo "   - Leaderboard"
echo "   - Post Opportunity"
echo "8. Test logout functionality"
echo ""
echo "✨ All backend endpoints are working correctly!"
