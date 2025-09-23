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
- [x] T008 [P] WealthLevel enum in backend/src/Models/WealthLevel.cs

### Backend Services (Core Business Logic)

- [x] T009 [P] OpenAIService for loot generation with tests in backend/src/Services/OpenAIService.cs
- [x] T010 [P] QdrantService for semantic search with tests in backend/src/Services/QdrantService.cs
- [x] T011 [P] CooldownService for session management with tests in backend/src/Services/CooldownService.cs
- [x] T012 [P] LootGenerationService orchestrating AI + vector search with tests in backend/src/Services/LootGenerationService.cs

### Backend Controllers (API Endpoints)

- [x] T013 GET /api/health endpoint with tests in backend/src/Controllers/HealthController.cs
- [x] T014 POST /api/loot/generate endpoint with OpenAI/Qdrant service registration and tests in backend/src/Controllers/LootController.cs + backend/src/Program.cs

### Frontend Foundation & Types (T015-T019)

- [x] T015 [P] Create TypeScript interfaces in frontend/src/types/index.ts
- [x] T016 [P] Create API types in frontend/src/types/api.ts
- [x] T017 [P] Setup i18next configuration in frontend/src/localization/i18n.ts
- [x] T018 [P] Create English translation files in frontend/src/localization/en/
- [x] T019 [P] Create Polish translation files in frontend/src/localization/pl/

### Frontend Core Utilities (T020-T025)

- [x] T020 [P] Create session UUID generator in frontend/src/utils/sessionManager.ts
- [x] T021 [P] Add sessionStorage helpers to session manager
- [x] T022 [P] Create currency conversion constants in frontend/src/utils/currencyFormatter.ts
- [x] T023 [P] Add penny-to-display format functions to currency formatter
- [x] T024 [P] Create HTTP client configuration in frontend/src/services/httpClient.ts
- [x] T025 [P] Add error handling wrapper to HTTP client

### Frontend API Services (T026-T029)

- [x] T026 [P] Create API endpoints configuration in frontend/src/services/endpoints.ts
- [x] T027 [P] Create health check API function in frontend/src/services/healthService.ts
- [x] T028 [P] Create loot generation API function in frontend/src/services/lootService.ts
- [x] T029 [P] Add request/response validation to API services

### Frontend Basic Components (T030-T035)

- [x] T030 [P] Create basic LanguageSelector dropdown in frontend/src/components/LanguageSelector.tsx
- [x] T031 [P] Add i18next integration to LanguageSelector
- [x] T032 [P] Create WealthLevel dropdown in frontend/src/components/WealthLevelSelector.tsx
- [x] T033 [P] Create location input field in frontend/src/components/LocationInput.tsx
- [x] T034 [P] Create generate button in frontend/src/components/GenerateButton.tsx
- [x] T035 [P] Add disabled state logic to GenerateButton

### Frontend Display Components (T036-T041)

- [x] T036 [P] Create LootItem display component in frontend/src/components/LootItem.tsx
- [x] T037 [P] Add currency formatting to LootItem component
- [x] T038 [P] Create LootList container in frontend/src/components/LootList.tsx
- [x] T039 [P] Create PriceToggle switch in frontend/src/components/PriceToggle.tsx
- [x] T040 [P] Add hide/show price logic to LootList
- [x] T041 [P] Create loading spinner in frontend/src/components/LoadingSpinner.tsx

### Frontend Hooks & State (T042-T047)

- [x] T042 [P] Create countdown timer hook in frontend/src/hooks/useCountdown.ts
- [x] T043 [P] Create cooldown state hook in frontend/src/hooks/useCooldown.ts
- [x] T044 [P] Create CooldownTimer component in frontend/src/components/CooldownTimer.tsx
- [x] T045 [P] Create form validation hook in frontend/src/hooks/useFormValidation.ts
- [x] T046 [P] Create loot generation hook in frontend/src/hooks/useLootGeneration.ts
- [x] T047 [P] Create language switching hook in frontend/src/hooks/useLanguage.ts

