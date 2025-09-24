# Tasks: Warhammer Fantasy Loot Generator - Angular Frontend

**Input**: Design documents from `/specs/001-build-warhammer-fantasy/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow (main)

```
1. Load plan.md from feature directory ✅
   → Tech stack: C# 8.0+ (ASP.NET Core 6.0+), TypeScript 5.5+ (Angular 18+), OpenAI .NET SDK, Qdrant .NET client
   → Structure: Web application (frontend + backend)
   → Backend: COMPLETE AND FUNCTIONAL ✅
2. Load design documents ✅:
   → data-model.md: LootItem, GenerationRequest, LoreItem entities
   → contracts/openapi.yaml: POST /api/loot/generate, GET /api/health endpoints
   → research.md: OpenAI .NET SDK, Qdrant client, Angular Material decisions
   → quickstart.md: 7 user stories + edge cases
3. Generate Angular frontend tasks only (backend is complete)
4. Apply task rules: Different files = [P], Tests before implementation (TDD)
5. Number tasks sequentially (T001-T030)
6. Validate completeness: All UI components, all API integration
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Paths assume web app structure: `frontend/src/`
- **Backend is COMPLETE**: No backend tasks included

## Phase 3.1: Angular Frontend Setup (T001-T005)

- [x] T001 Initialize Angular 18+ project with TypeScript 5.5+ in frontend/ directory
- [x] T002 Install Angular Material, Angular CDK, and Angular Animations dependencies
- [x] T003 Configure Angular i18n with extraction and build scripts for en/pl locales
- [x] T004 Setup Angular Material theme and global styles in frontend/src/styles.scss
- [x] T005 [P] Create environment configuration files for API endpoints in frontend/src/environments/

## Phase 3.2: Angular Type Definitions (T006-T008)

- [ ] T006 [P] Create TypeScript interfaces for LootItem in frontend/src/app/models/loot-item.interface.ts
- [ ] T007 [P] Create GenerationRequest interface with Guid sessionId in frontend/src/app/models/generation-request.interface.ts
- [ ] T008 [P] Create WealthLevel enum with numeric values (Rubbish=1, Poor=2, Common=3, Wealthy=4, Noble=5) in frontend/src/app/models/wealth-level.enum.ts

## Phase 3.3: Core Angular Services (T009-T012)

- [ ] T009 [P] Create HTTP client service with interceptors in frontend/src/app/services/http-client.service.ts
- [ ] T010 [P] Create loot generation API service with proper GUID handling in frontend/src/app/services/loot-api.service.ts
- [ ] T011 [P] Create session management service for GUID generation and cooldown tracking in frontend/src/app/services/session.service.ts
- [ ] T012 [P] Create currency formatting service for penny conversion (12p=1s, 20s=1gc) in frontend/src/app/services/currency.service.ts

## Phase 3.4: Angular i18n Setup (T013-T015)

- [ ] T013 [P] Extract translatable strings and create base messages.xlf file
- [ ] T014 [P] Create English translations in frontend/src/locale/messages.en.xlf
- [ ] T015 [P] Create Polish translations in frontend/src/locale/messages.pl.xlf

## Phase 3.5: Angular Components - Basic UI (T016-T021)

- [ ] T016 [P] Create language selector dropdown component in frontend/src/app/components/language-selector/
- [ ] T017 [P] Create wealth level selector component in frontend/src/app/components/wealth-selector/
- [ ] T018 [P] Create location input component with validation in frontend/src/app/components/location-input/
- [ ] T019 [P] Create generate button component with loading states in frontend/src/app/components/generate-button/
- [ ] T020 [P] Create cooldown timer component in frontend/src/app/components/cooldown-timer/
- [ ] T021 [P] Create error message display component in frontend/src/app/components/error-message/

## Phase 3.6: Angular Components - Results Display (T022-T025)

- [ ] T022 [P] Create loot item card component in frontend/src/app/components/loot-item/
- [ ] T023 [P] Create loot results list component in frontend/src/app/components/loot-list/
- [ ] T024 [P] Create price toggle switch component in frontend/src/app/components/price-toggle/
- [ ] T025 [P] Create loading spinner component in frontend/src/app/components/loading-spinner/

