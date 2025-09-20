# Tasks: Warhammer Fantasy Loot Generator

**Input**: Design documents from `/specs/001-build-warhammer-fantasy/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow (main)

```
1. Load plan.md from feature directory ✅
   → Tech stack: C# 8.0+ (ASP.NET Core 6.0+), React 18+, OpenAI .NET SDK, Qdrant .NET client
   → Structure: Web application (frontend + backend)
2. Load design documents ✅:
   → data-model.md: LootItem, GenerationRequest, UserSession, WarhammerItem entities
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
- [x] T004 Create example Warhammer items JSON seed data in backend/Data/warhammer-lore-items.json

## Phase 3.2: Core Implementation

### Backend Models (Data-Model Entities)

- [ ] T005 [P] LootItem model in backend/src/Models/LootItem.cs
- [ ] T006 [P] GenerationRequest model in backend/src/Models/GenerationRequest.cs
- [ ] T007 [P] UserSession model in backend/src/Models/UserSession.cs
- [ ] T008 [P] WarhammerItem model in backend/src/Models/WarhammerItem.cs
- [ ] T009 [P] WealthLevel enum in backend/src/Models/WealthLevel.cs

### Backend Services (Core Business Logic)

- [ ] T010 [P] OpenAIService for loot generation with tests in backend/src/Services/OpenAIService.cs
- [ ] T011 [P] QdrantService for semantic search with tests in backend/src/Services/QdrantService.cs
- [ ] T012 [P] CooldownService for session management with tests in backend/src/Services/CooldownService.cs
- [ ] T013 [P] LootGenerationService orchestrating AI + vector search with tests in backend/src/Services/LootGenerationService.cs

### Backend Controllers (API Endpoints)

- [ ] T014 POST /api/loot/generate endpoint with OpenAI/Qdrant service registration and tests in backend/src/Controllers/LootController.cs + backend/src/Program.cs
- [ ] T015 GET /api/health endpoint with tests in backend/src/Controllers/HealthController.cs

### Frontend Components (UI Implementation)

- [ ] T016 [P] LootGenerator main component with tests in frontend/src/components/LootGenerator.tsx
- [ ] T017 [P] LanguageSelector component with React i18next and tests in frontend/src/components/LanguageSelector.tsx
- [ ] T018 [P] CooldownTimer component with tests in frontend/src/components/CooldownTimer.tsx
- [ ] T019 [P] LootItemDisplay component with currency formatting and tests in frontend/src/components/LootItemDisplay.tsx
- [ ] T020 [P] PriceToggle component with tests in frontend/src/components/PriceToggle.tsx

### Frontend Services and Utilities

- [ ] T021 [P] API service for backend communication with tests in frontend/src/services/apiService.ts
- [ ] T022 [P] Currency formatting utility with tests in frontend/src/utils/currencyFormatter.ts
- [ ] T023 [P] Session management utility with tests in frontend/src/utils/sessionManager.ts

## Phase 3.3: Integration (T024-T026)

- [ ] T024 Setup IMemoryCache for cooldown management in backend/src/Program.cs
- [ ] T025 Vector database seeding with canonical Warhammer items in backend/src/Services/DatabaseSeedingService.cs
- [ ] T026 CORS configuration for frontend-backend communication in backend/src/Program.cs

## Phase 3.4: Polish (T027-T029)

- [ ] T027 [P] End-to-end test for complete loot generation workflow in frontend/tests/e2e/lootGeneration.spec.ts
- [ ] T028 [P] Mobile responsiveness testing and fixes
- [ ] T029 Run quickstart.md manual testing scenarios validation

## Dependencies

- **Setup before Implementation**: T001-T004 → T005-T023
- **Models before Services**: T005-T009 → T010-T013
- **Services before Controllers**: T010-T013 → T014-T015
- **Core before Integration**: T005-T023 → T024-T026
- **Implementation before Polish**: T024-T026 → T027-T029

## Parallel Execution Examples

### Phase 3.2: Backend Models Launch

```bash
# Launch all model creation together (different files):
Task: "LootItem model in backend/src/Models/LootItem.cs"
Task: "GenerationRequest model in backend/src/Models/GenerationRequest.cs"
Task: "UserSession model in backend/src/Models/UserSession.cs"
Task: "WarhammerItem model in backend/src/Models/WarhammerItem.cs"
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

- POST /api/loot/generate → T014 implementation with tests
- GET /api/health → T015 implementation with tests

### From Data Model (data-model.md):

- LootItem entity → T005 model creation
- GenerationRequest entity → T006 model creation
- UserSession entity → T007 model creation
- WarhammerItem entity → T008 model creation
- WealthLevel enum → T009 model creation

### From User Stories (quickstart.md):

- All user stories will be validated through manual testing in T029

### From Tech Stack (plan.md):

- OpenAI .NET SDK → T010 OpenAIService, service registration in T014
- Qdrant .NET client → T011 QdrantService, service registration in T014
- React i18next → T017 LanguageSelector
- Material-UI → T016-T020 UI components

## Validation Checklist ✅

- [x] All contracts have corresponding implementations with tests (T014-T015)
- [x] All entities have model tasks (T005-T009)
- [x] Tests are integrated with implementation (not standalone)
- [x] Parallel tasks are in different files
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] Dependencies properly sequenced
- [x] Frontend and backend tasks appropriately separated
- [x] JSON seed data task added (T004)
- [x] Service registration moved to endpoint implementation (T014)

**Ready for Execution**: All 29 tasks generated, numbered, and validated ✅
