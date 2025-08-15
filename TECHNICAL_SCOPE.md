# DrawDay Technical Scope & Architecture Document

## Executive Summary

This document outlines the technical architecture, priorities, and team coordination strategies for the DrawDay project. It serves as the technical complement to project management coordination, ensuring high-quality, maintainable code delivery while meeting business objectives.

## Critical Technical Issues (IMMEDIATE ACTION REQUIRED)

### 1. Code Quality Violations - BREAKING STANDARDS

**CRITICAL FILES EXCEEDING 200-LINE LIMIT:**

- `packages/spinners/src/slot-machine/SlotMachineWheel.tsx` (579 lines) - **PRIORITY 1**
- `packages/spinners/src/slot-machine/SlotMachineWheelFixed.tsx` (566 lines) - **PRIORITY 1**
- `apps/spinner-extension/src/components/options/SpinnerCustomization.tsx` (454 lines) - **PRIORITY 2**
- `apps/spinner-extension/src/pages/OptionsPage.tsx` (408 lines) - **PRIORITY 2**
- `packages/spinners/src/slot-machine/hooks/useSlotMachineAnimation.ts` (381 lines) - **PRIORITY 3**

**IMMEDIATE ACTION:** All files >200 lines must be refactored before ANY new feature development.

### 2. Stripe Integration Gaps

**MISSING ENVIRONMENT VARIABLES:**

- `STRIPE_PRICE_STARTER` - Required for starter tier pricing
- `STRIPE_PRICE_PROFESSIONAL` - Required for professional tier pricing
- `STRIPE_PRICE_ENTERPRISE` - Required for enterprise tier pricing

**TECHNICAL DEBT:**

- Incomplete webhook validation
- Missing subscription state synchronization
- Unfinished product configuration in Stripe dashboard

## Technical Architecture Overview

### Monorepo Structure (WELL-ORGANIZED)

```
apps/
├── spinner-extension/     # Chrome extension (React + Vite)
└── website/              # Next.js website + dashboard

packages/@drawday/         # Platform-wide packages
├── auth/                 # Authentication system
├── ui/                   # Shared UI components
├── utils/                # Common utilities
├── types/                # TypeScript definitions
├── hooks/                # Reusable React hooks
├── eslint-config/        # Shared ESLint rules
├── prettier-config/      # Code formatting
├── typescript-config/    # TypeScript configs
└── tailwind-config/      # Tailwind CSS config

packages/@raffle-spinner/  # Spinner-specific packages
├── storage/              # Chrome storage abstraction
├── csv-parser/           # CSV parsing with intelligent mapping
├── spinner-physics/      # Animation physics
├── spinners/             # Spinner components
└── contexts/             # Spinner-specific contexts
```

### Technical Stack Assessment

- **Framework:** React 18 + TypeScript ✅
- **Styling:** Tailwind CSS v4 ✅
- **Build System:** Vite + pnpm workspaces ✅
- **UI Components:** shadcn/ui + Radix ✅
- **Performance Standards:** 60fps, <2s load times ⚠️ (needs validation)
- **Code Quality:** ESLint + Prettier ✅

## Team Technical Coordination Framework

### 1. Specialized Agent Responsibilities

#### **Performance Engineer**

- **Primary Focus:** SlotMachine component optimization
- **Key Metrics:** 60fps animation, large dataset handling (5000+ participants)
- **Current Tasks:**
  - Refactor SlotMachineWheel.tsx (579 lines → multiple components)
  - Optimize canvas rendering pipeline
  - Implement lazy loading for large participant lists
  - Performance testing with 10k+ participants

#### **Frontend Architect**

- **Primary Focus:** Component architecture and UI consistency
- **Key Responsibilities:**
  - Refactor large components following 200-line rule
  - Maintain @drawday/ui package consistency
  - Implement design system standards
  - Review all component PRs for architectural compliance

#### **Integration Specialist**

- **Primary Focus:** Stripe integration and backend connectivity
- **Key Tasks:**
  - Complete Stripe product/price configuration
  - Implement webhook validation and error handling
  - Sync subscription states between Stripe/Directus
  - Chrome extension storage optimization

