# Data Model: Warhammer Fantasy Loot Generator

**Date**: September 20, 2025  
**Phase**: 1 - Data Architecture and Entity Design

## Internationalization Architecture

**Unified Language Selection**: This data model implements a simple, unified language approach with dynamic runtime switching:

- **Frontend**: Custom I18nService with Angular Signals handles UI element translations (buttons, labels, form fields) with instant language switching based on user selection
- **Backend**: Receives the same selected language in API requests and passes it to OpenAI for localized loot content
- **User Experience**: User selects one language (English or Polish) which controls both UI display and loot generation, with immediate UI updates and localStorage persistence
- **Language Field**: All `Language` properties in entities refer to the user's selected language for both UI and content
- **Implementation**: Runtime translation system allows dynamic language switching without page reloads or multiple builds

## Core Entities

### 1. LootItem

Represents a generated treasure item with Warhammer Fantasy context.

**Properties**:

- `Name` (string, required): Thematic item name (e.g., "Jungfreud Tabard in Ubersreik colors")
- `Description` (string, required): Detailed item description for immersion
- `ValueInPennies` (int, required): Estimated value in pennies (smallest WFRP denomination)
- `WealthLevel` (WealthLevel enum, required): Item's wealth classification

**Validation Rules**:

- Name must be 3-100 characters
- ValueInPennies must be positive integer
- Language must be supported ("en", "pl")

**Currency Display Logic** (Frontend Responsibility):

- Frontend converts pennies to appropriate display format
- Conversion rules: 12 pennies = 1 shilling, 20 shillings = 1 gold crown
- Display examples: "5 pennies", "2 shillings 3 pennies", "1 gold crown 5 shillings"

**Relationships**:

- Belongs to one GenerationRequest
- No persistence required (stateless generation)

### 2. GenerationRequest

Captures user input and context for loot generation session.

**Properties**:

- `Location` (string, required): User-provided location description
- `WealthLevel` (WealthLevel enum, required): Selected wealth tier
- `Language` (string, required): Target language for generation
- `SessionId` (string, required): Session tracking for cooldowns

**Validation Rules**:

- Location must be 1-200 characters
- WealthLevel must be valid enum value
- Language must be supported

**State Transitions**:

- Created → Processing → Completed
- No persistence required (stateless)

## Simple Cooldown Implementation

### Overview

The application uses a **stateless, no-authentication session system** where frontend-generated UUIDs track user cooldown state without requiring user accounts or registration.

### Session ID Generation & Lifecycle

**Frontend Session Creation**:

```javascript
// When user first loads the application
function getOrCreateSessionId() {
  const SESSION_KEY = "warhammer-loot-session";
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    // Generate cryptographically random UUID
    sessionId = crypto.randomUUID(); // e.g., "550e8400-e29b-41d4-a716-446655440000"
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

// Include in every generation request
const request = {
  location: "Ubersreik barracks",
  wealthLevel: "Common",
  language: "en",
  sessionId: getOrCreateSessionId(), // Persistent across browser sessions
};
```

**Session Persistence Strategy**:

- **localStorage**: Persists across browser sessions and tab closures
- **Alternative**: sessionStorage would clear when browser closes
- **Scope**: Session ID shared across all tabs for same domain
- **Privacy**: No personal data stored, only anonymous UUID

### Backend Session Management

**Cache Key Structure**:

```csharp
// IMemoryCache key format
string cacheKey = $"cooldown:{request.SessionId}";

// Example: "cooldown:550e8400-e29b-41d4-a716-446655440000"
```

**Session Lookup & Validation Logic**:

```csharp
public async Task<GenerationResponse> GenerateLootAsync(GenerationRequest request)
{
    string cacheKey = $"cooldown:{request.SessionId}";

    // 1. Check if user is on cooldown
    var lastGeneration = _memoryCache.Get<DateTime?>(cacheKey);

    // 2. Validate cooldown if previous generation exists
    if (lastGeneration.HasValue)
    {
        var timeSinceLastGeneration = DateTime.UtcNow - lastGeneration.Value;
        if (timeSinceLastGeneration < TimeSpan.FromSeconds(30))
        {
            var remainingSeconds = 30 - (int)timeSinceLastGeneration.TotalSeconds;
            throw new CooldownActiveException(remainingSeconds);
        }
    }

    // 3. Generate loot items (OpenAI + Qdrant processing)
    var items = await GenerateItemsAsync(request);

    // 4. Update cooldown timestamp
    var currentTime = DateTime.UtcNow;

    // 5. Store in cache with sliding expiration
    var cacheOptions = new MemoryCacheEntryOptions
    {
        SlidingExpiration = TimeSpan.FromHours(1),     // Extends if user active
    // 5. Store timestamp in cache with sliding expiration
    var cacheOptions = new MemoryCacheEntryOptions
    {
        SlidingExpiration = TimeSpan.FromHours(1),     // Extends if user active
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24), // Max lifetime
        Size = 1 // For memory pressure management
    };
    _memoryCache.Set(cacheKey, currentTime, cacheOptions);

    // 6. Return response with cooldown timestamp for frontend timer
    return new GenerationResponse
    {
        Items = items,
        CooldownExpiresAt = currentTime.AddSeconds(30), // Frontend countdown
        // ... other response fields
    };
}
```

### Session State Scenarios

**New User Journey**:

1. User loads app → Frontend generates UUID → Stores in localStorage
2. User submits generation request → Backend receives sessionId for first time
3. Backend stores current timestamp in cache → No prior cooldown → Generation succeeds
4. User tries immediate second generation → Backend finds timestamp → Enforces 30s cooldown

**Returning User Journey**:

1. User returns (same browser) → Frontend retrieves existing UUID from localStorage
2. Backend checks cache for existing timestamp:
   - **Cache hit**: Normal cooldown validation applies
   - **Cache miss**: Timestamp expired/evicted → No cooldown restriction (clean slate)

**Edge Case Handling**:

```csharp
public bool IsOnCooldown(string sessionId, out int remainingSeconds)
{
    string cacheKey = $"cooldown:{sessionId}";
    var lastGeneration = _memoryCache.Get<DateTime?>(cacheKey);

    remainingSeconds = 0;

    // Timestamp not found in cache (new user or cache evicted)
    if (!lastGeneration.HasValue)
        return false; // Allow generation

    var timeSince = DateTime.UtcNow - lastGeneration.Value;

    // Cooldown period has naturally expired
    if (timeSince >= TimeSpan.FromSeconds(30))
        return false; // Allow generation

    // Still within cooldown period
    remainingSeconds = 30 - (int)timeSince.TotalSeconds;
    return true; // Block generation
}
```

### Browser & Cache Scenarios

**Browser Behavior**:

- **New incognito window**: Generates fresh session ID → No shared cooldown state
- **Multiple tabs**: Share same session ID → Cooldown applies across all tabs
- **Clear browser data**: Loses session ID → Creates new session → Fresh cooldown state
- **Different browsers**: Independent session IDs → Separate cooldown tracking

**Server-Side Cache Behavior**:

- **Application restart**: All cached sessions lost → All users get fresh cooldown state
- **Memory pressure**: LRU eviction removes old sessions → Affected users get fresh state
- **Cache expiration**: Sessions automatically cleaned up → Users get fresh state after timeout

### Configuration & Scalability

**Memory Cache Configuration**:

```csharp
// Startup.cs / Program.cs
services.AddMemoryCache(options =>
{
    options.SizeLimit = 1000;              // Max 1000 concurrent sessions
    options.CompactionPercentage = 0.75;   // Compact when 75% full
});
```

**Scaling Considerations**:

- **Single Server**: IMemoryCache sufficient for ~10 concurrent users
- **Multiple Servers**: Consider Redis for shared session state
- **High Load**: Implement cache partitioning by session ID hash

**Migration Path to Redis** (Future):

```csharp
// Same interface, different implementation
string cacheKey = $"cooldown:{sessionId}";
await _distributedCache.SetAsync(cacheKey, sessionJson, cacheOptions);
```

### Security & Privacy Considerations

**Data Protection**:

- **No PII**: Session IDs are anonymous UUIDs with no personal information
- **Ephemeral**: Sessions automatically expire and are garbage collected
- **Stateless**: No user registration, authentication, or persistent user profiles