## Phase 3.7: Main Container Components (T026-T027)

- [ ] T026 Create loot generation form container in frontend/src/app/components/loot-form/
- [ ] T027 Create main app container component integrating all parts in frontend/src/app/components/loot-generator/

## Phase 3.8: Angular Testing (T028-T030)

- [ ] T028 [P] Create unit tests for services using Jasmine in frontend/src/app/services/\*.spec.ts
- [ ] T029 [P] Create component tests using Angular Testing Library in frontend/src/app/components/\*_/_.spec.ts
- [ ] T030 Create end-to-end test for complete loot generation workflow using Protractor/Cypress

## Dependencies

- **Setup before Implementation**: T001-T005 → T006-T030
- **Types before Services**: T006-T008 → T009-T012
- **Services before Components**: T009-T012 → T016-T027
- **Basic Components before Containers**: T016-T025 → T026-T027
- **Implementation before Testing**: T006-T027 → T028-T030

## Parallel Execution Examples

```bash
# Phase 3.2 - Type Definitions (can run in parallel):
Task: "Create LootItem interface in frontend/src/app/models/loot-item.interface.ts"
Task: "Create GenerationRequest interface in frontend/src/app/models/generation-request.interface.ts"
Task: "Create WealthLevel enum in frontend/src/app/models/wealth-level.enum.ts"

# Phase 3.3 - Services (can run in parallel):
Task: "Create HTTP client service in frontend/src/app/services/http-client.service.ts"
Task: "Create loot API service in frontend/src/app/services/loot-api.service.ts"
Task: "Create session service in frontend/src/app/services/session.service.ts"
Task: "Create currency service in frontend/src/app/services/currency.service.ts"

# Phase 3.5 - Basic Components (can run in parallel):
Task: "Create language selector in frontend/src/app/components/language-selector/"
Task: "Create wealth selector in frontend/src/app/components/wealth-selector/"
Task: "Create location input in frontend/src/app/components/location-input/"
```

## Notes

- **Backend Status**: ✅ COMPLETE - ASP.NET Core API fully functional
- **Focus**: Angular frontend only - simple and clean implementation
- **Angular Version**: 18+ with TypeScript 5.5+ as specified
- **UI Framework**: Angular Material for consistency and responsiveness
- **i18n Strategy**: Angular's built-in i18n with compile-time optimization
- **Testing**: Jasmine + Karma for unit tests, E2E for integration
- **API Integration**: Connect to existing backend at localhost:5001

## Backend API Endpoints (Already Available)

- ✅ `POST /api/loot/generate` - Generate loot items
- ✅ `GET /api/health` - Health check endpoint
- ✅ Cooldown management via GUID session IDs
- ✅ Bilingual content generation (en/pl)
- ✅ OpenAI + Qdrant integration complete

## Backend Model Specifications

**GenerationRequest Contract:**

```csharp
public class GenerationRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Location { get; set; }

    [Required]
    public WealthLevel WealthLevel { get; set; }

    [Required]
    [RegularExpression("^(en|pl)$")]
    public string Language { get; set; }

    [Required]
    public Guid SessionId { get; set; }
}
```

**WealthLevel Enum:**

```csharp
public enum WealthLevel
{
    Rubbish = 1,    // 1-12 pennies
    Poor = 2,       // 13-60 pennies
    Common = 3,     // 61-240 pennies
    Wealthy = 4,    // 241-1200 pennies
    Noble = 5       // 1201+ pennies
}
```

- **Models before Services**: T005-T008 → T009-T012
- **Services before Controllers**: T009-T012 → T013-T014
- **Frontend Foundation**: T015-T019 → T020-T062
- **Frontend Utilities**: T020-T025 → T026-T062
- **Frontend API Services**: T026-T029 → T030-T062
- **Frontend Basic Components**: T030-T035 → T042-T057
- **Frontend Hooks**: T042-T047 → T050-T057
- **Frontend Assembly**: T048-T052 → T053-T057
- **Core before Integration**: T005-T057 → T063-T064
- **Implementation before Polish**: T063-T064 → T065-T067

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