#### **Quality Engineer**

- **Primary Focus:** Code quality enforcement and testing
- **Key Responsibilities:**
  - Enforce 200-line file limit through automated checks
  - Implement comprehensive testing strategy
  - Monitor code complexity and cyclomatic complexity
  - Establish performance benchmarks

### 2. Technical Review Process

#### **Quality Gates (MANDATORY)**

1. **Pre-Development Check:**
   - No file >200 lines in affected areas
   - All dependencies up to date
   - Performance benchmarks established

2. **Development Review:**
   - Code complexity check (max 10 per function)
   - Component separation validation
   - Performance impact assessment

3. **Pre-Merge Validation:**
   - Automated line count verification
   - Performance regression testing
   - Integration test coverage

#### **Architecture Review Process**

- **Weekly Architecture Reviews:** Every Tuesday 2 PM GMT
- **Critical Decision Escalation:** <24 hours for blocking issues
- **Refactoring Approval:** Required for any file >150 lines

### 3. Code Quality Enforcement

#### **Automated Enforcement (IMPLEMENTED)**

```json
{
  "max-lines": [200, "excluding blanks/comments"],
  "max-lines-per-function": [80, "excluding blanks/comments"],
  "complexity": ["error", 10]
}
```

#### **Manual Review Checkpoints**

- Component extraction strategy
- Shared package utilization (@drawday/_ vs @raffle-spinner/_)
- Performance optimization opportunities
- Security and data privacy compliance

## Priority Technical Assignments

### **SPRINT 1: Critical Refactoring (Week 1-2)**

#### **Performance Engineer - IMMEDIATE**

1. **SlotMachineWheel.tsx Refactoring**
   - Extract canvas rendering logic → `SlotMachineRenderer.ts`
   - Extract subset management → `SlotMachineSubset.ts`
   - Extract theme handling → `SlotMachineTheme.ts`
   - Create component composition structure
   - **Target:** 579 lines → 4 files <150 lines each

2. **SlotMachineWheelFixed.tsx Refactoring**
   - Identify duplication with SlotMachineWheel
   - Extract shared logic to common utilities
   - Implement proper component inheritance
   - **Target:** 566 lines → 3 files <150 lines each

#### **Frontend Architect - IMMEDIATE**

1. **SpinnerCustomization.tsx Refactoring**
   - Extract color picker logic → `ColorCustomization.tsx`
   - Extract font/size controls → `TypographyCustomization.tsx`
   - Extract theme presets → `ThemePresets.tsx`
   - **Target:** 454 lines → 4 files <120 lines each

2. **OptionsPage.tsx Refactoring**
   - Extract auth logic → `OptionsAuth.tsx`
   - Extract subscription logic → `OptionsSubscription.tsx`
   - Extract settings management → `OptionsSettings.tsx`
   - **Target:** 408 lines → 4 files <110 lines each

#### **Integration Specialist - IMMEDIATE**

1. **Stripe Integration Completion**
   - Configure Stripe products in dashboard
   - Set environment variables for price IDs
   - Implement webhook signature validation
   - Create subscription sync service

### **SPRINT 2: Performance & Architecture (Week 3-4)**

#### **Performance Engineer**

1. **Performance Optimization**
   - Implement Canvas worker threads for heavy rendering
   - Add participant list virtualization for >1000 entries
   - Optimize subset swapping algorithm
   - Create performance benchmarking suite

2. **Large Dataset Handling**
   - Stress test with 10,000+ participants
   - Implement progressive loading strategies
   - Add memory usage monitoring
   - Optimize garbage collection patterns

#### **Quality Engineer**

1. **Testing Infrastructure**
   - Unit tests for all refactored components
   - Integration tests for Stripe workflows
   - Performance regression tests
   - Automated accessibility testing

### **SPRINT 3: Advanced Features (Week 5-6)**

#### **Integration Specialist**

1. **Chrome Extension Optimization**
   - Implement chrome.storage performance improvements
   - Add offline capability for competitions
   - Optimize extension bundle size
   - Implement data compression for large datasets

2. **Backend Integration**
   - Directus subscription management
   - Real-time sync capabilities
   - Backup and restore functionality