**Session Security**:

- **UUID Randomness**: Cryptographically secure random generation prevents guessing
- **No Cross-Reference**: Session IDs cannot be linked to user identity
- **Temporary**: Sessions designed for short-term cooldown tracking only

### 4. LoreItem

Represents a canonical Warhammer Fantasy item stored in vector database for semantic search and generation inspiration. **Note**: These are reference items used internally for lore enhancement - they are NOT directly returned to users. Instead, they inspire the AI to generate new `LootItem` objects.

**Properties**:

- `Id` (Guid, required): Unique identifier for vector storage
- `Name` (string, required): Item name (e.g., "Bretonnian Longbow", "Dwarf Runic Hammer")
- `Description` (string, required): Rich item description for embedding generation
- `ValueInPennies` (int, required): Base value in pennies
- `Tags` (List<string>, required): Semantic keywords for enhanced search matching

**Validation Rules**:

- Name must be 3-100 characters
- Description must be 20-200 characters (optimized for embeddings)
- ValueInPennies must be positive integer
- Tags must contain 3-10 descriptive keywords

**Tag Examples**:

- **Geographic**: `Ubersreik`, `Lustria`, `Araby`, `Kislev`, `Bretonnia`
- **Cultural/Faction**: `Empire`, `Imperial`, `Dwarf`, `Elven`, `Chaos`
- **Craftsmanship**: `Runesmith`, `Guild`, `Artisan`, `Noble`
- **Location Types**: `Karak`, `Tavern`, `Temple`, `Workshop`, `Barracks`

**Vector Storage Implementation**:

- **Vector**: Generated from concatenated text: `"{Name}. {Description}. Keywords: {string.Join(", ", Tags)}"`
- **Metadata**: Dictionary containing `Name`, `Description`, `ValueInPennies`, and `Tags` for retrieval and filtering
- **Storage Pattern**: Enhanced multi-field embedding approach for richer semantic search

**Relationships**:

- Stored in Qdrant vector database with metadata
- Retrieved via semantic similarity search during loot generation
- Used as inspiration templates for AI-generated items (not directly returned)

## Vector Database Workflow

### Semantic Search and Prompt Enrichment Process

The application uses a sophisticated semantic search system to enrich AI prompts with relevant Warhammer Fantasy lore before generating new items.

#### 1. Data Preparation and Storage

**Initial Setup**: Canonical Warhammer Fantasy items are stored in the vector database using a pattern similar to your VectorDbDemo:

```csharp
public async Task AddLoreItemVector(string collectionName, LoreItem[] items)
{
    var ids = items.Select(item => item.Id.ToString());
    var metadatas = items.Select(item => new Dictionary<string, object>()
    {
        [nameof(LoreItem.Name)] = item.Name,
        [nameof(LoreItem.Description)] = item.Description,
        [nameof(LoreItem.ValueInPennies)] = item.ValueInPennies,
        [nameof(LoreItem.Tags)] = item.Tags
    });

    // Generate embeddings from concatenated text (Name + Description + Tags)
    var vectorTasks = items.Select(item =>
    {
        var combinedText = $"{item.Name}. {item.Description}. Keywords: {string.Join(", ", item.Tags)}";
        return _embeddings.GenerateEmbeddingVectorAsync(combinedText);
    });
    var vectors = await Task.WhenAll(vectorTasks);

    // Store in Qdrant with vectors and metadata
    await _qdrantClient.UpsertVectors(collectionName,
        ids.ToArray(),
        vectors,
        metadatas.ToArray());
}
```

**Key Storage Elements**:

- **Vector**: Generated from concatenated text combining `Name`, `Description`, and `Tags` for richer semantic context
- **Metadata**: Contains `Name`, `Description`, `ValueInPennies`, and `Tags` for filtering and retrieval
- **Collection**: Single "warhammer-items" collection containing all canonical lore items
- **Enhanced Search**: Tags amplify important keywords in the vector space

#### Database Seeding Strategy

The application implements an automatic seeding process that runs during startup to ensure the vector database is populated with canonical Warhammer Fantasy lore.

**Startup Sequence**:

