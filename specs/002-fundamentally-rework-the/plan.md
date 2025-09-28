# Implementation Plan: Modern Minimalistic Frontend Redesign

**Branch**: `002-fundamentally-rework-the` | **Date**: September 28, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fundamentally-rework-the/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Rework the Angular frontend application with modern minimalistic design by integrating location input and generation button directly into the main form interface, eliminating separate component wrappers while maintaining functionality. Use light color theme with subtle interactions and no flashy animations.

## Technical Context

**Language/Version**: TypeScript 5.5+ (Angular 18+)  
**Primary Dependencies**: Angular Material, Angular Forms, RxJS  
**Storage**: N/A (frontend only - uses existing backend API)  
**Testing**: Jasmine, Karma, Angular Testing Utils  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+)  
**Project Type**: Web application frontend  
**Performance Goals**: < 2s initial load, < 100ms interaction response  
**Constraints**: Maintain existing API contract, preserve responsive design, maintain accessibility  
**Scale/Scope**: Single-page application with ~5 components, light theme redesign

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**I. Code Quality Standards**: ✅ PASS

- Angular CLI linting enforced, TypeScript strict mode enabled
- Component integration maintains clear separation of concerns
- Existing test patterns preserved

**II. Testing Excellence**: ✅ PASS

- Existing unit tests will be updated to reflect component integration
- Integration tests for form functionality maintained
- No complex business logic changes requiring new test patterns

**III. User Experience Consistency**: ✅ PASS

- Maintains existing accessibility features and patterns
- Consistent with Angular Material design language
- Light theme improves readability and consistency

**IV. Template-Driven Development**: ✅ PASS

- Following structured template workflow spec → plan → tasks → implementation
- No deviations from established development process

## Project Structure

### Documentation (this feature)

```
specs/002-fundamentally-rework-the/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Option 2 - Web application with existing frontend/backend separation

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - Research Angular Material design patterns for integrated form components
   - Light theme implementation best practices with Angular Material
   - Component integration patterns maintaining testability

2. **Generate and dispatch research agents**:

   ```
   Task: "Research Angular Material design patterns for integrated form layouts"
   Task: "Find best practices for light theme implementation in Angular Material"
   Task: "Research component integration patterns while maintaining testing isolation"
   Task: "Analyze current LootFormComponent for integration opportunities"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technical decisions documented

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Form Interface: Integrated component structure
   - Visual Theme: Light color specifications and Material theme customization
   - User Interactions: Simplified feedback patterns

2. **Generate API contracts** from functional requirements:

   - No API changes required - frontend-only redesign
   - Component interface contracts for integrated form elements
   - Theme configuration contracts

3. **Generate contract tests** from contracts:

   - Component integration test contracts
   - Theme application test contracts
   - User interaction test contracts

4. **Extract test scenarios** from user stories:

   - Load application → see integrated minimalistic interface
   - User interactions → subtle feedback without animations
   - Form completion → integrated loading state

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` for GitHub Copilot
   - Add frontend redesign context to existing Angular/TypeScript stack
   - Preserve existing manual additions

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks for component integration, theme application, and testing updates
- Component integration: Remove LocationInputComponent and GenerateButtonComponent, integrate into LootFormComponent
- Theme implementation: Apply light theme with CSS custom properties and Angular Material theme
- Animation elimination: Remove CSS transitions while preserving essential user feedback
- Test updates: Update existing tests to expect integrated structure

**Ordering Strategy**:

- TDD order: Update tests first to expect new integrated structure
- Component integration: Theme setup → Component integration → Animation removal → Test updates
- Dependencies: Theme variables before component styles before animation overrides

**Estimated Output**: 12-18 numbered, ordered tasks focusing on:

- Theme configuration and CSS custom properties (3-4 tasks)
- LootFormComponent template integration (4-5 tasks)
- Component removal and cleanup (2-3 tasks)
- Test updates and validation (3-4 tasks)
- Documentation and final validation (1-2 tasks)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No Constitution Check violations - section left empty_

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