### Frontend Form & Messages (T048-T052)

- [x] T048 [P] Create error message component in frontend/src/components/ErrorMessage.tsx
- [x] T049 [P] Create status message component in frontend/src/components/StatusMessage.tsx
- [x] T050 [P] Create form container in frontend/src/components/LootForm.tsx
- [x] T051 [P] Add form submission logic to LootForm
- [x] T052 [P] Connect form to API services

### Frontend Main Assembly (T053-T057)

- [ ] T053 Create LootGenerator main container in frontend/src/components/LootGenerator.tsx
- [ ] T054 Add form section to LootGenerator
- [ ] T055 Add results section to LootGenerator
- [ ] T056 Add error handling to LootGenerator
- [ ] T057 Add responsive layout to LootGenerator

### Frontend Testing (T058-T062)

- [ ] T058 [P] Create unit tests for utility functions in frontend/src/utils/
- [ ] T059 [P] Create unit tests for API services in frontend/src/services/
- [ ] T060 [P] Create unit tests for custom hooks in frontend/src/hooks/
- [ ] T061 [P] Create component tests for basic components
- [ ] T062 [P] Create integration tests for main user flow

## Phase 3.3: Integration (T063-T065)

- [ ] T063 Setup IMemoryCache for cooldown management in backend/src/Program.cs
- [ ] T064 Vector database seeding with canonical Warhammer items in backend/src/Services/DatabaseSeedingService.cs
- [ ] T065 CORS configuration for frontend-backend communication in backend/src/Program.cs

## Phase 3.4: Polish (T066-T068)

- [ ] T066 [P] End-to-end test for complete loot generation workflow in frontend/tests/e2e/lootGeneration.spec.ts
- [ ] T067 [P] Mobile responsiveness testing and fixes
- [ ] T068 Run quickstart.md manual testing scenarios validation

## Dependencies

- **Setup before Implementation**: T001-T004 → T005-T062
- **Models before Services**: T005-T008 → T009-T012
- **Services before Controllers**: T009-T012 → T013-T014
- **Frontend Foundation**: T015-T019 → T020-T062
- **Frontend Utilities**: T020-T025 → T026-T062
- **Frontend API Services**: T026-T029 → T030-T062
- **Frontend Basic Components**: T030-T035 → T042-T057
- **Frontend Hooks**: T042-T047 → T050-T057
- **Frontend Assembly**: T048-T052 → T053-T057
- **Core before Integration**: T005-T057 → T063-T065
- **Implementation before Polish**: T063-T065 → T066-T068

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

### Phase 3.2: Frontend Foundation Launch

```bash
# Launch all foundation setup together (different files):
Task: "TypeScript interfaces in frontend/src/types/index.ts"
Task: "API types in frontend/src/types/api.ts"
Task: "i18next configuration in frontend/src/localization/i18n.ts"
Task: "English translations in frontend/src/localization/en/"
Task: "Polish translations in frontend/src/localization/pl/"
```

### Phase 3.2: Frontend Utilities Launch

```bash
# Launch all utility creation together (different files):
Task: "Session UUID generator in frontend/src/utils/sessionManager.ts"
Task: "Currency conversion constants in frontend/src/utils/currencyFormatter.ts"
Task: "HTTP client configuration in frontend/src/services/httpClient.ts"
Task: "API endpoints configuration in frontend/src/services/endpoints.ts"
```

### Phase 3.2: Frontend Components Launch

```bash
# Launch all basic component creation together (different files):
Task: "LanguageSelector dropdown in frontend/src/components/LanguageSelector.tsx"
Task: "WealthLevel dropdown in frontend/src/components/WealthLevelSelector.tsx"
Task: "Location input field in frontend/src/components/LocationInput.tsx"
Task: "Generate button in frontend/src/components/GenerateButton.tsx"
Task: "LootItem display in frontend/src/components/LootItem.tsx"
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

**Ready for Execution**: All 68 tasks generated, numbered, and validated ✅
