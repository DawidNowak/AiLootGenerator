# Implementation Plan: Further UI Rework for Simplicity

**Branch**: `004-further-rework-of` | **Date**: September 28, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-further-rework-of/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path ✓
   → Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION) ✓
   → Detect Project Type: web (frontend Angular + backend ASP.NET Core)
   → Set Structure Decision: Option 2 (Web application)
3. Fill the Constitution Check section ✓
4. Evaluate Constitution Check section ✓
   → No violations detected
   → Update Progress Tracking: Initial Constitution Check ✓
5. Execute Phase 0 → research.md ✓
   → No NEEDS CLARIFICATION remain
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md ✓
7. Re-evaluate Constitution Check section ✓
   → No new violations
   → Update Progress Tracking: Post-Design Constitution Check ✓
8. Plan Phase 2 → Describe task generation approach ✓
9. STOP - Ready for /tasks command ✓
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands.

## Summary

Primary requirement: Simplify UI by removing excessive whitespace, improving visibility of status messages, converting location input to multiline, replacing all custom components with standard Angular components, and applying consistent light styling to all loot items.

Technical approach: Frontend-focused refactoring using Angular Material components, CSS adjustments for spacing and contrast, form control updates for multiline input, and component replacement strategy maintaining existing functionality.

## Technical Context

**Language/Version**: TypeScript 5.5+ (Angular 18+)  
**Primary Dependencies**: Angular, Angular Material, Angular i18n  
**Storage**: N/A (UI-only changes)  
**Testing**: Jasmine/Karma for Angular unit tests  
**Target Platform**: Web browsers (modern browsers supporting Angular 18+)  
**Project Type**: web (frontend Angular + backend ASP.NET Core)  
**Performance Goals**: No performance impact, maintain current load times  
**Constraints**: Maintain existing functionality while simplifying UI components  
**Scale/Scope**: Frontend component replacement affecting ~6 custom components and associated styling

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Code Quality Standards ✓

- All changes will maintain existing linting and formatting standards
- Component simplification will improve maintainability by reducing custom code
- Standard Angular Material components provide better documentation and patterns

### II. Testing Excellence ✓

- Existing unit tests will be updated to reflect component changes
- Integration tests will verify functionality preservation during simplification
- Visual regression testing should be considered for UI changes

### III. User Experience Consistency ✓

- Standard Angular Material components ensure WCAG 2.1 AA compliance
- Consistent interaction patterns across all form controls
- Improved visual hierarchy with better spacing and contrast

### IV. Template-Driven Development ✓

- Following structured workflow: spec.md → plan.md → tasks.md → implementation
- All changes documented and trackable through template system

## Project Structure

### Documentation (this feature)

```
specs/004-further-rework-of/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 2: Web application (existing structure)
backend/
├── src/
│   ├── Models/
│   ├── Services/
│   └── Controllers/
└── tests/

frontend/
├── src/
│   ├── app/
│   │   ├── components/   # Target for component simplification
│   │   ├── services/     # Maintain existing services
│   │   └── styles/       # CSS updates for spacing/contrast
│   └── environments/
└── coverage/
```

**Structure Decision**: Option 2 - Web application (frontend Angular + backend ASP.NET Core)

## Phase 0: Outline & Research

**Research completed inline - no unknowns requiring external research**

### Key Research Areas Addressed:

1. **Angular Material Component Mapping**:

   - Decision: Use standard Angular Material components for all replacements
   - Rationale: Better accessibility, consistent behavior, reduced maintenance overhead
   - Alternatives considered: Custom component refactoring (rejected - increases complexity)

2. **Multiline Input Implementation**:

   - Decision: Use Angular Material textarea with mat-form-field
   - Rationale: Native multiline support with consistent Material Design styling
   - Alternatives considered: Custom textarea wrapper (rejected - unnecessary complexity)

3. **Contrast and Visibility Improvements**:

   - Decision: Use Angular Material color palettes with sufficient contrast ratios
   - Rationale: Ensures WCAG compliance and consistent theming
   - Alternatives considered: Custom CSS color schemes (rejected - harder to maintain)

4. **Layout Spacing Optimization**:
   - Decision: Use Angular Material layout utilities and CSS Grid/Flexbox
   - Rationale: Responsive design patterns with consistent spacing rules
   - Alternatives considered: Custom spacing system (rejected - reinvents framework patterns)

**Output**: Research findings integrated above - no separate research.md needed

## Phase 1: Design & Contracts

### Data Model (data-model.md)

UI Component mappings and styling requirements:

- **LocationInput**: String field, multiline capability, form validation
- **StatusMessage**: Display state, contrast requirements, visibility rules
- **LootItem**: Display object, consistent styling properties, no wealth-based variation
- **ComponentReplacements**: Mapping of custom to standard components

### Contracts (contracts/)

API contracts remain unchanged - this is purely a frontend UI refactoring. No backend API modifications required.

### Testing Scenarios (quickstart.md)

User acceptance testing scenarios for verifying UI improvements work correctly.

### Agent Context Update

Updated .github/copilot-instructions.md with UI simplification approach and Angular Material usage patterns.

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks focusing on component replacement and styling updates
- Each custom component → replacement task [P] (parallel execution possible)
- CSS/styling updates → visual improvement tasks
- Testing updates → test modification tasks

**Ordering Strategy**:

- TDD order: Update tests first, then implement changes
- Component isolation: Independent component replacements can run in parallel [P]
- Visual validation: Spacing and contrast fixes after component replacements

**Estimated Output**: 12-15 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, visual verification, user acceptance testing)

## Complexity Tracking

_No constitutional violations detected - section left empty_

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
- [x] Complexity deviations documented (none)

**Artifacts Generated**:

- [x] plan.md - Implementation plan (this file)
- [x] data-model.md - UI component structure and requirements
- [x] contracts/frontend-components.md - Component interface contracts
- [x] quickstart.md - User acceptance testing scenarios
- [x] .github/copilot-instructions.md - Updated with UI guidelines
- [x] tasks.md - 46 detailed implementation tasks with dependencies

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
