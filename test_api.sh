#!/bin/bash

echo "Testing Identity Reconciliation API"
echo "=================================="
echo

echo "1. Health check:"
curl -s http://localhost:3000/health | jq '.'
echo

echo "2. Creating first contact (lorraine@hillvalley.edu, 123456):"
RESPONSE1=$(curl -s -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"lorraine@hillvalley.edu","phoneNumber":"123456"}')
echo "$RESPONSE1" | jq '.'
echo

echo "3. Linking contact via shared phone (mcfly@hillvalley.edu, 123456):"
RESPONSE2=$(curl -s -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}')
echo "$RESPONSE2" | jq '.'
echo

echo "4. Query by email only (lorraine@hillvalley.edu):"
curl -s -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"lorraine@hillvalley.edu"}' | jq '.'
echo

echo "5. Query by phone only (123456):"
curl -s -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"123456"}' | jq '.'
echo

echo "6. Create another primary contact (doc@hillvalley.edu, 789012):"
curl -s -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"doc@hillvalley.edu","phoneNumber":"789012"}' | jq '.'
echo

echo "7. Link via shared email to create merger scenario:"
echo "   Adding contact with doc@hillvalley.edu and new phone 555999:"
curl -s -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"doc@hillvalley.edu","phoneNumber":"555999"}' | jq '.'
echo

echo "8. Create another primary, then merge via shared email:"
echo "   First, create new primary (marty@hillvalley.edu, 111222):"
curl -s -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"marty@hillvalley.edu","phoneNumber":"111222"}' | jq '.'
echo

echo "   Now link marty's email with lorraine's phone (should merge two primaries):"
curl -s -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"marty@hillvalley.edu","phoneNumber":"123456"}' | jq '.'
echo

echo "9. Test edge cases:"
echo "   Empty request:"
curl -s -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'
echo

echo "   Invalid email format:"
curl -s -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","phoneNumber":"123456"}' | jq '.'
echo

echo "   Missing Content-Type header:"
curl -s -X POST http://localhost:3000/identify \
  -d '{"email":"test@test.com","phoneNumber":"999888"}' | jq '.'
echo

echo "Tests completed!"
echo "================"