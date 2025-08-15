# DrawDay Memento MCP - Shared Memory System Setup Guide

## Overview

Memento MCP provides a unified, vector-based memory system for the DrawDay development team. This system enables all specialized agents (performance, frontend, stripe, chrome extension, etc.) to share context, knowledge, and insights across interactions.

## Architecture

- **Storage Backend**: Neo4j 5.26 (graph + vector database)
- **Embedding Model**: OpenAI text-embedding-3-small
- **Integration**: MCP (Model Context Protocol) server
- **Access Pattern**: Shared across all Claude agents via unified configuration

## Prerequisites

1. **Docker & Docker Compose** installed and running
2. **OpenAI API Key** (already configured in project .env)
3. **Port Availability**: 7474 (HTTP) and 7687 (Bolt) must be available

## Initial Setup

### 1. Start the Memory System

```bash
cd docker/memento-mcp
./start-memento.sh
```

This will:

- Start the Neo4j database container
- Initialize the vector search capabilities
- Set up the graph database structure
- Make the system available at bolt://localhost:7687

### 2. Verify Installation

Open Neo4j Browser: http://localhost:7474

- Username: `neo4j`
- Password: `DrawDay_Memory_2025!`

### 3. MCP Integration

The system is already configured in `.mcp.json` and will automatically be available to all Claude agents.

## Usage for Agents

### Creating Memories

Agents can store information using natural language:

```
"Remember that the DrawDay spinner extension must maintain 60fps with 5000+ participants"
```

```
"Store the fact that our Stripe integration uses subscription tiers: Basic ($9), Professional ($29), and Enterprise ($99)"
```

### Retrieving Memories

Agents can query the shared memory:

```
"What do you know about performance requirements for the spinner?"
```

```
"Retrieve information about our subscription pricing structure"
```

### Semantic Search

The system supports intelligent semantic search:

```
"Find all information related to Chrome extension architecture"
```

```
"What optimization strategies have been discussed for large participant lists?"
```

## Agent Namespaces

Each specialized agent has its own namespace for organized memory storage:

- `performance` - Performance Engineering Specialist
- `frontend` - Frontend Developer
- `stripe` - Stripe Integration Specialist
- `chrome-extension` - Chrome Extension Expert
- `backend` - Backend Developer
- `ui-ux` - UI/UX Designer
- `lead-architect` - Lead Developer Architect

Agents can store namespace-specific memories while still accessing the global knowledge base.

## Management Commands

### View Logs

```bash
cd docker/memento-mcp
./logs-memento.sh
```

### Stop the System

```bash
cd docker/memento-mcp
./stop-memento.sh
```

### Backup Memory Data

```bash
cd docker/memento-mcp
./backup-memento.sh
```

### Restore from Backup

```bash
cd docker/memento-mcp
./restore-memento.sh ./backups/memento-backup-TIMESTAMP.tar.gz
```

## Data Persistence

- **Location**: `docker/memento-mcp/neo4j-data/`
- **Automatic Persistence**: All data is persisted to disk
- **Backup Strategy**: Regular backups recommended via `./backup-memento.sh`

## Advanced Features

### 1. Temporal Awareness

The system tracks when information was added and can retrieve time-based context:

```
"What was discussed about authentication in the last week?"
```

### 2. Confidence Decay

Older information gradually decreases in confidence score (configurable via MEMORY_CONFIDENCE_DECAY)

### 3. Relationship Mapping

The graph database maintains relationships between concepts:

```
"How is the spinner physics package related to performance optimization?"
```

### 4. Context Preservation

Each memory stores metadata about:

- Source agent/namespace
- Creation timestamp
- Confidence score
- Related entities
- Semantic embeddings

## Troubleshooting

### Neo4j Won't Start

1. Check if ports 7474 and 7687 are available
2. Verify Docker is running
3. Check logs: `./logs-memento.sh`

### Connection Issues

1. Ensure Neo4j is running: `docker ps | grep drawday-memento-neo4j`
2. Test connection: `docker exec -it drawday-memento-neo4j cypher-shell -u neo4j -p DrawDay_Memory_2025!`

### Memory Not Persisting

1. Check disk space in `docker/memento-mcp/neo4j-data/`
2. Verify write permissions
3. Review logs for errors

## Security Considerations

1. **API Keys**: Stored in `.env` file (not committed to git)
2. **Database Password**: Strong password configured for Neo4j
3. **Network**: Isolated Docker network for services
4. **Access Control**: Local-only access by default

## Best Practices for Agents

1. **Be Specific**: Store detailed, specific information rather than vague statements
2. **Use Consistent Terminology**: Maintain consistent naming for concepts
3. **Regular Queries**: Query the memory system before making assumptions
4. **Update Outdated Info**: When finding outdated information, create new memories with corrections
5. **Cross-Reference**: Validate critical information across multiple memory entries

## Integration with Project Workflow

1. **Project Planning**: Store architectural decisions and requirements
2. **Code Reviews**: Remember patterns, anti-patterns, and team preferences
3. **Bug Tracking**: Store context about recurring issues and solutions
4. **Performance Metrics**: Track performance benchmarks and optimization strategies
5. **Team Knowledge**: Preserve institutional knowledge across agent interactions

## Monitoring and Maintenance

### Health Check

```bash
docker exec drawday-memento-neo4j cypher-shell -u neo4j -p DrawDay_Memory_2025! "MATCH (n) RETURN count(n) as nodeCount"
```

### Database Size

```bash
du -sh docker/memento-mcp/neo4j-data/
```

### Clean Old Backups

```bash
find docker/memento-mcp/backups -name "*.tar.gz" -mtime +30 -delete
```

## Support

For issues or questions about the Memento MCP system:

1. Check the logs: `./logs-memento.sh`
2. Review this documentation
3. Consult the upstream repository: https://github.com/gannonh/memento-mcp

## Next Steps

1. Start the system: `./start-memento.sh`
2. Test with a simple memory creation
3. Query the memory to verify it's working
4. Begin using across all agent interactions

The shared memory system is now ready to enhance collaboration and context preservation across the entire DrawDay development team!
