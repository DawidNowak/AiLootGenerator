# Implementation Plan: Extend WealthLevel Enum with Treasure Tier

**Branch**: `005-i-want-to` | **Date**: October 11, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-i-want-to/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → ✅ Loaded feature spec successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Project Type: web (frontend+backend detected from Angular + ASP.NET Core)
   → ✅ Structure Decision: Option 2 (Web application)
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → ✅ No violations detected - simple enum extension
   → ✅ Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✅ No NEEDS CLARIFICATION remain
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
7. Re-evaluate Constitution Check section
   → ✅ Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. ✅ STOP - Ready for /tasks command
```

## Summary

Extend the existing WealthLevel enum from 5 tiers to 6 tiers by adding a "Treasure" tier above Noble. This involves updating the Noble tier range to 1201-3600 pennies and adding the new Treasure tier for items worth 3601+ pennies. The change affects both backend enum definition and frontend wealth selection UI.

## Technical Context

**Language/Version**: C# 8.0+ (ASP.NET Core 6.0+), TypeScript 5.5+ (Angular 18+)  
**Primary Dependencies**: ASP.NET Core Web API, Angular, Angular Material, Angular i18n  
**Storage**: JSON files for loot data (no database schema changes needed)  
**Testing**: MSTest/NUnit for backend, Jasmine/Karma for frontend  
**Target Platform**: Web application (cross-browser compatibility)  
**Project Type**: web - determines source structure  
**Performance Goals**: No performance impact expected (simple enum extension)  
**Constraints**: Maintain backward compatibility with existing loot generation  
**Scale/Scope**: Single enum modification affecting ~5 files across frontend/backend

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Code Quality Standards

✅ **PASS** - Simple enum extension with clear documentation and standard naming conventions

### II. Testing Excellence (NON-NEGOTIABLE)

✅ **PASS** - Will include unit tests for enum values, integration tests for loot generation, and frontend tests for UI selection

### III. User Experience Consistency

✅ **PASS** - Follows existing wealth tier selection patterns, maintains consistent terminology ("Treasure" aligns with fantasy theme)

### IV. Template-Driven Development

✅ **PASS** - Following structured template workflow: spec.md → plan.md → tasks.md → implementation

## Project Structure

### Documentation (this feature)

```
specs/005-i-want-to/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 2: Web application (Angular frontend + ASP.NET Core backend)
backend/
├── src/
│   ├── Models/
│   │   └── WealthLevel.cs      # Primary change: extend enum
│   ├── Services/
│   │   └── LootGenerationService.cs  # Update for new tier
│   └── Controllers/
│       └── LootController.cs   # Verify compatibility
└── tests/
    └── Unit/
        └── WealthLevelTests.cs # New tests for Treasure tier

frontend/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── wealth-level.ts # Mirror backend enum
│   │   └── components/
│   │       └── wealth-selector/ # Update UI options
│   └── environments/
└── tests/
    └── component tests for wealth selection
```

**Structure Decision**: Option 2 (Web application) - Angular frontend + ASP.NET Core backend detected

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - ✅ No NEEDS CLARIFICATION items - all technical context is clear

2. **Generate and dispatch research agents**:

   - Research best practices for enum extension in C# maintaining backward compatibility
   - Research Angular Material mat-select patterns for additional options
   - Research testing strategies for enum modifications

3. **Consolidate findings** in `research.md`:
   - Decision: Add Treasure=6 after Noble=5
   - Rationale: Maintains existing enum values, adds new tier at end
   - Alternatives considered: Reordering vs appending

**Output**: research.md with enum extension best practices

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - WealthLevel enum with 6 tiers
   - Value ranges for each tier
   - Backward compatibility constraints

2. **Generate API contracts** from functional requirements:

   - GET /api/loot endpoint continues to accept WealthLevel parameter
   - WealthLevel enum serialization includes new Treasure value
   - Response schemas remain unchanged (loot items structure intact)

3. **Generate contract tests** from contracts:

   - Test loot generation with Treasure tier (3601+ penny values)
   - Test Noble tier with updated range (1201-3600 pennies)
   - Test backward compatibility with existing tiers

4. **Extract test scenarios** from user stories:

   - User selects Treasure tier → generates high-value loot
   - User selects Noble tier → generates mid-high value loot with updated range
   - Existing functionality continues working

5. **Update agent file incrementally**:
   - Update .github/copilot-instructions.md with new wealth tier information
   - Add Treasure tier to active technologies context

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Backend enum update task (WealthLevel.cs)
- Frontend enum mirror task (wealth-level.ts)
- Backend service compatibility verification
- Frontend UI component update (wealth selector)
- Unit tests for new enum values
- Integration tests for loot generation with Treasure tier
- Frontend component tests for wealth selection UI

**Ordering Strategy**:

- Backend enum extension first (foundation)
- Frontend enum mirror second (compatibility)
- Service layer verification third (business logic)
- UI updates fourth (user interface)
- Test creation throughout (TDD approach)

**Estimated Output**: 8-10 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No constitutional violations detected - simple enum extension within established patterns_

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command) ✅ research.md created
- [x] Phase 1: Design complete (/plan command) ✅ data-model.md, contracts/, quickstart.md created
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅ Ready for /tasks
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS ✅ No violations in final design
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
