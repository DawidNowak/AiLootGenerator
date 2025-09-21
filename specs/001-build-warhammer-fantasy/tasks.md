# Tasks: Warhammer Fantasy Loot Generator

**Input**: Design documents from `/specs/001-build-warhammer-fantasy/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow (main)

```
1. Load plan.md from feature directory ✅
   → Tech stack: C# 8.0+ (ASP.NET Core 6.0+), React 18+, OpenAI .NET SDK, Qdrant .NET client
   → Structure: Web application (frontend + backend)
2. Load design documents ✅:
   → data-model.md: LootItem, GenerationRequest, LoreItem entities
   → contracts/openapi.yaml: POST /api/loot/generate, GET /api/health endpoints
   → research.md: OpenAI .NET SDK, Qdrant client, Material-UI decisions
   → quickstart.md: 7 user stories + edge cases
3. Generate tasks by category: Setup → Tests → Core → Integration → Polish
4. Apply task rules: Different files = [P], Tests before implementation (TDD)
5. Number tasks sequentially (T001-T029)
6. Validate completeness: All contracts tested, all entities modeled
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Paths assume web app structure: `backend/src/`, `frontend/src/`

## Phase 3.1: Setup (T001-T004)

- [x] T001 Create project structure per plan.md (backend/ and frontend/ directories)
- [x] T002 Initialize backend ASP.NET Core 6.0 project with OpenAI .NET SDK, Qdrant .NET client dependencies
- [x] T003 Initialize frontend React 18 project with Material-UI, React i18next, TypeScript dependencies
- [x] T004 Create example Warhammer items JSON seed data in backend/Data/weapons.json

## Phase 3.2: Core Implementation

### Backend Models (Data-Model Entities)

- [x] T005 [P] LootItem model in backend/src/Models/LootItem.cs
- [x] T006 [P] GenerationRequest model in backend/src/Models/GenerationRequest.cs
- [x] T007 [P] LoreItem model in backend/src/Models/LoreItem.cs
- [ ] T008 [P] WealthLevel enum in backend/src/Models/WealthLevel.cs

### Backend Services (Core Business Logic)

- [ ] T009 [P] OpenAIService for loot generation with tests in backend/src/Services/OpenAIService.cs
- [ ] T010 [P] QdrantService for semantic search with tests in backend/src/Services/QdrantService.cs
- [ ] T011 [P] CooldownService for session management with tests in backend/src/Services/CooldownService.cs
- [ ] T012 [P] LootGenerationService orchestrating AI + vector search with tests in backend/src/Services/LootGenerationService.cs

### Backend Controllers (API Endpoints)

- [ ] T013 POST /api/loot/generate endpoint with OpenAI/Qdrant service registration and tests in backend/src/Controllers/LootController.cs + backend/src/Program.cs
- [ ] T014 GET /api/health endpoint with tests in backend/src/Controllers/HealthController.cs

### Frontend Components (UI Implementation)

- [ ] T015 [P] LootGenerator main component with tests in frontend/src/components/LootGenerator.tsx
- [ ] T016 [P] LanguageSelector component with React i18next and tests in frontend/src/components/LanguageSelector.tsx
- [ ] T017 [P] CooldownTimer component with tests in frontend/src/components/CooldownTimer.tsx
- [ ] T018 [P] LootItemDisplay component with currency formatting and tests in frontend/src/components/LootItemDisplay.tsx
- [ ] T019 [P] PriceToggle component with tests in frontend/src/components/PriceToggle.tsx

### Frontend Services and Utilities

- [ ] T020 [P] API service for backend communication with tests in frontend/src/services/apiService.ts
- [ ] T021 [P] Currency formatting utility with tests in frontend/src/utils/currencyFormatter.ts
- [ ] T022 [P] Session management utility with tests in frontend/src/utils/sessionManager.ts

## Phase 3.3: Integration (T023-T025)

- [ ] T023 Setup IMemoryCache for cooldown management in backend/src/Program.cs
- [ ] T024 Vector database seeding with canonical Warhammer items in backend/src/Services/DatabaseSeedingService.cs
- [ ] T025 CORS configuration for frontend-backend communication in backend/src/Program.cs

## Phase 3.4: Polish (T026-T028)

- [ ] T026 [P] End-to-end test for complete loot generation workflow in frontend/tests/e2e/lootGeneration.spec.ts
- [ ] T027 [P] Mobile responsiveness testing and fixes
- [ ] T028 Run quickstart.md manual testing scenarios validation

## Dependencies

- **Setup before Implementation**: T001-T004 → T005-T022
- **Models before Services**: T005-T008 → T009-T012
- **Services before Controllers**: T009-T012 → T013-T014
- **Core before Integration**: T005-T022 → T023-T025
- **Implementation before Polish**: T023-T025 → T026-T028

## Parallel Execution Examples

### Phase 3.2: Backend Models Launch

```bash
# Launch all model creation together (different files):
Task: "LootItem model in backend/src/Models/LootItem.cs"
Task: "GenerationRequest model in backend/src/Models/GenerationRequest.cs"
Task: "LoreItem model in backend/src/Models/LoreItem.cs"
Task: "WealthLevel enum in backend/src/Models/WealthLevel.cs"
```

### Phase 3.2: Backend Services Launch

```bash
# Launch all service creation together (different files):
Task: "OpenAIService for loot generation with tests in backend/src/Services/OpenAIService.cs"
Task: "QdrantService for semantic search with tests in backend/src/Services/QdrantService.cs"
Task: "CooldownService for session management with tests in backend/src/Services/CooldownService.cs"
Task: "LootGenerationService orchestrating AI + vector search with tests in backend/src/Services/LootGenerationService.cs"
```

### Phase 3.2: Frontend Components Launch

```bash
# Launch all component creation together (different files):
Task: "LootGenerator component with tests in frontend/src/components/LootGenerator.tsx"
Task: "LanguageSelector component with tests in frontend/src/components/LanguageSelector.tsx"
Task: "CooldownTimer component with tests in frontend/src/components/CooldownTimer.tsx"
Task: "LootItemDisplay component with tests in frontend/src/components/LootItemDisplay.tsx"
Task: "PriceToggle component with tests in frontend/src/components/PriceToggle.tsx"
```

## Task Generation Rules Applied

### From Contracts (openapi.yaml):

- POST /api/loot/generate → T013 implementation with tests
- GET /api/health → T014 implementation with tests

### From Data Model (data-model.md):

- LootItem entity → T005 model creation
- GenerationRequest entity → T006 model creation
- LoreItem entity → T007 model creation
- WealthLevel enum → T008 model creation

### From User Stories (quickstart.md):

- All user stories will be validated through manual testing in T028

### From Tech Stack (plan.md):

- OpenAI .NET SDK → T009 OpenAIService, service registration in T013
- Qdrant .NET client → T010 QdrantService, service registration in T013
- React i18next → T016 LanguageSelector
- Material-UI → T015-T019 UI components

## Validation Checklist ✅

- [x] All contracts have corresponding implementations with tests (T013-T014)
- [x] All entities have model tasks (T005-T008)
- [x] Tests are integrated with implementation (not standalone)
- [x] Parallel tasks are in different files
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] Dependencies properly sequenced
- [x] Frontend and backend tasks appropriately separated
- [x] JSON seed data task added (T004)
- [x] Service registration moved to endpoint implementation (T013)

**Ready for Execution**: All 28 tasks generated, numbered, and validated ✅
