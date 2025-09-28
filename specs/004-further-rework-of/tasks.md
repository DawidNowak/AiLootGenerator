# Tasks: Further UI Rework for Simplicity

**Input**: Design documents from `/specs/004-further-rework-of/`
**Prerequisites**: plan.md (required), data-model.md, contracts/, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory ✓
   → TypeScript 5.5+ (Angular 18+), Angular Material components
   → Web application structure: frontend/src/, backend/src/
2. Load optional design documents: ✓
   → data-model.md: 6 custom components to replace with Material equivalents
   → contracts/: Frontend component interfaces and styling requirements
   → quickstart.md: 5 test scenarios for UI validation
3. Generate tasks by category: ✓
   → Setup: Dependency verification, linting updates
   → Tests: Component behavior tests, visual validation tests
   → Core: Component replacements, styling updates, layout fixes
   → Integration: Form integration, responsive design
   → Polish: Unit test updates, accessibility validation
4. Apply task rules: ✓
   → Different component files = mark [P] for parallel
   → Same file modifications = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness: ✓
   → All 6 custom components have replacement tasks
   → All styling improvements covered
   → All test scenarios have validation tasks
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `frontend/src/app/`, `frontend/src/styles/`
- Component paths: `frontend/src/app/components/[component-name]/`
- Test paths: `frontend/src/app/components/[component-name]/[component-name].component.spec.ts`

## Phase 3.1: Setup & Prerequisites

- [x] T001 Verify Angular Material dependencies are up to date in frontend/package.json
- [x] T002 [P] Update ESLint rules to support new Material component patterns in frontend/.eslintrc.json
- [x] T003 [P] Configure accessibility testing tools (axe-core) in frontend/karma.conf.js

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Component Behavior Tests [P]

- [x] T004 [P] Update LanguageSelector tests for mat-select replacement in frontend/src/app/components/language-selector/language-selector.component.spec.ts
- [x] T005 [P] Update WealthSelector tests for mat-select replacement in frontend/src/app/components/wealth-selector/wealth-selector.component.spec.ts
- [x] T006 [P] Update CooldownTimer tests for mat-progress-bar + text replacement in frontend/src/app/components/cooldown-timer/cooldown-timer.component.spec.ts
- [x] T007 [P] Update LootItem tests for mat-list-item replacement in frontend/src/app/components/loot-item/loot-item.component.spec.ts
- [x] T008 [P] Update LootList tests for mat-list replacement in frontend/src/app/components/loot-list/loot-list.component.spec.ts

### Layout and Styling Tests [P]

- [x] T009 [P] Add spacing validation test for generate button in frontend/src/app/components/loot-form/loot-form.component.spec.ts
- [x] T010 [P] Add status message contrast test in frontend/src/app/components/loot-form/loot-form.component.spec.ts
- [x] T011 [P] Add multiline location input test in frontend/src/app/components/loot-form/loot-form.component.spec.ts
- [x] T012 [P] Add uniform loot item styling test (no wealth-level differences) in frontend/src/app/components/loot-item/loot-item.component.spec.ts

### Integration Tests [P]

- [x] T013 [P] Add end-to-end user flow test for complete form interaction in frontend/src/app/components/loot-generator/loot-generator.component.spec.ts
- [x] T014 [P] Add accessibility compliance test suite for all components in frontend/src/app/accessibility.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Location Input & Form Layout

- [x] T015 Convert location input to multiline textarea with mat-form-field in frontend/src/app/components/loot-form/loot-form.component.html
- [x] T016 Update location input styling and validation in frontend/src/app/components/loot-form/loot-form.component.ts
- [x] T017 Reduce generate button bottom margin to 8px in frontend/src/app/components/loot-form/loot-form.component.scss

### Component Replacements [P - Different Components]

- [ ] T018 [P] Replace LanguageSelector custom logic with mat-select in frontend/src/app/components/language-selector/language-selector.component.html
- [ ] T019 [P] Replace WealthSelector custom logic with mat-select in frontend/src/app/components/wealth-selector/wealth-selector.component.html
- [ ] T020 [P] Replace CooldownTimer custom display with mat-progress-bar + text in frontend/src/app/components/cooldown-timer/cooldown-timer.component.html

### Loot Display Simplification

- [ ] T021 Replace LootList custom container with mat-list in frontend/src/app/components/loot-list/loot-list.component.html
- [ ] T022 Replace LootItem custom card with mat-list-item in frontend/src/app/components/loot-item/loot-item.component.html
- [ ] T023 Remove wealth-level based styling from LootItem component in frontend/src/app/components/loot-item/loot-item.component.scss
- [ ] T024 Remove all decorative icons from loot items in frontend/src/app/components/loot-item/loot-item.component.html

## Phase 3.4: Component Logic Updates

### TypeScript Implementation Updates

- [ ] T025 [P] Update LanguageSelector component logic for mat-select in frontend/src/app/components/language-selector/language-selector.component.ts
- [ ] T026 [P] Update WealthSelector component logic for mat-select in frontend/src/app/components/wealth-selector/wealth-selector.component.ts
- [ ] T027 [P] Update CooldownTimer component logic for mat-progress-bar in frontend/src/app/components/cooldown-timer/cooldown-timer.component.ts
- [ ] T028 [P] Update LootItem component logic to remove wealth-based styling in frontend/src/app/components/loot-item/loot-item.component.ts
- [ ] T029 [P] Update LootList component logic for mat-list in frontend/src/app/components/loot-list/loot-list.component.ts