1. **Backend Application Starts**: ASP.NET Core application initializes services
2. **Vector Database Check**: Application queries Qdrant to check if "warhammer-items" collection exists and contains vectors
3. **Conditional Seeding**:
   - **If vectors exist**: Skip seeding process and proceed to start listening for requests
   - **If empty/missing**: Execute seeding process
4. **Seeding Process**:
   - Scan `Data/` directory for all JSON files containing canonical Warhammer Fantasy items by category
   - Iterate through each category file (e.g., `weapons.json`, `armors.json`, `jewelry.json`, `potions.json`, etc.)
   - Deserialize each JSON file into arrays of LoreItem objects
   - Generate embeddings for each item using concatenated text approach
   - Batch insert all vectors and metadata into Qdrant collection across all categories
5. **Application Ready**: Start HTTP server and begin accepting loot generation requests

**Implementation Pattern**:

```csharp
public async Task EnsureDatabaseSeeded()
{
    const string collectionName = "warhammer-items";

    // Check if collection exists and has vectors
    var collectionInfo = await _qdrantClient.GetCollectionInfo(collectionName);
    if (collectionInfo != null && collectionInfo.VectorCount > 0)
    {
        _logger.LogInformation("Vector database already seeded with {Count} items", collectionInfo.VectorCount);
        return;
    }

    _logger.LogInformation("Seeding vector database with canonical Warhammer Fantasy items...");

    // Load items from all category JSON files
    var allLoreItems = new List<LoreItem>();
    var dataDirectory = "Data";
    var jsonFiles = Directory.GetFiles(dataDirectory, "*.json");

    foreach (var jsonFile in jsonFiles)
    {
        _logger.LogInformation("Loading items from {FileName}", Path.GetFileName(jsonFile));
        var jsonContent = await File.ReadAllTextAsync(jsonFile);
        var categoryItems = JsonSerializer.Deserialize<LoreItem[]>(jsonContent);

        if (categoryItems != null && categoryItems.Length > 0)
        {
            allLoreItems.AddRange(categoryItems);
            _logger.LogInformation("Loaded {Count} items from {Category}",
                categoryItems.Length, Path.GetFileNameWithoutExtension(jsonFile));
        }
    }

    // Seed database with all items from all categories
    await AddLoreItemVector(collectionName, allLoreItems.ToArray());

    _logger.LogInformation("Successfully seeded {Count} Warhammer Fantasy items from {FileCount} category files",
        allLoreItems.Count, jsonFiles.Length);
}

// Called during application startup
public async Task<WebApplication> ConfigureApplication(WebApplicationBuilder builder)
{
    var app = builder.Build();

    // Ensure database is seeded before accepting requests
    using (var scope = app.Services.CreateScope())
    {
        var seedingService = scope.ServiceProvider.GetRequiredService<IVectorDatabaseService>();
        await seedingService.EnsureDatabaseSeeded();
    }

    return app;
}
```

**Benefits**:

- **Zero-Maintenance**: Database automatically populates on first run
- **Performance**: Subsequent startups skip seeding for faster boot times
- **Reliability**: Always ensures database has required lore data before serving requests
- **Deployment-Friendly**: Works seamlessly in containerized and cloud environments

#### 2. Semantic Search During Generation

When a user requests loot generation, the system performs semantic search to find relevant inspiration:

**Search Process**:

1. **Query Embedding**: Convert user's location description (e.g., "Ubersreik barracks") into a vector using the same concatenation approach
2. **Similarity Search**: Find top 3-5 most similar items from the vector database using enhanced multi-field embeddings
3. **Tag-Enhanced Matching**: Search benefits from tag amplification (e.g., "Ubersreik" query strongly matches items tagged with "Ubersreik", "Empire", "Imperial")
4. **Metadata Filtering**: Filter results based on context and retrieved tags for additional precision
5. **Lore Context Extraction**: Extract names, descriptions, and tags of similar items for prompt enrichment

