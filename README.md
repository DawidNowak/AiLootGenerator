# 🎲 AI Loot Generator

[![.NET Build](https://github.com/DawidNowak/AiLootGenerator/actions/workflows/dotnet.yml/badge.svg)](https://github.com/DawidNowak/AiLootGenerator/actions/workflows/dotnet.yml)
[![Angular Build](https://github.com/DawidNowak/AiLootGenerator/actions/workflows/angular.yml/badge.svg)](https://github.com/DawidNowak/AiLootGenerator/actions/workflows/angular.yml)

A responsive web application designed for **Warhammer Fantasy Roleplay (WFRP) Game Masters** to generate immersive, lore-consistent loot for tabletop sessions. The app helps GMs quickly create thematic treasures based on in-game locations and wealth levels, maintaining the gritty, low-fantasy atmosphere of the Warhammer Fantasy setting.

## ✨ Features

### 🎯 Core Functionality

- **AI-Powered Generation**: Creates 4-6 unique loot items using OpenAI's GPT models
- **Location-Aware**: Generates items appropriate to specific locations (e.g., "Ubersreik barracks", "Norscan mage workshop")
- **Wealth-Based Tiers**: Five wealth levels from rubbish peasant scraps to noble treasures
- **Lore Consistency**: Items respect WFRP universe rules and location plausibility
- **Magic Rarity**: Magical items appear only at higher wealth levels, maintaining low-fantasy tone

### 🌍 Localization & UX

- **Bilingual Support**: Full English and Polish localization for UI and generated content
- **Mobile-Friendly**: Responsive design optimized for tablets and phones
- **Clean Interface**: Simplified UI using Angular Material components
- **Price Toggle**: Hide/show item values when sharing with players
- **Session Cooldowns**: Rate limiting to prevent API abuse

### 🛠️ Technical Features

- **Vector Search**: Qdrant-powered contextual lore retrieval for enhanced generation
- **RESTful API**: Well-documented ASP.NET Core Web API
- **Comprehensive Testing**: Unit, integration, and E2E test coverage
- **Type Safety**: Full TypeScript implementation on frontend
- **Error Handling**: Graceful degradation and user-friendly error messages

## 🚀 Quick Start

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for Qdrant vector database)
- OpenAI API key

### 1. Clone the Repository

```bash
git clone https://github.com/DawidNowak/AiLootGenerator.git
cd AiLootGenerator
```

### 2. Set Up Vector Database

```bash
# Start Qdrant using Docker
docker run -d -p 6333:6333 -p 6334:6334 --name qdrant qdrant/qdrant
```

### 3. Configure Backend

```bash
cd backend/src
```

Add your OpenAI API key to `appsettings.Development.json`:

```json
{
  "OpenAI": {
    "ApiKey": "your-openai-api-key-here"
  }
}
```

### 4. Run Backend

```bash
dotnet restore
dotnet run
```

Backend will be available at `https://localhost:7026`

### 5. Run Frontend

```bash
cd ../../frontend
npm install
npm start
```

Frontend will be available at `http://localhost:4200`

## 🏗️ Architecture

### Backend (.NET 8 + ASP.NET Core)

```
backend/src/
├── Controllers/           # API endpoints
│   ├── LootController.cs  # Main loot generation API
│   └── HealthController.cs# Health check endpoint
├── Services/              # Business logic layer
│   ├── LootGenerationService.cs  # Main orchestration
│   ├── OpenAIService.cs          # AI integration
│   ├── QdrantService.cs          # Vector search
│   └── CooldownService.cs        # Rate limiting
├── Models/                # Data models
└── Configuration/         # App settings
```

### Frontend (Angular 18 + TypeScript)

```
frontend/src/app/
├── components/            # UI components
│   ├── loot-generator/    # Main app component
│   ├── loot-form/         # Generation form
│   └── loot-list/         # Results display
├── services/              # API and state management
├── models/                # TypeScript interfaces
└── pipes/                 # Localization utilities
```

### Key Technologies

- **Backend**: ASP.NET Core 8, OpenAI .NET SDK, Qdrant .NET client
- **Frontend**: Angular 18, Angular Material, RxJS, TypeScript 5.5+
- **Database**: Qdrant vector database for lore context retrieval
- **AI**: OpenAI GPT-4o-mini for text generation, text-embedding-3-small for embeddings

## 🎮 How to Use

1. **Select Language**: Choose between English and Polish
2. **Enter Location**: Describe where the loot is found (supports multiline input)
   - Examples: "Ubersreik barracks", "Abandoned Skaven tunnel", "Noble's manor in Altdorf"
3. **Choose Wealth Level**:
4. **Generate Loot**: Receive 4-6 unique, contextual items
5. **Toggle Prices**: Hide values when sharing with players

## 🧪 Testing

### Backend Tests

```bash
cd backend/tests
dotnet test --logger trx --collect:"XPlat Code Coverage"
```

### Frontend Tests

```bash
cd frontend
npm test                    # Unit tests
npm run test:headless      # Headless mode
npm run test:ci            # CI with coverage
```

### Test Coverage

- **Backend**: Comprehensive unit and integration tests for all services
- **Frontend**: Component tests with Angular Testing Library
- **E2E**: Planned Playwright test suite

## 🔧 Configuration

### Backend Settings (`appsettings.json`)

```json
{
  "OpenAI": {
    "ApiKey": "your-api-key",
    "ChatModel": "gpt-4o-mini",
    "EmbeddingModel": "text-embedding-3-small"
  },
  "Qdrant": {
    "Host": "localhost",
    "Port": "6334",
    "CollectionName": "warhammer_lore",
    "MaxSearchResults": 5,
    "SimilarityThreshold": 0.7
  },
  "DatabaseSeeding": {
    "EnableSeeding": true,
    "DataDirectory": "data"
  }
}
```

### Environment Variables

```bash
# OpenAI Configuration
export OpenAI__ApiKey="your-openai-api-key"

# Qdrant Configuration (optional overrides)
export Qdrant__Host="your-qdrant-host"
export Qdrant__Port="6334"
```

## 📊 API Documentation

### Generate Loot

```http
POST /api/loot/generate
Content-Type: application/json

{
  "location": "Ubersreik barracks",
  "wealthLevel": 2,
  "language": "en",
  "sessionId": "guid"
}
```

**Response:**

```json
{
  "items": [
    {
      "name": "Reikland Infantry Tabard",
      "description": "A worn but serviceable tabard...",
      "valueInPennies": 150,
      "wealthLevel": 2
    }
  ],
  "generatedAt": "2025-10-11T10:30:00Z",
  "cooldownExpiresAt": "2025-10-11T10:35:00Z"
}
```

### Health Check

```http
GET /api/health
```

### Wealth Levels

```http
GET /api/loot/wealth-levels
```

## 🗂️ Data Models

### Loot Item Structure

```typescript
interface LootItem {
  name: string; // "Jungfreud Tabard in Ubersreik colors"
  description: string; // Detailed description
  valueInPennies: number; // WFRP currency value
  wealthLevel: number; // 0-4 wealth tier
}
```

## 🚢 Deployment

The application is designed for easy deployment on various platforms:

### Docker Support

_Coming soon - Dockerfiles for both backend and frontend_

### Cloud Deployment

- **Backend**: Compatible with Azure App Service, AWS Elastic Beanstalk
- **Frontend**: Deployable to Netlify, Vercel, or any static hosting
- **Database**: Qdrant Cloud or self-hosted Qdrant instance

## 🤝 Contributing

We welcome contributions! Please see our development guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** the existing code style and testing patterns
4. **Write** tests for new functionality
5. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
6. **Push** to your branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Development Standards

- **Backend**: Follow C# conventions, comprehensive unit tests required
- **Frontend**: Angular style guide, component tests for new features
- **Commits**: Conventional commit format preferred
- **Documentation**: Update README and inline docs for new features

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎲 Game Context

This tool is designed specifically for **Warhammer Fantasy Roleplay**, the classic tabletop RPG set in the grim darkness of the Old World. The generator respects the game's:

- **Low Magic Setting**: Magical items are rare and dangerous
- **Economic System**: Values in pennies, shillings, and gold crowns
- **Geographic Lore**: Items appropriate to specific regions and cultures
- **Social Hierarchy**: Wealth levels reflecting the game's class system

Perfect for GMs running campaigns in the Empire, Bretonnia, Kislev, and beyond!

---

_Built with ❤️ for the Warhammer Fantasy Roleplay community_
