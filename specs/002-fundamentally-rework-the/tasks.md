# Tasks: Modern Minimalistic Frontend Redesign

**Input**: Design documents from `/specs/002-fundamentally-rework-the/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths assume frontend focus with existing backend unchanged
- All frontend paths relative to `frontend/src/`

## Phase 3.1: Setup and Theme Foundation

- [x] T001 [P] Create light theme SCSS files in `frontend/src/styles/themes/`
- [x] T002 [P] Create animation-disabled styles in `frontend/src/styles/global/animations-disabled.scss`
- [x] T003 [P] Configure CSS custom properties for light theme in `frontend/src/styles/themes/light-variables.scss`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [x] T004 [P] Component integration contract test in `frontend/src/app/components/loot-form/loot-form.component.spec.ts` - test for eliminated separate components
- [x] T005 [P] Light theme application contract test in `frontend/src/app/components/loot-form/loot-form.component.spec.ts` - test theme variables
- [x] T006 [P] Animation elimination contract test in `frontend/src/app/components/loot-form/loot-form.component.spec.ts` - test no transitions
- [x] T007 [P] User interaction integration test in `frontend/src/app/components/loot-form/loot-form.component.spec.ts` - test direct form controls

## Phase 3.3: Component Integration (ONLY after tests are failing)

- [x] T008 Remove LocationInputComponent imports and references from `frontend/src/app/components/loot-form/loot-form.component.ts`
- [x] T009 Remove GenerateButtonComponent imports and references from `frontend/src/app/components/loot-form/loot-form.component.ts`
- [x] T010 Add Angular Material form modules to `frontend/src/app/components/loot-form/loot-form.component.ts` imports
- [x] T011 Integrate location input directly in `frontend/src/app/components/loot-form/loot-form.component.html`
- [x] T012 Integrate generate button directly in `frontend/src/app/components/loot-form/loot-form.component.html`
- [x] T013 Update component class methods in `frontend/src/app/components/loot-form/loot-form.component.ts` for direct form handling
- [x] T014 Remove event handlers for eliminated child components in `frontend/src/app/components/loot-form/loot-form.component.ts`

## Phase 3.4: Theme Application and Styling

- [x] T015 [P] Apply light theme styles to LootFormComponent in `frontend/src/app/components/loot-form/loot-form.component.scss`
- [x] T016 [P] Configure Angular Material theme in `frontend/src/styles.scss`
- [x] T017 [P] Apply animation elimination styles globally in `frontend/src/styles.scss`
- [x] T018 Update form field styling for integrated controls in `frontend/src/app/components/loot-form/loot-form.component.scss`

## Phase 3.5: Component Cleanup

- [x] T019 [P] Delete `frontend/src/app/components/location-input/` directory and all files
- [x] T020 [P] Delete `frontend/src/app/components/generate-button/` directory and all files
- [x] T021 [P] Remove LocationInputComponent and GenerateButtonComponent from any barrel exports
- [x] T022 [P] Update imports in any other components that might reference deleted components

## Phase 3.6: Test Updates and Validation

- [x] T023 Update existing LootFormComponent tests to expect integrated structure in `frontend/src/app/components/loot-form/loot-form.component.spec.ts`
- [x] T024 [P] Delete location-input component tests in `frontend/src/app/components/location-input/location-input.component.spec.ts`
- [x] T025 [P] Delete generate-button component tests in `frontend/src/app/components/generate-button/generate-button.component.spec.ts`
- [x] T026 Run Angular CLI tests to verify all test cases pass
- [x] T027 Manual testing following `quickstart.md` validation steps

## Phase 3.7: Polish and Documentation

- [x] T028 [P] Update component documentation for integrated LootFormComponent
- [x] T029 [P] Performance validation - verify bundle size reduction
- [x] T030 [P] Accessibility validation - ensure keyboard navigation and screen readers work
- [x] T031 Final validation run of `quickstart.md` complete workflow

## Dependencies

- Theme setup (T001-T003) before styling (T015-T018)
- Tests (T004-T007) before implementation (T008-T014)
- Component integration (T008-T014) before theme application (T015-T018)
- Integration complete before cleanup (T019-T022)
- Tests updated (T023-T025) before validation (T026-T027)
- All implementation before polish (T028-T031)

## Parallel Example

```
# Launch T001-T003 together (theme foundation):
Task: "Create light theme SCSS files in frontend/src/styles/themes/"
Task: "Create animation-disabled styles in frontend/src/styles/global/animations-disabled.scss"
Task: "Configure CSS custom properties in frontend/src/styles/themes/light-variables.scss"

# Launch T004-T007 together (contract tests):
Task: "Component integration contract test - test for eliminated separate components"
Task: "Light theme application contract test - test theme variables"
Task: "Animation elimination contract test - test no transitions"
Task: "User interaction integration test - test direct form controls"

# Launch T015-T017 together (theme application):
Task: "Apply light theme styles to LootFormComponent styling"
Task: "Configure Angular Material theme in styles.scss"
Task: "Apply animation elimination styles globally"

# Launch T019-T022 together (cleanup):
Task: "Delete location-input component directory and files"
Task: "Delete generate-button component directory and files"
Task: "Remove components from barrel exports"
Task: "Update imports in other components"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (T004-T007 MUST fail initially)
- Theme foundation must be complete before theme application
- Component integration must be complete before cleanup
- Commit after each major phase completion
- Avoid: modifying same files in parallel tasks

## Task Generation Rules Applied

1. **From Contracts**:

   - Component integration contract → T004 contract test
   - Theme configuration contract → T005 contract test
   - User interaction contract → T006, T007 contract tests

2. **From Data Model**:

   - Form Interface entity → T008-T014 integration tasks
   - Visual Theme entity → T001-T003, T015-T018 theme tasks
   - User Interactions entity → T006-T007, T017 interaction tasks

3. **From User Stories** (quickstart.md):

   - Load application story → T004, T026-T027 validation tasks
   - User interaction story → T007, T026-T027 validation tasks
   - Form completion story → T004-T007, T026-T027 validation tasks

4. **Ordering**:
   - Setup → Tests → Integration → Styling → Cleanup → Validation → Polish
   - Dependencies prevent conflicting parallel execution

## Validation Checklist

_GATE: Checked before execution_

- [x] All contracts have corresponding tests (T004-T007)
- [x] All entities have implementation tasks (Form Interface: T008-T014, Theme: T001-T003,T015-T018)
- [x] All tests come before implementation (T004-T007 before T008-T014)
- [x] Parallel tasks truly independent (different files/directories)
- [x] Each task specifies exact file path or directory
- [x] No task modifies same file as another [P] task
- [x] Component cleanup after integration completion
- [x] All functional requirements addressed through tasks
