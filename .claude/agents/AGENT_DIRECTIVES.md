# AGENT_DIRECTIVES

> **Scope:** Applies to **all** sub‑agents in `.claude/agents/`  
> **Read order:** This file is **ALWAYS** read first in every session before taking any action.
> **CRITICAL:** Every agent MUST read this file at session start. Failure to do so is a CRITICAL ERROR.

## Core Protocol

1. **Acknowledge** you have opened this file at the start of each session.
2. **Summarize** 3–7 key rules from this file INCLUDING git worktree requirements.
3. **Confirm compliance** and proceed only after summarizing.
4. If this file cannot be read, **halt** and request it. Do **not** act without it.

## GIT WORKTREE REQUIREMENTS (MANDATORY FOR ALL AGENTS)

### CRITICAL: All Development MUST Use Git Worktrees

1. **WORKTREE CREATION (START OF EVERY TASK)**
   ```bash
   # Navigate to project repository
   cd project
   
   # Create worktree in the worktrees directory (use descriptive branch names)
   git worktree add ../worktrees/[agent-name]-[task-description] -b [agent-name]/[task-description]
   
   # Example: git worktree add ../worktrees/frontend-fix-spinner-animation -b frontend/fix-spinner-animation
   
   # IMMEDIATELY navigate to your worktree
   cd ../worktrees/[agent-name]-[task-description]
   ```

2. **WORKTREE WORKFLOW RULES**
   - **NEVER** work directly in the main repository
   - **ALWAYS** create a new worktree for each distinct task
   - **ALWAYS** verify you're in the correct worktree before making changes
   - **Name worktrees** descriptively: `[agent-name]-[task-description]`
   - **Branch naming**: `[agent-name]/[task-description]`

3. **VERIFICATION REQUIREMENTS (BEFORE COMPLETION)**
   - Run ALL quality checks in your worktree:
     ```bash
     pnpm lint
     pnpm typecheck
     pnpm build
     pnpm test (if applicable)
     ```
   - **NEVER** mark task complete if any checks fail
   - Fix ALL errors before proceeding

4. **TASK COMPLETION PROTOCOL**
   - Ensure all changes are committed
   - Verify build passes without errors
   - Update Memento with findings
   - Create PR if needed
   - Clean up worktree:
     ```bash
     # Return to project directory
     cd ../../project
     
     # Remove worktree after PR is created/merged
     git worktree remove ../worktrees/[agent-name]-[task-description]
     ```

5. **WORKTREE MANAGEMENT CHECKLIST**
   - [ ] Created worktree with descriptive name
   - [ ] Working in correct worktree directory
   - [ ] All changes made in worktree only
   - [ ] Lint passes (`pnpm lint`)
   - [ ] TypeCheck passes (`pnpm typecheck`)
   - [ ] Build succeeds (`pnpm build`)
   - [ ] Tests pass (if applicable)
   - [ ] Memento updated with findings
   - [ ] PR created (if needed)
   - [ ] Worktree removed after completion

6. **FAILURE MODES (UNACCEPTABLE)**
   - ❌ Working directly in main repository
   - ❌ Not creating a worktree for tasks
   - ❌ Leaving worktrees after task completion
   - ❌ Marking task complete with failing builds
   - ❌ Not verifying quality checks pass

## CRITICAL VERIFICATION REQUIREMENTS (MANDATORY)

### ABSOLUTE RULE: ALWAYS VERIFY, NEVER ASSUME

1. **ZERO TOLERANCE FOR UNVERIFIED INFORMATION**
   - **NEVER** make up information, dates, times, URLs, or any data
   - **NEVER** assume or guess - if uncertain, verify first
   - **NEVER** provide placeholder or example data without explicit labeling
   - **ALWAYS** check actual sources: Memento, project files, GitHub, or web search
   - If information cannot be verified, explicitly state "Unable to verify" rather than guessing

2. **MANDATORY VERIFICATION SOURCES (Check in this order)**
   - **Memento MCP** (PRIMARY): Always check first for shared team knowledge
   - **Project Files**: Read actual files, never assume content
   - **GitHub**: Check repos, issues, PRs for real data
   - **Web Search**: Use for current information and documentation
   - **Direct Testing**: Run commands to verify behavior

3. **MEMENTO AS HIVE BRAIN (REQUIRED USAGE)**
   - **Before ANY task**: Search Memento for relevant context
   - **During work**: Update Memento with discoveries and decisions
   - **After completion**: Store learned patterns, solutions, and gotchas
   - **Knowledge Types to Store**:
     - Technical discoveries and patterns
     - Bug solutions and workarounds
     - Performance optimizations found
     - API behaviors and quirks
     - User preferences and requirements
     - Team decisions and rationale

4. **VERIFICATION CHECKLIST (USE EVERY TIME)**
   - [ ] Did I check Memento for existing knowledge?
   - [ ] Did I verify all facts against actual sources?
   - [ ] Did I test/confirm behavior rather than assuming?
   - [ ] Did I update Memento with new findings?
   - [ ] Am I 100% certain, or do I need to state uncertainty?

5. **FAILURE MODES (UNACCEPTABLE)**
   - ❌ Providing made-up dates/times without verification
   - ❌ Inventing URLs or file paths that don't exist
   - ❌ Assuming API responses without checking
   - ❌ Guessing configuration values
   - ❌ Creating fictional examples without clear labeling
   - ❌ Not checking Memento before starting work
   - ❌ Not updating Memento with important findings

## Models & Cost Policy

- Use **Opus** only when deep architectural reasoning or multi‑step design tradeoffs demand it.
- Default to **Sonnet** for planning, refactoring, documentation, integration, and routine coding tasks.
- The current role mapping:
  - Lead Developer Architect → **Opus**
  - Project Manager, Frontend & Code Quality, Performance & Extension, Integration & Payments → **Sonnet**
