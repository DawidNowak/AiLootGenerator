# Tasks: UI Layout and Visual Improvements

**Input**: Design documents from `/specs/003-further-rework-ui/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory ✅
   → Tech stack: Angular 18+, TypeScript 5.5+, Angular Material
   → Structure: Web application (frontend focus)
2. Load optional design documents ✅:
   → data-model.md: Component interface changes identified
   → contracts/: Component and testing contracts analyzed
   → research.md: CSS Grid and responsive design decisions
3. Generate tasks by category ✅:
   → Setup: SCSS structure, responsive utilities
   → Tests: Component tests, responsive behavior tests
   → Core: Component updates, CSS improvements
   → Integration: Layout coordination, breakpoint handling
   → Polish: Cross-browser testing, accessibility validation
4. Apply task rules ✅:
   → Different components = mark [P] for parallel
   → Same files = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✅
6. Generate dependency graph ✅
7. Create parallel execution examples ✅
8. Validate task completeness ✅:
   → All components have tests ✅
   → All UI contracts covered ✅
   → All responsive behaviors tested ✅
9. Return: SUCCESS (tasks ready for execution) ✅
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for Angular components and styles
- **Tests**: `frontend/src/` for component tests
- Paths assume frontend-focused changes as per implementation plan

## Phase 3.1: Setup

- [x] T001 Configure SCSS variables for responsive breakpoints in frontend/src/styles/variables.scss
- [x] T002 [P] Set up CSS Grid utility classes in frontend/src/styles/layout.scss
- [x] T003 [P] Configure Angular BreakpointObserver service imports in affected components

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [x] T004 [P] Unit tests for WealthSelectorComponent icon removal in frontend/src/app/components/wealth-selector/wealth-selector.component.spec.ts
- [x] T005 [P] Unit tests for LootListComponent list layout in frontend/src/app/components/loot-list/loot-list.component.spec.ts
- [x] T006 [P] Unit tests for LootGeneratorComponent responsive layout in frontend/src/app/components/loot-generator/loot-generator.component.spec.ts
- [x] T007 [P] Unit tests for AppComponent header visibility in frontend/src/app/app.component.spec.ts
- [x] T008 [P] Responsive behavior integration tests in frontend/src/app/components/loot-generator/loot-generator.responsive.spec.ts
- [x] T009 [P] Cross-component layout integration tests in frontend/src/app/app.integration.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [x] T010 Fix header visibility CSS issues in frontend/src/app/app.component.scss
- [x] T011 [P] Remove icons from WealthSelectorComponent template in frontend/src/app/components/wealth-selector/wealth-selector.component.html
- [x] T012 [P] Add penny range display to WealthSelectorComponent in frontend/src/app/components/wealth-selector/wealth-selector.component.ts
- [x] T013 [P] Update WealthSelectorComponent styles for simplified display in frontend/src/app/components/wealth-selector/wealth-selector.component.scss
- [x] T014 [P] Convert LootListComponent from cards to list layout in frontend/src/app/components/loot-list/loot-list.component.html
- [x] T015 [P] Update LootListComponent styles for vertical list in frontend/src/app/components/loot-list/loot-list.component.scss
- [x] T016 Add responsive container to LootGeneratorComponent template in frontend/src/app/components/loot-generator/loot-generator.component.html
- [x] T017 Implement BreakpointObserver logic in LootGeneratorComponent in frontend/src/app/components/loot-generator/loot-generator.component.ts
- [x] T018 Add responsive CSS Grid styles to LootGeneratorComponent in frontend/src/app/components/loot-generator/loot-generator.component.scss

## Phase 3.4: Integration

- [x] T019 Coordinate layout state between LootGeneratorComponent and LootListComponent
- [x] T020 Test responsive transitions between mobile and desktop layouts
- [x] T021 Validate component communication with new layout structure
- [x] T022 Ensure accessibility attributes preserved across layout changes

## Phase 3.5: Polish

- [x] T023 [P] Cross-browser testing for CSS Grid compatibility (Chrome, Firefox, Safari, Edge)
- [x] T024 [P] Performance testing for responsive transition smoothness (<300ms)
- [x] T025 [P] Accessibility validation using axe-core for all modified components
- [x] T026 [P] Visual regression testing with screenshot comparisons
- [x] T027 Execute quickstart.md validation scenarios
- [x] T028 Update component documentation for new responsive behavior

## Dependencies

- Setup (T001-T003) before all other tasks
- Tests (T004-T009) before implementation (T010-T018)
- T010 (header fix) can run independently
- T011-T013 (WealthSelector) must be sequential (same component)
- T014-T015 (LootList) must be sequential (same component)
- T016-T018 (LootGenerator) must be sequential (same component)
- Integration (T019-T022) requires core implementation complete
- Polish (T023-T028) requires integration complete

## Parallel Example

```
# Launch T004-T009 together (all different test files):
Task: "Unit tests for WealthSelectorComponent icon removal in frontend/src/app/components/wealth-selector/wealth-selector.component.spec.ts"
Task: "Unit tests for LootListComponent list layout in frontend/src/app/components/loot-list/loot-list.component.spec.ts"
Task: "Unit tests for LootGeneratorComponent responsive layout in frontend/src/app/components/loot-generator/loot-generator.component.spec.ts"
Task: "Unit tests for AppComponent header visibility in frontend/src/app/app.component.spec.ts"
Task: "Responsive behavior integration tests in frontend/src/app/components/loot-generator/loot-generator.responsive.spec.ts"
Task: "Cross-component layout integration tests in frontend/src/app/app.integration.spec.ts"

# Launch T011, T014 together (different components):
Task: "Remove icons from WealthSelectorComponent template in frontend/src/app/components/wealth-selector/wealth-selector.component.html"
Task: "Convert LootListComponent from cards to list layout in frontend/src/app/components/loot-list/loot-list.component.html"
```

## Notes

- [P] tasks target different files/components with no dependencies
- All CSS changes use existing Angular Material theming variables
- Maintain existing component APIs to prevent breaking changes
- Tests must verify responsive behavior at 768px breakpoint
- Visual regression tests should capture both mobile and desktop layouts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Component contracts → component modification tasks
   - Testing contracts → comprehensive test tasks [P]
2. **From Data Model**:
   - Component interface changes → TypeScript property updates
   - UI state management → BreakpointObserver integration
3. **From Quickstart Scenarios**:

   - Header visibility test → CSS fixes (T010)
   - Wealth dropdown test → icon removal and penny ranges (T011-T013)
   - Responsive layout tests → CSS Grid implementation (T016-T018)
   - List layout test → card to list conversion (T014-T015)

4. **Ordering**:
   - Setup → Tests → Component Updates → Integration → Validation
   - Within components: Template → TypeScript → SCSS (sequential)
   - Across components: Parallel execution where possible

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All component contracts have corresponding tests (T004-T009)
- [x] All UI changes have implementation tasks (T010-T018)
- [x] All tests come before implementation (T004-T009 → T010-T018)
- [x] Parallel tasks truly independent (different files/components)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Responsive behavior thoroughly tested
- [x] Accessibility compliance maintained throughout