```csharp
public async Task<List<LoreItem>> FindSimilarItems(string locationDescription, int topK = 5)
{
    // Convert search query to vector using same concatenation approach for consistency
    var queryVector = await _embeddings.GenerateEmbeddingVectorAsync(locationDescription);

    // Search for similar items
    var searchResults = await _qdrantClient.SearchVectors(
        collectionName: "warhammer-items",
        vector: queryVector,
        limit: topK);

    // Convert results back to LoreItem objects using metadata
    return searchResults.Select(result => new LoreItem
    {
        Id = Guid.Parse(result.Id),
        Name = result.Metadata["Name"].ToString(),
        Description = result.Metadata["Description"].ToString(),
        ValueInPennies = (int)result.Metadata["ValueInPennies"],
        Tags = ((string[])result.Metadata["Tags"]).ToList()
    }).ToList();
}
```

#### 3. AI Prompt Enrichment

The retrieved similar items are used to enrich the OpenAI prompt with relevant context:

**Prompt Structure**:

```
SYSTEM: You are a Warhammer Fantasy expert. Generate 4-6 loot items for: {location}
Wealth Level: {wealthLevel}
Language: {language}

LORE CONTEXT (similar items from this world):
- {item1.Name}: {item1.Description}
- {item2.Name}: {item2.Description}
- {item3.Name}: {item3.Description}

Generate new items inspired by this lore but do not copy them directly.
Ensure items are appropriate for {location} and {wealthLevel} tier.
```

**Benefits of This Approach**:

- **Lore Consistency**: AI receives authentic Warhammer Fantasy context
- **Location Appropriateness**: Search finds items culturally/geographically similar
- **Creative Variety**: AI generates new items inspired by but not copying the source material
- **Quality Control**: Canonical examples guide AI toward appropriate tone and detail level

#### 4. Search Examples

**Example 1**: User requests loot for "Dwarf tavern in Karak Azgal"

- **Search Query**: "Dwarf tavern Karak Azgal" → embedding vector
- **Enhanced Matching**: Items tagged with `Dwarf`, `Karak`, `Tavern`, `Ale` score higher due to tag amplification
- **Similar Items Found**: Dwarven tankards, ale barrels, mining tools, runic decorations
- **AI Context**: Receives descriptions and tags of authentic dwarf-crafted items
- **Generated Output**: New dwarf-themed tavern items with appropriate cultural details

**Example 2**: User requests loot for "Noble's study in Altdorf"

- **Search Query**: "Noble study Altdorf" → embedding vector
- **Enhanced Matching**: Items tagged with `Imperial`, `Altdorf`, `Noble`, `Guild` receive priority weighting
- **Similar Items Found**: Imperial ledgers, fine writing implements, noble clothing, scholarly books
- **AI Context**: Receives descriptions and tags of Imperial/Altdorf aristocratic items
- **Generated Output**: New scholarly/noble items appropriate for Imperial capital

**Example 3**: User requests loot for "Chaos shrine in the north"

- **Search Query**: "Chaos shrine north" → embedding vector
- **Enhanced Matching**: Items tagged with `Chaos`, `Dark`, `Cursed`, `Kislev` (northern region) score highly
- **Similar Items Found**: Corrupted artifacts, dark tomes, twisted religious items
- **AI Context**: Receives descriptions of appropriately sinister and chaotic items
- **Generated Output**: New chaos-tainted items with proper grimdark tone

**Benefits of Tag-Enhanced Vectorization**:

- **Precision**: Tags act as semantic amplifiers for key concepts
- **Cultural Consistency**: Geographic and faction tags ensure appropriate cultural matching
- **Context Clarity**: Multiple fields provide richer embedding context than description alone
- **Search Quality**: User queries match more precisely due to tag keyword repetition in embeddings

This semantic search system ensures that every generated item is grounded in authentic Warhammer Fantasy lore while providing creative variety for Game Masters.

## WealthLevel

Defines the five-tier wealth system for loot quality.

```csharp
public enum WealthLevel
{
    Rubbish = 1,    // Junk items, lowest tier
    Poor = 2,       // Peasant scraps, basic items
    Common = 3,     // Everyday goods, standard quality
    Wealthy = 4,    // Merchant spoils, valuable items
    Noble = 5       // Opulent treasures, rare magic items
}
```

**Penny Value Ranges by Wealth Level**:

| Wealth Level | Penny Range | Display Example              | Description                               |
| ------------ | ----------- | ---------------------------- | ----------------------------------------- |
| **Rubbish**  | 1-12p       | "3 pennies"                  | Broken tools, scraps, worthless junk      |
| **Poor**     | 13-60p      | "2 shillings 7 pennies"      | Basic peasant gear, simple items          |
| **Common**   | 61-240p     | "5 shillings"                | Everyday merchant goods, standard quality |
| **Wealthy**  | 241-1200p   | "2 gold crowns 3 shillings"  | Quality craftwork, rare materials         |
| **Noble**    | 1201+p      | "8 gold crowns 15 shillings" | Luxury goods, art, magical artifacts      |

**Economic Context** (WFRP 4th Edition):

- 1 shilling = 12 pennies
- 1 gold crown = 20 shillings = 240 pennies
- Common laborer earns ~1-2 shillings per day
- Artisan earns ~5-10 shillings per day
- Noble monthly allowance ~10-50 gold crowns

**Business Rules**:

- Selected level generates items from that tier and one below
- Exception: Rubbish generates only Rubbish (lowest tier)
- Noble is the only tier that can include magical items
- Magic items appear only in Noble-tier items, not accompanying Wealthy-tier
- Value ranges may overlap between adjacent tiers for variety

### Frontend Currency Handling

WFRP monetary system handled by frontend display logic.

**Backend Responsibility**:

- Generate and return all item values in pennies (smallest denomination)
- OpenAI prompt includes guidance for appropriate penny values per wealth level

**Frontend Responsibility**:

- Convert pennies to user-friendly display format
- Apply conversion rules: 12 pennies = 1 shilling, 20 shillings = 1 gold crown
- Localize currency names for different languages

**Display Examples**:

- 5 pennies → "5 pennies" / "5 pensów"
- 15 pennies → "1 shilling 3 pennies" / "1 szyling 3 pensy"
- 260 pennies → "1 gold crown 1 shilling 8 pennies" / "1 złota korona 1 szyling 8 pensów"

**Conversion Algorithm** (Frontend):

```javascript
function formatCurrency(pennies, language = "en") {
  const goldCrowns = Math.floor(pennies / 240); // 240 pennies = 1 gold crown
  const remainingAfterGold = pennies % 240;
  const shillings = Math.floor(remainingAfterGold / 12);
  const remainingPennies = remainingAfterGold % 12;

  // Format based on language and non-zero values
  return formatCurrencyString(
    goldCrowns,
    shillings,
    remainingPennies,
    language
  );
}
```

## Data Flow

### Generation Request Flow

1. **Input Validation**:

   - Validate location description length and content
   - Verify wealth level is valid enum value
   - Confirm language is supported
   - Check user session cooldown status

2. **Semantic Item Discovery** (Backend Process):

   - Extract keywords from user location description
   - Query Qdrant vector database for semantically similar LoreSnippers
   - Apply metadata filters (wealth level, appropriate categories)
   - Retrieve 3-5 most relevant canonical items based on cosine similarity
   - **Note**: This is an internal backend process - no separate API endpoint

3. **AI Generation**:

   - Construct language-specific prompt with found canonical items as examples
   - Include wealth level constraints and WFRP setting guidelines
   - Provide 3-5 similar items as inspiration templates for AI
   - Call OpenAI API with the enhanced prompt containing item examples
   - Parse response into 4-6 NEW LootItem objects with penny values
   - Validate generated items meet lore consistency requirements

4. **Response Preparation**:
   - Apply wealth level business rules
   - Set visibility based on price toggle preference
   - Update user session cooldown state
   - Return structured GenerationRequest with items

### Cooldown Management Flow

1. **Pre-Generation Check**:

   - Retrieve last generation timestamp from IMemoryCache
   - Check if last timestamp + 30 seconds > current time
   - Return 429 error if still on cooldown

2. **Post-Generation Update**:
   - Store current timestamp in IMemoryCache with sliding expiration
   - Frontend handles countdown timer using cooldownExpiresAt from response

## Error Handling

### Validation Errors

