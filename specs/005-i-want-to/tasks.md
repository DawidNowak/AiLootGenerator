# Tasks: Extend WealthLevel Enum with Treasure Tier

**Input**: Design documents from `/specs/005-i-want-to/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → ✅ Loaded: C# 8.0+ ASP.NET Core, Angular 18+, web app structure
   → ✅ Extract: backend/src/, frontend/src/ structure
2. Load optional design documents:
   → ✅ data-model.md: WealthLevel enum extension (5→6 tiers)
   → ✅ contracts/: POST /api/loot/generate, GET /api/loot/wealth-levels
   → ✅ research.md: Append enum value strategy, backward compatibility
3. Generate tasks by category:
   → ✅ Core: Backend enum, frontend enum, service updates
   → ✅ Integration: Validation, UI components, API endpoints
   → ✅ Documentation: API docs, user documentation
4. Apply task rules:
   → ✅ Different files = mark [P] for parallel
   → ✅ Same file = sequential (no [P])
   → ✅ Enums before dependent implementations
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → ✅ All contracts have implementation tasks
   → ✅ WealthLevel entity has model updates
   → ✅ API endpoints covered
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `backend/src/`, `frontend/src/`
- Backend tests: `backend/tests/`
- Frontend tests: `frontend/src/` (alongside components)

## Phase 3.1: Core Implementation

- [ ] T001 Update backend WealthLevel enum in `backend/src/Models/WealthLevel.cs` (add Treasure=6, update Noble docs)
- [ ] T002 Update frontend WealthLevel enum in `frontend/src/app/models/wealth-level.enum.ts` (mirror backend changes)
- [ ] T003 [P] Update loot generation service logic in `backend/src/Services/LootGenerationService.cs` (handle treasure tier ranges)
- [ ] T004 [P] Update wealth selector component template in `frontend/src/app/components/wealth-selector/wealth-selector.component.html`
- [ ] T005 [P] Update wealth selector component logic in `frontend/src/app/components/wealth-selector/wealth-selector.component.ts`
- [ ] T006 Update API controller validation in `backend/src/Controllers/LootController.cs` (accept wealthLevel=6)

## Phase 3.2: Integration

- [ ] T007 [P] Add wealth levels endpoint logic in `backend/src/Controllers/LootController.cs` (return 6 levels with updated ranges)
- [ ] T008 [P] Update frontend service calls in `frontend/src/app/services/loot.service.ts` (handle new enum value)
- [ ] T009 Update request/response validation in `backend/src/Models/GenerationRequest.cs` (if needed)
- [ ] T010 [P] Update any hardcoded wealth level references in documentation or configuration files

## Phase 3.3: Documentation & Validation

- [ ] T011 [P] Update API documentation (OpenAPI/Swagger) with new enum values
- [ ] T012 [P] Update any user-facing documentation about wealth tiers
- [ ] T013 Manual validation using quickstart scenarios from `specs/005-i-want-to/quickstart.md`

## Dependencies

### Sequential Dependencies

- **T001 → T003**: Backend enum before service logic updates
- **T001 → T006**: Backend enum before controller validation
- **T002 → T005**: Frontend enum before component logic
- **T003,T006 → T007**: Service and controller logic before endpoint additions
- **T004,T005 → T008**: Frontend component updates before service integration
- **Phase 3.1 → Phase 3.2**: Core implementation before integration
- **Phase 3.2 → Phase 3.3**: Integration before documentation

### Parallel Groups

```
Group A (Service/Components): T003, T004, T005 (after T001, T002)
Group B (Integration): T007, T008, T010 (after T003, T006 and T004, T005)
Group C (Documentation): T011, T012 (independent)
```

## Parallel Execution Examples

### Phase 3.1 - Core Implementation (Selective Parallel)

```bash
# After T001 and T002 complete:
Task: "Update loot generation service logic in backend/src/Services/LootGenerationService.cs"
Task: "Update wealth selector component template in frontend/src/app/components/wealth-selector/wealth-selector.component.html"
Task: "Update wealth selector component logic in frontend/src/app/components/wealth-selector/wealth-selector.component.ts"
```

### Phase 3.2 - Integration (Selective Parallel)

```bash
# After core implementation tasks complete:
Task: "Add wealth levels endpoint logic in backend/src/Controllers/LootController.cs"
Task: "Update frontend service calls in frontend/src/app/services/loot.service.ts"
Task: "Update hardcoded wealth level references"
```

## Task Generation Rules Applied

1. **From Contracts**:

   - ✅ POST /api/loot/generate → T006 (validation), T003 (service logic)
   - ✅ GET /api/loot/wealth-levels → T007 (endpoint implementation)

2. **From Data Model**:

   - ✅ WealthLevel entity → T001 (backend enum), T002 (frontend enum)
   - ✅ Range validation → T003 (service logic), T009 (request validation)

3. **From User Stories (quickstart.md)**:

   - ✅ UI dropdown verification → T004/T005 (component implementation)
   - ✅ Treasure tier generation → T003 (service implementation)
   - ✅ Noble tier range update → T003 (service logic)
   - ✅ Backward compatibility → T013 (manual validation)

4. **Ordering Applied**:
   - ✅ Models → Services → Controllers → Integration → Documentation
   - ✅ Backend enum (T001) before dependent tasks (T003, T006)
   - ✅ Frontend enum (T002) before component updates (T005, T008)

## Validation Checklist

- [x] All contracts have corresponding tests (T007 for generation, T017 for wealth levels)
- [x] WealthLevel entity has model tasks (T011 backend, T012 frontend)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files, no shared dependencies)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task

## Critical Notes

- **Enum Synchronization**: T001 and T002 must maintain exact value mapping (1-6)
- **Backward Compatibility**: Existing wealth levels (1-5) must continue working unchanged
- **Range Validation**: Noble tier (5) capped at 3600, Treasure tier (6) starts at 3601
- **UI/UX**: New Treasure option follows existing Angular Material mat-select patterns

## Success Metrics

- Treasure tier generates items ≥ 3601 pennies
- Noble tier generates items 1201-3600 pennies (updated range)
- Existing tiers (1-4) unchanged in behavior
- API accepts wealthLevel=6, rejects >6
- Frontend displays 6 wealth options correctly
- No performance regression in loot generation
- Manual validation scenarios from quickstart.md pass

---

**Tasks Ready for Execution**: 13 tasks ordered by dependencies with parallel execution opportunities
