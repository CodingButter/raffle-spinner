# PRODUCTIVITY ENFORCEMENT RULES

## MANDATORY COMMIT SCHEDULE

### 30-MINUTE COMMIT RULE

- **EVERY agent MUST commit within 30 minutes of starting work**
- No exceptions, no extensions, no "almost done"
- Commit incomplete work with clear TODO comments if needed

### PR CREATION DEADLINE

- **EVERY task MUST have a PR within 2 hours maximum**
- Mark PRs as draft if incomplete
- Better to have working code merged than perfect code uncommitted

### ANTI-ANALYSIS PARALYSIS RULES

#### SHIP WORKING CODE OVER PERFECT CODE

- If it builds and works → commit it
- If tests pass → create PR
- If PR is green → merge it
- Polish in follow-up PRs, don't hold up delivery

#### NO OVER-ENGINEERING

- Fix the immediate problem, not all related problems
- Add the feature requested, not additional "nice-to-haves"
- Refactor one file at a time, not entire systems

#### COMMIT MESSAGE STANDARDS

- Use conventional commits: `feat:`, `fix:`, `refactor:`
- Keep descriptions under 50 characters
- Examples:
  - `feat: add fuzzy CSV column matching`
  - `fix: resolve build failures in CI`
  - `refactor: split SlotMachineWheel into components`

### PRODUCTIVITY METRICS

#### SUCCESS INDICATORS

- ✅ All agents showing git activity every 30 minutes
- ✅ 3+ PRs merged per day per active specialist
- ✅ Build passes on all branches
- ✅ No files over 200 lines in new code
- ✅ All critical tasks completed within sprint

#### WARNING SIGNS

- ⚠️ No commits for 30+ minutes
- ⚠️ Analysis lasting longer than implementation
- ⚠️ Perfect code that's not shipped
- ⚠️ Scope creep beyond immediate requirements

### AGENT RESTART PROTOCOL

#### AUTO-RESTART TRIGGERS

- No git activity for 45 minutes
- Agent claims task is "almost done" for 2+ hours
- Analysis phase exceeds 30 minutes
- Agent requests additional requirements not in original task

#### ESCALATION PROCESS

1. **15 min**: Warning message via memento
2. **30 min**: Direct task reminder with deadline
3. **45 min**: Agent restart with simplified task
4. **60 min**: Task reassignment to different specialist

### MERGE POLICY

#### GREEN LIGHT MERGE CRITERIA

- ✅ Builds successfully
- ✅ Solves the stated problem
- ✅ No obvious breaking changes
- ✅ Files under 200 lines
- ✅ Basic functionality tested

#### IMMEDIATE MERGE (NO DELAYS)

- Performance improvements that show measurable gains
- Bug fixes that resolve user-reported issues
- Refactoring that reduces file sizes below 200 lines
- Feature completion that matches requirements exactly

### TEAM VELOCITY TARGETS

#### Daily Minimums (Per Specialist)

- **2 PRs created** per active day
- **1 PR merged** per active day
- **5+ commits** showing steady progress
- **0 files over 200 lines** in any PR

#### Sprint Goals

- **All critical path items completed** by sprint end
- **Technical debt reduced** through active refactoring
- **Build times improved** through optimization work
- **Code quality maintained** through automated enforcement

### ENFORCEMENT ACTIONS

#### For Low Productivity

- Daily check-ins with lead-developer-architect
- Simplified task assignments with clear deliverables
- Pair programming support for complex problems
- Process coaching on breaking down large tasks

#### For Consistent High Performance

- Additional complex challenges
- Mentorship opportunities with struggling team members
- Architecture decision participation
- Leading technical initiatives

## REMEMBER: DONE IS BETTER THAN PERFECT

The goal is sustainable, high-quality delivery. Ship working code, iterate quickly, and maintain team momentum.
