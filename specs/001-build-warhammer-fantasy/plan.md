# Implementation Plan: Warhammer Fantasy Loot Generator

**Branch**: `001-build-warhammer-fantasy` | **Date**: September 20, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-build-warhammer-fantasy/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → SUCCESS: Feature spec loaded from C:\Dev\AiLootGenerator\specs\001-build-warhammer-fantasy\spec.md
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
7. Re-evaluate Constitution Check section
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Build a responsive web application that generates thematic, lore-appropriate loot for Warhammer Fantasy Roleplay Game Masters. The application features a React.js frontend with separated internationalization (React i18next for UI elements), ASP.NET Core Web API backend handling OpenAI integration for localized content generation, Qdrant vector database for internal semantic search of Warhammer lore during generation, cooldown timer management, and comprehensive testing. Technical approach emphasizes modular architecture with clear separation between frontend UI language management and backend content generation language, automatic prompt enrichment via lore embeddings, and deployment to free hosting platforms.

## Technical Context

**Language/Version**: C# 8.0+ (ASP.NET Core 6.0+), JavaScript ES2020+ (React 18+)
**Primary Dependencies**: ASP.NET Core Web API, React.js, Material-UI, React i18next, OpenAI .NET SDK, Qdrant .NET client
**Storage**: Qdrant Cloud (vector database), in-memory caching for cooldowns
**Testing**: xUnit (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web browsers (responsive), Azure App Service (backend), Vercel (frontend)
**Project Type**: web (frontend + backend)
**Performance Goals**: <5s API response time, <2s initial page load, 30s cooldown enforcement
**Constraints**: Free hosting tier limitations, OpenAI API rate limits, separated UI/content internationalization
**Scale/Scope**: Single-user sessions, ~10 peak concurrent users, 4-6 items per generation

**Technical Context from User Requirements**:
Build a full-stack responsive web application called Warhammer Fantasy Loot Generator. Use C# with ASP.NET Core for the backend Web API, handling all logic including OpenAI API calls for loot generation (with prompts that include the selected language for internationalization of generated items in English or Polish), semantic search integration with Qdrant vector database for enriching prompts with Warhammer Fantasy lore, cooldown timer management, and randomization for output variety. For the vector DB, use Qdrant with its .NET client to store and query embedded lore snippets (embeddings via OpenAI's text-embedding model). Frontend should be built with React.js, using responsive components from Material-UI for mobile-friendliness. Structure the backend with controllers for generation endpoints, services for OpenAI and Qdrant interactions, and in-memory caching for cooldowns. For deployment, target free hosting like Azure App Service for backend, Vercel for frontend, and Qdrant Cloud free tier for the DB.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Code Quality Standards**: ✅ PASS

- Code review requirements documented for all changes
- Public API documentation required for all backend endpoints and services
- Zero technical debt tolerance enforced through CI/CD quality gates

**Testing Excellence**: ✅ PASS

- Unit tests required for all backend services and controllers (80%+ coverage)
- Integration tests for complete user workflows (loot generation, language switching)
- Contract tests for API endpoints using OpenAPI specifications
- TDD methodology: Tests written → User approved → Tests fail → Implementation

**User Experience Consistency**: ✅ PASS

- Material-UI ensures consistent component patterns
- Bilingual support with standardized terminology across languages
- WCAG 2.1 AA accessibility compliance for responsive design
- Consistent error messaging and user feedback patterns
- Mobile-first responsive design principles

**Template-Driven Development**: ✅ PASS

- Following spec.md → plan.md → tasks.md → implementation workflow
- Constitution compliance validated at each phase gate
- Standardized project structure for multi-AI agent support

## Project Structure

### Documentation (this feature)

```
specs/001-build-warhammer-fantasy/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 2: Web application (frontend + backend detected)
backend/
├── src/
│   ├── Models/
│   ├── Services/
│   ├── Controllers/
│   ├── Configuration/
│   └── Program.cs
├── tests/
│   ├── Unit/
│   ├── Integration/
│   └── Contract/
├── Backend.csproj
└── appsettings.json

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   └── localization/
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
└── tsconfig.json

# Shared
.github/
├── workflows/
└── copilot-instructions.md
```

**Structure Decision**: Option 2 (Web application) - frontend + backend detected in technical requirements

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - OpenAI .NET SDK integration patterns for loot generation
   - Qdrant .NET client best practices for semantic search
   - Material-UI vs React Bootstrap decision for responsive components
   - ASP.NET Core in-memory caching for cooldown timers
   - Bilingual content generation strategies with OpenAI
   - Free hosting deployment patterns (Azure App Service + Vercel + Qdrant Cloud)

2. **Generate and dispatch research agents**:

   ```
   Research OpenAI .NET SDK for loot generation in game context
   Research Qdrant .NET client for semantic search with embeddings
   Research Material-UI vs React Bootstrap for responsive gaming UI
   Research ASP.NET Core in-memory caching for rate limiting
   Research bilingual AI content generation patterns
   Research free hosting deployment for C# + React stack
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technology choices resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - LootItem (name, description, value)
   - GenerationRequest (location, wealth level, language)
   - WarhammerItem (embedded content for semantic search)

2. **Generate API contracts** from functional requirements:

   - POST /api/loot/generate → loot generation endpoint
   - GET /api/health → health check endpoint
   - Use OpenAPI specifications for all endpoints

3. **Generate contract tests** from contracts:

   - LootGenerationController tests (request/response validation)
   - CooldownService tests (timer management via backend validation)
   - QdrantService tests (internal lore retrieval and embedding)
   - OpenAIService tests (loot generation with mocking)

4. **Extract test scenarios** from user stories:

   - Complete loot generation workflow with English/Polish
   - Cooldown timer enforcement across sessions
   - Price toggle functionality
   - Lore-appropriate item validation

5. **Update agent file incrementally**:
   - Run update-agent-context.ps1 for GitHub Copilot
   - Add C#, React, OpenAI, Qdrant technologies
   - Preserve existing context while adding new stack

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each API contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks following TDD pattern

**Ordering Strategy**:

- Backend models and services first (data-model.md order)
- API controllers with contract tests
- Frontend components and services [P]
- Integration tests for complete workflows
- Deployment configuration tasks

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md)

## Complexity Tracking

_No constitutional violations identified - proceeding with standard architecture_

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

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
