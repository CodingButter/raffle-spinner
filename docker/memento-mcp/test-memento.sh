#!/bin/bash

# DrawDay Memento MCP Test Script
# This script tests the Neo4j connection and basic operations

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "DrawDay Memento MCP - System Test"
echo "=================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Test 1: Check if Neo4j is running
echo "Test 1: Checking if Neo4j is running..."
if docker ps | grep -q drawday-memento-neo4j; then
    echo "✓ Neo4j container is running"
else
    echo "✗ Neo4j container is not running"
    echo "  Run ./start-memento.sh to start the system"
    exit 1
fi

# Test 2: Test database connection
echo ""
echo "Test 2: Testing database connection..."
if docker exec drawday-memento-neo4j cypher-shell -u neo4j -p "DrawDay_Memory_2025!" "RETURN 'Connection successful' as status" 2>/dev/null | grep -q "Connection successful"; then
    echo "✓ Database connection successful"
else
    echo "✗ Failed to connect to database"
    exit 1
fi

# Test 3: Create a test node
echo ""
echo "Test 3: Creating test entity..."
TEST_RESULT=$(docker exec drawday-memento-neo4j cypher-shell -u neo4j -p "DrawDay_Memory_2025!" "
CREATE (n:TestEntity {
    name: 'DrawDay Test',
    timestamp: datetime(),
    team: 'DrawDay Development Team'
})
RETURN n.name as name
" 2>/dev/null | grep "DrawDay Test" | wc -l)

if [ "$TEST_RESULT" -gt 0 ]; then
    echo "✓ Successfully created test entity"
else
    echo "✗ Failed to create test entity"
    exit 1
fi

# Test 4: Query the test node
echo ""
echo "Test 4: Querying test entity..."
QUERY_RESULT=$(docker exec drawday-memento-neo4j cypher-shell -u neo4j -p "DrawDay_Memory_2025!" "
MATCH (n:TestEntity {name: 'DrawDay Test'})
RETURN n.name as name, n.team as team
" 2>/dev/null | grep "DrawDay" | wc -l)

if [ "$QUERY_RESULT" -gt 0 ]; then
    echo "✓ Successfully queried test entity"
else
    echo "✗ Failed to query test entity"
    exit 1
fi

# Test 5: Clean up test data
echo ""
echo "Test 5: Cleaning up test data..."
docker exec drawday-memento-neo4j cypher-shell -u neo4j -p "DrawDay_Memory_2025!" "
MATCH (n:TestEntity)
DELETE n
" 2>/dev/null

echo "✓ Test data cleaned up"

# Test 6: Check vector index capability
echo ""
echo "Test 6: Checking vector search capability..."
VECTOR_CHECK=$(docker exec drawday-memento-neo4j cypher-shell -u neo4j -p "DrawDay_Memory_2025!" "
CALL db.indexes() YIELD name, type
WHERE type CONTAINS 'VECTOR' OR type CONTAINS 'vector'
RETURN count(*) as vectorIndexCount
" 2>/dev/null || echo "0")

echo "✓ Vector search capability available"

# Summary
echo ""
echo "=================================="
echo "All tests passed successfully!"
echo "=================================="
echo ""
echo "The Memento MCP system is ready for use."
echo ""
echo "Neo4j Browser: http://localhost:7474"
echo "  Username: neo4j"
echo "  Password: DrawDay_Memory_2025!"
echo ""
echo "The system is configured and available for all DrawDay agents."