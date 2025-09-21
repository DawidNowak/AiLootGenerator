# Research: Warhammer Fantasy Loot Generator

**Date**: September 20, 2025  
**Phase**: 0 - Technology Research and Decision Making

## Technology Decisions

### 1. OpenAI .NET SDK Integration

**Decision**: Use official OpenAI .NET SDK with custom prompt engineering for Warhammer Fantasy context

**Rationale**:

- Official SDK provides robust error handling and rate limiting
- Direct integration with GPT-4o-mini model for creative content generation
- Built-in support for streaming responses and token management
- Comprehensive documentation and community support

**Alternatives Considered**:

- Direct HTTP API calls: Too much boilerplate, poor error handling
- Third-party wrappers: Less reliable, potential abandonment risk
- Azure OpenAI Service: More expensive, unnecessary complexity for simple use case

**Implementation Pattern**:

```csharp
services.AddSingleton<IOpenAIService>(provider =>
    new OpenAIService(new OpenAIOptions() { ApiKey = apiKey }));
```

### 2. Qdrant .NET Client for Semantic Search

**Decision**: Use official Qdrant .NET client with OpenAI text-embedding-3-small for lore embeddings

**Rationale**:

- Official client ensures compatibility with Qdrant Cloud free tier
- Seamless integration with OpenAI embeddings model
- Built-in support for similarity search and filtering
- Async/await patterns align with ASP.NET Core best practices

**Alternatives Considered**:

- Pinecone: No free tier suitable for hobby projects
- Weaviate: More complex setup, overkill for simple semantic search
- Local vector storage: No persistence, scalability issues

**Implementation Pattern**:

```csharp
services.AddSingleton<QdrantClient>(provider =>
    new QdrantClient("your-cluster-url", apiKey: "your-api-key"));
```

### 3. Frontend UI Framework Decision

**Decision**: Material-UI (MUI) for React components

**Rationale**:

- Comprehensive component library with built-in responsive design
- Excellent TypeScript support and type definitions
- Strong theming system for consistent visual design
- Active development and large community
- Better accessibility (a11y) support out of the box
- Gaming-friendly dark theme options

**Alternatives Considered**:

- React Bootstrap: Less modern, requires more custom styling
- Ant Design: Heavy bundle size, design too enterprise-focused
- Chakra UI: Smaller ecosystem, fewer gaming-appropriate components
- Custom CSS: Too time-consuming, accessibility challenges

**Implementation Pattern**:

```jsx
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
```

### 4. ASP.NET Core In-Memory Caching for Cooldowns

**Decision**: Use IMemoryCache with sliding expiration for cooldown management

**Rationale**:

- Built into ASP.NET Core, no additional dependencies
- Thread-safe operations suitable for concurrent requests
- Sliding expiration perfect for cooldown timer use case
- Automatic cleanup of expired entries
- Configurable memory pressure handling

**Alternatives Considered**:

- Redis: Overkill for simple cooldowns, adds deployment complexity
- Database storage: Too slow, unnecessary persistence
- Static dictionaries: Not thread-safe, memory leak potential

**Implementation Pattern**:

```csharp
services.AddMemoryCache();
// Usage: cache.Set(userKey, DateTime.Now, TimeSpan.FromSeconds(30));
```

### 5. Bilingual Content Generation Strategy

**Decision**: Dual-prompt approach with language-specific system messages

**Rationale**:

- OpenAI models have strong multilingual capabilities
- System message can enforce target language and cultural context
- Single API call per generation maintains performance
- Consistent prompt structure for both languages
- Allows for language-specific cultural adaptations

**Alternatives Considered**:

- Post-generation translation: Loss of context, awkward gaming terminology
- Separate models per language: Increased complexity and cost
- Template-based generation: Too rigid, poor variety

**Implementation Pattern**:

```csharp
var systemMessage = language == "pl"
    ? "Jesteś ekspertem od świata Warhammer Fantasy. Generuj przedmioty po polsku..."
    : "You are a Warhammer Fantasy expert. Generate items in English...";
```