## Technical Dependencies & Integration Requirements

### **Critical Path Dependencies**

1. **Stripe Configuration** → Subscription features
2. **Component Refactoring** → Performance optimization
3. **Performance Testing** → Production readiness
4. **Chrome Storage Optimization** → Large dataset support

### **Integration Requirements**

- **Stripe ↔ Directus:** Subscription state synchronization
- **Chrome Extension ↔ Website:** Authentication token sharing
- **Components ↔ Storage:** Optimized data persistence
- **Animation ↔ Physics:** Smooth 60fps performance

## Performance & Quality Standards

### **Performance Requirements (NON-NEGOTIABLE)**

- **Animation:** 60fps sustained during spinner operation
- **Load Time:** <2 seconds for full application startup
- **Memory Usage:** <100MB for 5,000 participants
- **Bundle Size:** <2MB for Chrome extension

### **Code Quality Standards (ENFORCED)**

- **File Size:** 200 lines maximum (150 lines ideal)
- **Function Length:** 80 lines maximum
- **Cyclomatic Complexity:** 10 maximum per function
- **Test Coverage:** 80% minimum for critical paths

### **Architecture Standards**

- **Component Separation:** Single responsibility principle
- **Package Organization:** @drawday for shared, @raffle-spinner for specific
- **Type Safety:** 100% TypeScript coverage
- **Performance Monitoring:** Automated benchmarking

## Technical Decision Making Framework

### **Escalation Criteria**

1. **Immediate Escalation** (Lead Developer Architect):
   - Files exceeding 250 lines (hard limit)
   - Performance degradation >10%
   - Security vulnerabilities
   - Breaking changes to shared packages

2. **Weekly Review Required**:
   - New package creation
   - Major dependency updates
   - Architecture pattern changes
   - Third-party service integrations

3. **Team Consultation**:
   - Component design patterns
   - Performance optimization strategies
   - Testing approach decisions
   - Code organization improvements

### **Decision Authority Matrix**

- **Code Standards:** Lead Developer Architect (final authority)
- **Performance Targets:** Performance Engineer + Lead approval
- **Component Design:** Frontend Architect + team review
- **Integration Approach:** Integration Specialist + Lead approval

## Technical Debt Management

### **Current Technical Debt (QUANTIFIED)**

- **5 files** exceeding 200-line limit = **HIGH PRIORITY**
- **Missing Stripe configuration** = **BLOCKING**
- **Performance unvalidated** at scale = **HIGH RISK**
- **Limited test coverage** = **MEDIUM PRIORITY**

### **Debt Reduction Strategy**

1. **Week 1:** Eliminate all 200+ line files
2. **Week 2:** Complete Stripe integration
3. **Week 3:** Establish performance benchmarks
4. **Week 4:** Implement comprehensive testing

### **Prevention Measures**

- Pre-commit hooks for line count validation
- Automated performance regression testing
- Weekly architecture review meetings
- Continuous dependency monitoring

## Success Metrics & Monitoring

### **Technical KPIs**

- **Code Quality Score:** Target 95% (currently 90%)
- **Build Time:** <2 minutes for full monorepo build
- **Test Coverage:** 80% for critical components
- **Performance Score:** 60fps sustained, <2s load time

### **Monitoring Dashboard**

- Real-time code quality metrics
- Performance benchmark tracking
- Build and deployment status
- Technical debt accumulation alerts

### **Weekly Reporting**

- File size compliance report
- Performance regression analysis
- Integration status updates
- Team velocity and blockers

## Conclusion

This technical scope establishes clear standards, responsibilities, and processes to ensure DrawDay maintains high code quality while delivering business value. The immediate focus on refactoring large files and completing Stripe integration will establish a solid foundation for future development.

**Next Steps:**

1. Team assignment confirmation by Project Manager
2. Sprint planning session for refactoring priorities
3. Technical environment setup for Stripe integration
4. Establishment of automated quality monitoring

The success of this technical roadmap depends on strict adherence to the 200-line file limit and proactive architectural decision-making. Any deviation from these standards must be immediately escalated and addressed.
