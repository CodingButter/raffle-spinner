# Documentation Structure

```
docs/
├── README.md                      # Documentation index and overview
├── STRUCTURE.md                   # This file - documentation structure
│
├── architecture/                  # Technical architecture & requirements
│   ├── EXTENSION_ARCHITECTURE.md  # Chrome extension design
│   ├── PROJECT_STRUCTURE_AUDIT.md # DRY principles and organization
│   ├── SOFTWARE_REQUIREMENTS.md   # Technical requirements
│   ├── WEBSITE_ARCHITECTURE.md    # Next.js website architecture
│   └── WEBSITE_REQUIREMENTS.md    # Website-specific requirements
│
├── development/                   # Development guides
│   ├── CONTRIBUTING.md           # Contribution guidelines
│   ├── DOCUMENTATION_INDEX.md    # Complete docs overview
│   ├── GITHUB_SETUP.md          # Repository configuration
│   ├── HOME.md                  # Project overview
│   └── REFACTORING_PLAN.md     # Code improvement roadmap
│
├── deployment/                   # Deployment documentation
│   └── DEPLOY_VERCEL.md        # Vercel deployment guide
│
└── quality/                      # Code quality documentation
    ├── CODE_QUALITY_AUDIT.md    # Current quality status
    └── CODE_QUALITY_STANDARDS.md # Coding standards

Root Directory (kept minimal):
├── README.md                     # Main project README
├── CLAUDE.md                     # AI assistant instructions
└── ... (code and config files)
```

## Why This Structure?

### Clean Root Directory

- Only essential files remain in root (README, CLAUDE.md, config files)
- Reduces clutter and improves project navigation
- Makes the repository more professional and approachable

### Logical Organization

- **architecture/** - "How is it built?"
- **development/** - "How do I work on it?"
- **deployment/** - "How do I deploy it?"
- **quality/** - "What are the standards?"

### Benefits

1. **Discoverability** - Easy to find relevant documentation
2. **Scalability** - Clear where to add new docs
3. **Maintenance** - Organized structure encourages updates
4. **Professional** - Clean, enterprise-grade organization