- If a task escalates in complexity (e.g., cross‑cutting architecture decisions), you may request **temporary** Opus elevation via the Orchestrator.

## Repository & Context

- **Project Location**: The main repository is in the `project` directory
- **Worktrees Location**: All worktrees go in the `worktrees` directory (sibling to `project`)
- Monorepo via Turborepo. Scopes: `@drawday/*` for shared libraries/UI, and `@raffle-spinner/*` for extension packages.
- Primary stack: Next.js + TypeScript + Tailwind + shadcn/ui; Chrome Extension **MV3**; **Directus**; **Stripe**.
- Quality bars: ~200 LoC/file guideline; ≥80% coverage; ESLint/Prettier/TS clean; DRY; small composable files.
- Business objectives: on‑time launch; revenue targets; spinner UX is fast (p95 60fps), reliable, and brandable.

## Global Workflow

1. **Read AGENT_DIRECTIVES** → ALWAYS read this file first, acknowledge compliance
2. **Create Worktree** → Set up git worktree for your task BEFORE any work
3. **Memento Check** → Search Memento for relevant context
4. **Intent Check** → Restate the task, success criteria, acceptance tests
5. **Constraints** → Recollect relevant guardrails (MV3, 200‑LoC guideline, size‑limit, security)
6. **Plan** → Outline small reversible steps with owners and ETA
7. **Execute** → IN WORKTREE ONLY; Keep diffs small; verify all assumptions
8. **Self‑Review** → Run pnpm lint, typecheck, build IN WORKTREE
9. **Fix Issues** → Resolve ALL errors before proceeding
10. **Memento Update** → Store discoveries, patterns, and solutions
11. **PR/Commit** → Create PR from worktree branch if needed
12. **Cleanup** → Remove worktree after task completion
13. **Handoff** → Use standard ritual, confirm worktree removed

## Quality Bars

- **Files** small and single‑purpose; functions focused; DRY.
- **Tests** to ≥80% coverage where practical; at least smoke tests for new flows.
- **Accessibility** for UI: focus order, ARIA, keyboard‑first, contrast.
- **Performance** for animations: aim for p95 60fps; enforce bundle size limits.
- **Documentation**: Update READMEs, ADRs, and link to related issues/PRs.

## Security & Privacy

- No secrets in repo; least‑privilege keys; rotate regularly.
- Validate all external input with Zod; handle errors as discriminated unions.
- Stripe: verify webhook signatures; never store card data.
- PII: encrypt where applicable; prefer redaction in logs.

## Verification Examples (FOLLOW THESE PATTERNS)

### ✅ CORRECT Verification Behavior
- "Let me check Memento for previous solutions to this pattern..."
- "I'll verify the actual file structure before proceeding..."
- "Running tests to confirm this behavior..."
- "According to the package.json, the actual version is..."
- "I cannot find this information, so I'll mark it as 'needs verification'"

### ❌ INCORRECT Assumptions (NEVER DO THIS)
- "The meeting is probably at 2 PM" → Must verify actual time
- "This file should be in src/components" → Must check actual location
- "The API returns a user object" → Must verify actual response
- "Version 2.0 was released last month" → Must check actual release date
- "This typically takes 5 seconds" → Must measure actual performance

## Communication Norms

- Be concise and friendly; lead with decisions and next steps.
- Use short sections, bullets, and links; avoid walls of text.
- Escalate blockers immediately with options and a recommendation.
- **ALWAYS state when information is unverified or uncertain**
- **NEVER present guesses as facts**

## VOICE COMMUNICATION PROTOCOL (MANDATORY)

### Agent Response Format
1. **TEXT ONLY**: Agents MUST provide text responses only, NEVER attempt to speak directly
2. **ORCHESTRATOR CONVERTS**: The Orchestrator will convert agent text to speech using ElevenLabs
3. **FULL TRANSCRIPT ACCESS**: Agents receive complete conversation transcripts for context
4. **RESPONSE STRUCTURE**: 
   - Provide clear, conversational text suitable for speech
   - Keep responses under 30 seconds when spoken (approximately 75-100 words)
   - For longer responses, break into multiple paragraphs for natural pauses

### Meeting Protocol
1. **Agent provides text** → Orchestrator receives → Converts to speech with agent's voice
2. **All agents receive** full meeting transcript for informed responses
3. **Turn-taking**: Wait for orchestrator to indicate your turn to respond
4. **Voice IDs**: Each agent has a unique ElevenLabs voice ID (stored in CLAUDE.md)

### Example Format
```
Agent Response:
"Hello team, this is Sarah Johnson. I've reviewed the sprint backlog and we have 
three critical items to discuss today. First, the performance optimization task..."
```

Orchestrator Action:
- Receives text
- Converts to speech using Sarah's voice ID: pYoradXlkTYyi4t1seaG
- Plays audio to team
- Updates transcript for all agents

## Tooling & CI

- CI must run typecheck, lint, unit tests, size‑limit, and basic e2e smoke.
- Dependabot (or equivalent) for updates; pin critical versions.
- For performance tasks, attach a quick benchmark (inputs, env, results).

## Incident & Escalation

- For payment or data integrity incidents: stop non‑critical deploys; notify stakeholders; open an incident issue; gather timelines and impacted scope.
- For perf regressions beyond budget: revert/flag; file follow‑up issue; attach traces.

## Prohibited

- No production key sharing; no eval in MV3; no unreviewed sensitive schema changes.
- Do not bypass test/size gates to “get it in.” If truly urgent, document the risk and get approval.
