# Implementation Plan: UI Layout and Visual Improvements

**Branch**: `003-further-rework-ui` | **Date**: September 28, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-further-rework-ui/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path ✅
   → Spec loaded successfully
2. Fill Technical Context ✅
   → Project Type: web (Angular frontend detected)
   → Structure Decision: Option 2 (Web application)
3. Fill the Constitution Check section ✅
4. Evaluate Constitution Check section ✅
   → No violations detected
   → Update Progress Tracking: Initial Constitution Check ✅
5. Execute Phase 0 → research.md ✅
   → All technical details clear from existing codebase
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md ✅
7. Re-evaluate Constitution Check section ✅
   → No new violations
   → Update Progress Tracking: Post-Design Constitution Check ✅
8. Plan Phase 2 → Task generation approach described ✅
9. STOP - Ready for /tasks command ✅
```

## Summary

Primary requirement: Improve UI layout and visual design by fixing header visibility issues, implementing responsive layout for loot results (side-by-side on desktop, stacked on mobile), replacing card-based loot display with list format, and simplifying wealth level dropdown by removing icons. Technical approach focuses on Angular component updates, responsive CSS improvements, and Angular Material design system optimization for better user experience across device types.

## Technical Context

**Language/Version**: TypeScript 5.5+ (Angular 18+)  
**Primary Dependencies**: Angular, Angular Material, Angular i18n  
**Storage**: N/A (UI-only changes)  
**Testing**: Angular testing utilities, Jasmine, Karma  
**Target Platform**: Web browsers (desktop and mobile)  
**Project Type**: web (Angular frontend with ASP.NET Core backend)  
**Performance Goals**: Smooth responsive transitions, 60fps animations  
**Constraints**: Maintain existing functionality, preserve accessibility, mobile-first responsive design  
**Scale/Scope**: 5-7 Angular components, 3-4 SCSS files, responsive breakpoint optimization

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Code Quality Standards

✅ **COMPLIANT**: UI changes follow existing Angular patterns and TypeScript standards. Component architecture maintains separation of concerns. SCSS follows BEM methodology already established.

### II. Testing Excellence (NON-NEGOTIABLE)

✅ **COMPLIANT**: All component changes will maintain existing unit tests and add responsive behavior tests. Visual regression testing for layout changes. Mobile viewport testing mandatory.

### III. User Experience Consistency

✅ **COMPLIANT**: Changes improve UX consistency by standardizing layout patterns and simplifying interface elements. Maintains Angular Material design language. Accessibility preserved through semantic HTML structure.

### IV. Template-Driven Development

✅ **COMPLIANT**: Following spec.md → plan.md → tasks.md → implementation workflow. UI changes are well-defined with clear acceptance criteria.

**Gate Status**: ✅ PASS - No constitutional violations identified.

## Project Structure

### Documentation (this feature)

```
specs/003-further-rework-ui/
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
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/        # Target: UI component updates
│   │   ├── wealth-selector/
│   │   ├── loot-list/
│   │   ├── loot-generator/
│   │   └── loot-item/
│   ├── app/              # Target: Main layout updates
│   └── styles/           # Target: Responsive styling
└── tests/
```

**Structure Decision**: Option 2 (Web application) - Angular frontend with component-based architecture

## Phase 0: Outline & Research

No unknowns identified - all technical context is clear from existing Angular 18+ codebase analysis. Research shows:

- **Decision**: Use Angular Flex Layout with CSS Grid for responsive design
- **Rationale**: Angular Material already integrated, CSS Grid provides precise control over layout transitions
- **Alternatives considered**: CSS Flexbox alone (insufficient for complex responsive requirements)

- **Decision**: Maintain Angular Material theming system
- **Rationale**: Consistency with existing design system, accessibility features built-in
- **Alternatives considered**: Custom CSS framework (unnecessary complexity)

- **Decision**: Use Angular's built-in responsive utilities and breakpoint observer
- **Rationale**: Framework-native solution, performant, well-tested
- **Alternatives considered**: External responsive libraries (additional dependencies)

**Output**: ✅ research.md complete (all decisions clear from existing codebase)

## Phase 1: Design & Contracts

_Prerequisites: research.md complete ✅_

### Data Model

No new entities required - UI-only changes working with existing LootItem interface.

### Component Contracts

- **WealthSelectorComponent**: Remove icon properties, add penny range display method
- **LootListComponent**: Change from card grid to vertical list layout
- **LootGeneratorComponent**: Implement responsive container with CSS Grid
- **AppComponent**: Fix header visibility through CSS improvements

### Test Contracts

- Responsive layout tests for breakpoint transitions
- Component rendering tests for simplified wealth selector
- Visual regression tests for list vs card layout
- Accessibility tests for header visibility

### Integration Patterns

Standard Angular component communication patterns maintained. No API changes required.

**Output**: ✅ data-model.md, /contracts/\*, quickstart.md, .github/copilot-instructions.md updated

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Component modification tasks for each affected Angular component
- SCSS styling tasks for responsive layout implementation
- Test update tasks for each component change
- Integration testing tasks for responsive behavior
- Visual regression testing setup

**Ordering Strategy**:

- CSS foundation changes first (header visibility, responsive grid)
- Component updates in dependency order (wealth-selector → loot-list → loot-generator → app)
- Test updates parallel to component changes [P]
- Integration testing after all components updated

**Estimated Output**: 12-15 numbered, ordered tasks focusing on incremental UI improvements

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (Angular component updates, SCSS styling, responsive behavior)  
**Phase 5**: Validation (component tests, responsive testing, visual regression validation)

## Complexity Tracking

_No constitutional violations identified_

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

**Artifact Status**:

- [x] research.md generated
- [x] data-model.md generated
- [x] contracts/ directory created with component and testing contracts
- [x] quickstart.md generated
- [x] .github/copilot-instructions.md updated

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