### 6. Frontend Internationalization Strategy

**Decision**: React i18next with separate translation files for UI, backend handles content language

**Rationale**:

- React i18next is the industry standard for React internationalization
- Separation of concerns: Frontend manages UI language, backend generates content in requested language
- Namespace support allows organized translation management
- Lazy loading of translation files optimizes bundle size
- TypeScript support with type-safe translation keys
- Rich ecosystem with pluralization, interpolation, and context features
- Works seamlessly with React hooks and functional components

**Alternatives Considered**:

- React Intl (FormatJS): More complex setup, heavier bundle size
- Polyglot.js: Simpler but lacks React-specific optimizations
- Custom translation solution: Reinventing the wheel, poor developer experience
- Lingui: Good TypeScript support but smaller community

**Implementation Pattern**:

```jsx
// i18n.js configuration
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: ["common", "loot"],
  defaultNS: "common",
  resources: {
    en: {
      common: { generateButton: "Generate Loot", location: "Location" },
      loot: { wealthLevels: { common: "Common", noble: "Noble" } },
    },
    pl: {
      common: { generateButton: "Generuj Łupy", location: "Lokalizacja" },
      loot: { wealthLevels: { common: "Pospolity", noble: "Szlachecki" } },
    },
  },
});

// Component usage
import { useTranslation } from "react-i18next";

function LootGenerator() {
  const { t, i18n } = useTranslation(["common", "loot"]);

  const handleLanguageChange = (newLang) => {
    i18n.changeLanguage(newLang);
    // Language selection persists for UI, sent to backend in generation request
  };

  return <Button onClick={handleGenerate}>{t("common:generateButton")}</Button>;
}
```

**Translation File Structure**:

```
src/
├── locales/
│   ├── en/
│   │   ├── common.json     # UI elements, buttons, labels
│   │   └── loot.json       # Wealth levels, gaming terminology
│   └── pl/
│       ├── common.json     # Polish UI translations
│       └── loot.json       # Polish gaming terminology
```

**Benefits for Separation of Concerns**:

- UI language changes instantly without backend calls
- Backend generates content in any language regardless of UI language
- User can have Polish UI but request English loot content
- Translation management tools (Weblate, Crowdin) work seamlessly
- Better performance: UI translations cached, content always fresh

### 7. Free Hosting Deployment Architecture

**Decision**: Azure App Service (backend) + Vercel (frontend) + Qdrant Cloud

**Rationale**:

- Azure App Service free tier supports .NET Core with decent limits
- Vercel optimized for React deployments with excellent CI/CD
- Qdrant Cloud free tier sufficient for lore database (1GB storage)
- Geographic distribution improves response times
- Each service can scale independently

**Alternatives Considered**:

- Heroku: No longer offers free tier
- Railway: Limited .NET support, smaller ecosystem
- Netlify Functions: Cold start issues for backend logic
- Self-hosted VPS: Maintenance overhead, reliability concerns

**Deployment Pattern**:

- Backend: Azure App Service with GitHub Actions CI/CD
- Frontend: Vercel with automatic deployments from Git
- Database: Qdrant Cloud managed service

## Research Conclusions

All technology choices support the constitutional requirements:

1. **Code Quality**: TypeScript + C# provide strong typing support
2. **Testing Excellence**: Jest/RTL + xUnit enable comprehensive test coverage
3. **User Experience**: MUI + i18next ensures consistent, accessible multilingual design
4. **Performance**: In-memory caching + semantic search enable <5s AI-powered responses
5. **Internationalization**: Separated frontend (UI) and backend (content) language handling for optimal user experience

**Key Architectural Benefits**:

- **Clear Separation**: Frontend manages UI language switching, backend generates content in requested language
- **Performance**: UI language changes instant, content generation optimized
- **Flexibility**: Users can mix UI and content languages (e.g., Polish UI with English loot)
- **Maintainability**: Translation files organized by feature namespace
- **Scalability**: Easy to add new languages without backend changes

**Next Phase**: Design data models and API contracts based on these technology decisions, including internationalization patterns.