- **InvalidLocationError**: Location description is empty or too long
- **UnsupportedLanguageError**: Language not in supported list
- **CooldownActiveError**: User must wait before next generation
- **WealthLevelError**: Invalid wealth level selection

### External Service Errors

- **OpenAIServiceError**: API failure or rate limit exceeded
- **QdrantServiceError**: Vector database connection or query failure
- **EmbeddingError**: Failed to generate embeddings for lore search

### Recovery Strategies

- Graceful degradation: Generate without lore enhancement if Qdrant fails
- Retry logic for transient OpenAI API failures
- Default to English if language detection fails
- Cache fallback for repeat location requests

## Vector Database Management

### Initial Data Population

1. **JSON Preparation**: Create multiple category-specific JSON files in the `Data/` directory (e.g., `weapons.json`, `armors.json`, `jewelry.json`, `potions.json`, etc.) containing 100-500 canonical items total across all categories
2. **Embedding Generation**: Use OpenAI text-embedding-3-small to convert item descriptions from all category files
3. **Batch Upload**: Use Qdrant .NET client to upload items with metadata from all categories into a single collection
4. **Index Creation**: Set up vector similarity and metadata filtering indexes

### Recommended JSON Categories

**By Item Type**: Weapons, Armor, Tools, Clothing, Jewelry, Art, Books, Consumables, Containers, Religious, Magical, Miscellaneous

**Category File Structure** (in `Data/` directory):

- `weapons.json` - Swords, axes, bows, crossbows, firearms, etc.
- `armors.json` - Plate mail, chainmail, shields, helmets, etc.
- `jewelry.json` - Rings, necklaces, brooches, ceremonial items, etc.
- `potions.json` - Healing draughts, alchemical compounds, poisons, etc.
- `tools.json` - Crafting tools, professional equipment, instruments, etc.
- `books.json` - Tomes, scrolls, maps, documents, etc.
- `religious.json` - Holy symbols, prayer books, temple items, etc.
- `miscellaneous.json` - Containers, art objects, curiosities, etc.
- `common.json` - Everyday items, household goods, trade materials, etc.
- `clothing.json` - wardrobe, clothes etc.

**By Origin Culture**: Imperial, Bretonnian, Dwarf, Elf, Kislev, Tilean, Estalia, Arabian, Norse, Lustria, Ulthuan, Araby

**By Wealth Distribution**:

- Rubbish (5-20 items): Broken tools, tattered clothes, scraps
- Poor (30-50 items): Basic peasant gear, simple tools
- Common (100-150 items): Everyday merchant goods, standard equipment
- Wealthy (80-120 items): Quality craftwork, rare materials
- Noble (20-40 items): Luxury goods, art pieces, some magical items

### Qdrant Collection Setup

```csharp
// Collection configuration for LoreItems
var collectionConfig = new CreateCollection
{
    CollectionName = "lore-snippets",
    VectorConfig = new VectorParams
    {
        Size = 1536,  // OpenAI text-embedding-3-small dimensions
        Distance = Distance.Cosine
    }
};

// Payload schema for metadata filtering
var payloadIndexes = new Dictionary<string, PayloadIndexParams>
{
    ["wealthLevel"] = new PayloadIndexParams { DataType = PayloadSchemaType.Integer },
    ["category"] = new PayloadIndexParams { DataType = PayloadSchemaType.Keyword },
    ["origin.culture"] = new PayloadIndexParams { DataType = PayloadSchemaType.Keyword },
    ["origin.region"] = new PayloadIndexParams { DataType = PayloadSchemaType.Keyword },
    ["valueInPennies"] = new PayloadIndexParams { DataType = PayloadSchemaType.Integer }
};
```

### Performance Considerations

### Caching Strategy

- **Cooldown Timestamps**: 1-hour sliding expiration in IMemoryCache
- **Lore Embeddings**: Pre-computed and stored in Qdrant
- **Generation Results**: No caching (variety requirement)

### Optimization Targets

- **API Response Time**: <5s for AI-powered generation requests
- **Semantic Search**: <1s for Qdrant queries
- **Memory Usage**: <20MB for session cache
- **Concurrent Users**: Support ~10 peak simultaneous sessions

**Next Phase**: Design API contracts and generate contract tests based on this data model.