### Status Message & Contrast Enhancement

- [ ] T030 Enhance status message contrast for "ready to generate" in frontend/src/app/components/loot-form/loot-form.component.scss
- [x] T031 Add price toggle with mat-checkbox in frontend/src/app/components/loot-form/loot-form.component.html

## Phase 3.5: Integration & Form Updates

### Parent Component Integration

- [ ] T032 Update LootForm to use simplified components in frontend/src/app/components/loot-form/loot-form.component.ts
- [ ] T033 Update LootGenerator main component imports in frontend/src/app/components/loot-generator/loot-generator.component.ts
- [ ] T034 Update App component imports to remove custom component references in frontend/src/app/app.component.ts

### Styling Integration

- [ ] T035 Update global styles to support uniform loot item styling in frontend/src/styles/components.scss
- [ ] T036 Remove unused custom component styling in frontend/src/styles/components.scss
- [ ] T037 Add responsive design validation for new Material components in frontend/src/styles/responsive.scss

## Phase 3.6: Polish & Validation

### Unit Test Updates [P]

- [ ] T038 [P] Update all component unit tests for new Material component structure in frontend/src/app/components/\*/
- [ ] T039 [P] Add visual regression tests for layout improvements in frontend/src/app/visual-regression.spec.ts
- [ ] T040 [P] Add performance tests to ensure no degradation in frontend/src/app/performance.spec.ts

### Accessibility & Documentation

- [ ] T041 [P] Run accessibility audit on all updated components using axe-core
- [ ] T042 [P] Update component documentation for new Material Design patterns in frontend/src/app/components/\*/README.md
- [ ] T043 [P] Validate WCAG AA compliance for status messages and form controls

### Final Validation

- [ ] T044 Execute quickstart.md test scenarios manually
- [ ] T045 Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] T046 Mobile responsive validation on updated components

## Dependencies

### Critical Path (Must Complete in Order)

1. **Setup** (T001-T003) before everything
2. **Tests** (T004-T014) before implementation
3. **Core Implementation** (T015-T024) before logic updates
4. **Logic Updates** (T025-T031) before integration
5. **Integration** (T032-T037) before polish
6. **Polish & Validation** (T038-T046) last

### Parallel Execution Blocks

- **Tests**: T004-T008, T009-T012, T013-T014 (different test files)
- **Component Replacements**: T018-T020 (different components)
- **Logic Updates**: T025-T029 (different component files)
- **Documentation**: T041-T043 (different activities)

## Parallel Example

```
# Phase 3.2 - Launch component tests together:
Task: "Update LanguageSelector tests for mat-select replacement in frontend/src/app/components/language-selector/language-selector.component.spec.ts"
Task: "Update WealthSelector tests for mat-select replacement in frontend/src/app/components/wealth-selector/wealth-selector.component.spec.ts"
Task: "Update CooldownTimer tests for mat-progress-bar + text replacement in frontend/src/app/components/cooldown-timer/cooldown-timer.component.spec.ts"
Task: "Update LootItem tests for mat-list-item replacement in frontend/src/app/components/loot-item/loot-item.component.spec.ts"

# Phase 3.3 - Launch HTML template updates together:
Task: "Replace LanguageSelector custom logic with mat-select in frontend/src/app/components/language-selector/language-selector.component.html"
Task: "Replace WealthSelector custom logic with mat-select in frontend/src/app/components/wealth-selector/wealth-selector.component.html"
Task: "Replace CooldownTimer custom display with mat-progress-bar + text in frontend/src/app/components/cooldown-timer/cooldown-timer.component.html"
```

## Notes

- [P] tasks = different files, no dependencies between components
- Verify all tests fail before implementing (TDD requirement)
- Commit after each completed task for rollback capability
- Maintain existing functionality while simplifying UI
- Focus on consistent Material Design patterns

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - 6 custom components → 6 replacement task groups
   - Each component interface → behavior test + implementation task
2. **From Data Model**:

   - LocationInput → multiline textarea tasks
   - StatusMessage → contrast enhancement tasks
   - LootItem → styling unification tasks
   - ComponentMapping → systematic replacement tasks

3. **From Quickstart Scenarios**:

   - Scenario 1 → layout spacing tasks (T015, T017)
   - Scenario 2 → status visibility tasks (T030)
   - Scenario 3 → multiline input tasks (T015, T016)
   - Scenario 4 → component replacement tasks (T018-T020)
   - Scenario 5 → styling unification tasks (T023, T024)

4. **Ordering Rules**:
   - TDD: Tests (T004-T014) → Implementation (T015-T031)
   - Dependencies: HTML templates → TypeScript logic → Integration
   - Parallel: Different components can be modified simultaneously

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All 6 custom components have replacement tasks
- [x] All styling improvements have specific tasks
- [x] All 5 quickstart scenarios have corresponding validation tasks
- [x] Parallel tasks target different files (no conflicts)
- [x] Each task specifies exact file path
- [x] TDD ordering enforced (tests before implementation)
- [x] Integration tasks connect component updates to parent forms
- [x] Polish tasks include accessibility and performance validation
