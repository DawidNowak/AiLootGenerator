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

**Decision**: Angular Material for Angular components

**Rationale**:

- Official Angular component library with built-in responsive design
- Excellent TypeScript support and type definitions (Angular is TypeScript-first)
- Strong theming system for consistent visual design
- Active development and Google backing
- Better accessibility (a11y) support out of the box
- Gaming-friendly dark theme options
- Seamless integration with Angular's dependency injection and reactive forms
- Angular 18+ with TypeScript 5.5+ provides latest performance improvements and features

**Alternatives Considered**:

- React with Material-UI: User specifically requested Angular for simplicity
- Angular with Bootstrap: Less modern, requires more custom styling
- PrimeNG: Good but heavier bundle size, more enterprise-focused
- Custom CSS: Too time-consuming, accessibility challenges

**Implementation Pattern**:

```typescript
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [MatButtonModule, MatCardModule, MatInputModule]
})
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

**Decision**: Angular i18n with separate translation files for UI, backend handles content language

**Rationale**:

- Angular i18n is the official internationalization solution for Angular
- Built into Angular CLI with excellent tooling support
- Separation of concerns: Frontend manages UI language, backend generates content in requested language
- Compile-time optimization with Angular's build process
- TypeScript support with type-safe translation keys
- Automatic bundle splitting by language
- Works seamlessly with Angular's template system and reactive forms
- Better performance than runtime translation libraries

**Alternatives Considered**:

- ngx-translate: Runtime translation but larger bundle size and runtime overhead
- Transloco: Good alternative but Angular i18n is official and more mature
- Custom translation solution: Reinventing the wheel, poor developer experience

**Implementation Pattern**:

```typescript
// Component usage
import { Component } from "@angular/core";

@Component({
  template: `
    <button (click)="handleGenerate()" i18n="@@generate-button">
      Generate Loot
    </button>
  `,
})
export class LootGeneratorComponent {
  // Component logic
}
```

**Translation File Structure**:

```
src/
├── locale/
│   ├── messages.en.xlf    # English UI translations
│   └── messages.pl.xlf    # Polish UI translations
└── assets/
    └── i18n/
        ├── en.json        # Wealth levels, gaming terminology
        └── pl.json        # Polish gaming terminology
```

**Benefits for Separation of Concerns**:

- UI language changes instantly without backend calls
- Backend generates content in any language regardless of UI language
- User can have Polish UI but request English loot content
- Translation management tools work seamlessly with Angular's extraction tools
- Better performance: UI translations bundled at build time, content always fresh

### 7. Free Hosting Deployment Architecture

**Decision**: Azure App Service (backend) + Angular hosting service (frontend) + Qdrant Cloud

**Rationale**:

- Azure App Service free tier supports .NET Core with decent limits
- Angular hosting services (Netlify, Vercel, Firebase Hosting) optimized for Angular deployments with excellent CI/CD
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

1. **Code Quality**: TypeScript 5.5+ + C# provide strong typing support
2. **Testing Excellence**: Jest/RTL + xUnit enable comprehensive test coverage
3. **User Experience**: Angular Material + i18n ensures consistent, accessible multilingual design
4. **Performance**: In-memory caching + semantic search enable <5s AI-powered responses
5. **Internationalization**: Separated frontend (UI) and backend (content) language handling for optimal user experience

**Key Architectural Benefits**:

- **Clear Separation**: Frontend manages UI language switching, backend generates content in requested language
- **Performance**: UI language changes instant, content generation optimized
- **Flexibility**: Users can mix UI and content languages (e.g., Polish UI with English loot)
- **Modern Stack**: Angular 18+ with TypeScript 5.5+ provides latest performance and developer experience improvements
- **Maintainability**: Translation files organized by feature namespace
- **Scalability**: Easy to add new languages without backend changes

**Next Phase**: Design data models and API contracts based on these technology decisions, including internationalization patterns.
