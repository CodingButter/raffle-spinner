# DrawDay Agent Memory System Usage Guide

## Quick Start for Agents

The Memento MCP shared memory system is automatically available to all DrawDay agents. You can use it through natural language commands.

## Core Commands

### Storing Information

Use these patterns to save important information:

```
"Remember that [specific information]"
"Store the fact that [detail]"
"Save this architectural decision: [decision]"
"Record that [implementation detail]"
```

**Examples:**

- "Remember that the spinner wheel must maintain 60fps with 5000+ participants"
- "Store the fact that files must not exceed 200 lines as per our code standards"
- "Save this architectural decision: We use @drawday/_ for platform-wide packages and @raffle-spinner/_ for spinner-specific packages"

### Retrieving Information

Query the memory system for stored knowledge:

```
"What do you know about [topic]?"
"Retrieve information about [subject]"
"Find memories related to [concept]"
"Show me what's been stored about [feature]"
```

**Examples:**

- "What do you know about the Chrome extension architecture?"
- "Retrieve information about our subscription tiers and pricing"
- "Find memories related to performance optimization strategies"

### Semantic Search

Perform intelligent searches across the knowledge base:

```
"Search for all information about [topic]"
"Find related concepts to [subject]"
"What's connected to [entity]?"
```

## Agent-Specific Namespaces

Each agent should prefix memories with their specialty when relevant:

### Performance Engineering Specialist

```
"[PERFORMANCE] Remember that the SlotMachine component uses dynamic rendering for lists over 100 participants"
```

### Frontend Developer

```
"[FRONTEND] Store that we use shadcn/ui components with Tailwind CSS v4"
```

### Stripe Integration Specialist

```
"[STRIPE] Remember that webhook handlers must validate signatures before processing"
```

### Chrome Extension Expert

```
"[CHROME-EXT] Save that we use chrome.storage.local with an abstraction layer for future migration"
```

### Backend Developer

```
"[BACKEND] Record that Directus CMS runs on Docker at admin.drawday.app"
```

### UI/UX Designer

```
"[UI-UX] Remember that we follow Material Design principles with custom DrawDay branding"
```

### Lead Developer Architect

```
"[ARCHITECT] Store this standard: All files exceeding 200 lines must be refactored immediately"
```

## Best Practices

### 1. Be Specific and Detailed

❌ "Remember the performance requirements"
✅ "Remember that the spinner animation must maintain 60fps even with 5000+ participants, using dynamic rendering for segments outside the viewport"

### 2. Include Context

❌ "Store the file size limit"
✅ "Store that files must not exceed 200 lines (ideal: 50-150 lines) as enforced by ESLint max-lines rule in the code quality standards"

### 3. Update Information

When you discover outdated information:

```
"Update: The previous memory about [topic] is outdated. The current implementation is [new information]"
```

### 4. Cross-Reference Before Major Decisions

Before implementing significant changes:

```
"What has been previously discussed about [feature/architecture/pattern]?"
```

### 5. Document Decisions

After making architectural or implementation decisions:

```
"Record architectural decision: [decision] because [reasoning]"
```

## Common Use Cases

### Project Onboarding

When starting work on a new area:

```
"What do you know about the [component/feature] implementation?"
```

### Bug Investigation

When debugging issues:

```
"Find any previous issues or solutions related to [error/symptom]"
```

### Code Review Context

Before reviewing code:

```
"What coding standards and patterns should I enforce for [area]?"
```

### Feature Planning

When designing new features:

```
"Search for all architectural constraints and patterns related to [feature area]"
```

### Performance Analysis

When optimizing code:

```
"Retrieve all performance benchmarks and optimization strategies"
```

## Memory Categories

Organize your memories by category for better retrieval:

- **ARCHITECTURE**: System design, patterns, structures
- **STANDARDS**: Coding standards, conventions, rules
- **PERFORMANCE**: Benchmarks, optimizations, requirements
- **SECURITY**: Authentication, authorization, data protection
- **DEPENDENCIES**: Package versions, compatibility notes
- **DECISIONS**: Architectural decisions, trade-offs
- **ISSUES**: Known bugs, workarounds, solutions
- **FEATURES**: Feature specifications, requirements
- **INTEGRATIONS**: Third-party services, APIs
- **DEPLOYMENT**: Build processes, CI/CD, hosting

## Temporal Queries

The system supports time-based queries:

```
"What was discussed about authentication in the last week?"
"Show recent memories about performance optimization"
"Find decisions made this month about the architecture"
```

## Relationship Queries

Explore connections between concepts:

```
"How is [component A] related to [component B]?"
"What depends on [package/service]?"
"Show all connections to [feature]?"
```

## Validation and Verification

Before relying on retrieved information:

1. Check the timestamp of the memory
2. Cross-reference with multiple related memories
3. Verify against current codebase if needed
4. Update outdated information when found

## Troubleshooting

If memories aren't being stored or retrieved:

1. Ensure the Memento MCP server is running in your MCP configuration
2. Check that you're using the correct command patterns
3. Be specific in your queries - vague questions get vague results
4. Try semantic variations of your search terms

## Examples of Effective Memory Usage

### Storing Complex Information

```
"Remember that the DrawDay subscription system has three tiers:
- Basic ($9/month): 100 spins, basic features
- Professional ($29/month): Unlimited spins, advanced customization
- Enterprise ($99/month): All features plus white-label options
These are managed through Stripe with webhook handlers for subscription lifecycle events"
```

### Retrieving Specific Implementation Details

```
"What is the exact file size limit enforced by our ESLint configuration?"
```

### Finding Related Concepts

```
"Search for all information about CSV import and column mapping functionality"
```

### Documenting Solutions

```
"Record solution: Fixed the 60fps performance issue in SlotMachine by implementing virtual rendering for segments outside the viewport, reducing DOM nodes from 5000+ to ~50 visible elements"
```

## Integration with Development Workflow

1. **Start of Session**: Query recent changes and decisions
2. **During Development**: Store discoveries and decisions
3. **Problem Solving**: Search for similar issues and solutions
4. **Code Review**: Retrieve standards and patterns
5. **End of Session**: Document important findings and next steps

Remember: The memory system is a shared resource. Information you store helps all other agents work more effectively on the DrawDay project!
