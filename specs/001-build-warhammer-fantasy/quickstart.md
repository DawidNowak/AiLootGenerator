# Quickstart: Warhammer Fantasy Loot Generator

**Date**: September 20, 2025  
**Phase**: 1 - Integration Testing and User Story Validation

## Overview

This quickstart guide provides step-by-step instructions for testing the complete Warhammer Fantasy Loot Generator application. Follow these scenarios to validate that all user stories and acceptance criteria are working correctly.

**Architecture Note**: The application uses internal lore enhancement during generation - when users request loot, the backend automatically retrieves relevant lore from Qdrant vector database and enriches the OpenAI prompt. No separate lore endpoints are exposed to the frontend.

## Prerequisites

### Development Environment

- **Backend**: .NET 6.0+ SDK, Visual Studio or VS Code
- **Frontend**: Node.js 18+, npm or yarn
- **Database**: Qdrant Cloud account (free tier)
- **Services**: OpenAI API key

### Environment Setup

1. **Clone and Setup**:

   ```bash
   git clone <repository-url>
   cd AiLootGenerator

   # Backend setup
   cd backend
   dotnet restore

   # Frontend setup
   cd ../frontend
   npm install
   ```

2. **Configuration**:

   ```bash
   # Backend: appsettings.Development.json
   {
     "OpenAI": {
       "ApiKey": "your-openai-api-key"
     },
     "Qdrant": {
       "Endpoint": "your-qdrant-cluster-url",
       "ApiKey": "your-qdrant-api-key"
     }
   }

   # Frontend: .env.local
   REACT_APP_API_BASE_URL=https://localhost:5001
   ```

3. **Start Services**:

   ```bash
   # Terminal 1: Backend
   cd backend
   dotnet run

   # Terminal 2: Frontend
   cd frontend
   npm start
   ```

## User Story Validation

### Story 1: Basic Loot Generation (English)

**Scenario**: Game Master generates common loot for Ubersreik location

**Steps**:

1. Navigate to `http://localhost:3000`
2. Verify language selector defaults to "English"
3. Enter location: "Ubersreik barracks"
4. Select wealth level: "Common"
5. Click "Generate Loot"
6. Wait for generation to complete

**Expected Results**:

- ✅ Receives 4-6 distinct loot items
- ✅ Items include names like "Jungfreud Tabard in Ubersreik colors"
- ✅ Items show estimated values formatted by frontend (e.g., "5 shillings" from 60 pennies)
- ✅ Items are mixture of Common and Poor wealth levels
- ✅ No magical items present (Common tier limitation)
- ✅ Generate button disabled for 30 seconds
- ✅ Countdown timer shows remaining cooldown time

**API Test**:

```bash
curl -X POST http://localhost:5001/api/loot/generate \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Ubersreik barracks",
    "wealthLevel": "Common",
    "language": "en",
    "sessionId": "test-session-1"
  }'
```

### Story 2: Noble Tier with Magic Items (English)

**Scenario**: Game Master generates high-value loot with magical items

**Steps**:

1. Wait for cooldown to expire (or use new session)
2. Enter location: "Ancient elven ruins"
3. Select wealth level: "Noble"
4. Click "Generate Loot"

**Expected Results**:

- ✅ Receives 4-6 items mixing Noble and Wealthy tiers
- ✅ At least 1-2 magical items in Noble-tier items only
- ✅ Magical items have appropriate lore descriptions
- ✅ Higher penny values displayed as gold crowns and shillings by frontend
- ✅ Items appropriate for elven ruins location

**API Test**:

```bash
curl -X POST http://localhost:5001/api/loot/generate \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Ancient elven ruins",
    "wealthLevel": "Noble",
    "language": "en",
    "sessionId": "test-session-2"
  }'
```

### Story 3: Polish Language Generation

**Scenario**: Polish Game Master generates loot in native language

**Steps**:

1. Change language selector to "Polski"
2. Verify UI labels change to Polish
3. Enter location: "Karczma w Ubersreiku"
4. Select wealth level: "Pospolity"
5. Click "Generuj Łupy"

**Expected Results**:

- ✅ All UI elements display in Polish
- ✅ Generated item names in Polish
- ✅ Frontend displays currency in Polish ("pensów", "szylingi", "koron")
- ✅ Descriptions maintain Warhammer Fantasy context in Polish
- ✅ Cooldown message in Polish

**API Test**:

```bash
curl -X POST http://localhost:5001/api/loot/generate \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Karczma w Ubersreiku",
    "wealthLevel": "Common",
    "language": "pl",
    "sessionId": "test-session-3"
  }'
```

### Story 4: Price Toggle Functionality

**Scenario**: Game Master hides prices before sharing with players

**Steps**:

1. Generate any loot successfully
2. Locate "Hide Prices" toggle switch
3. Toggle switch to "ON"
4. Verify item list updates

**Expected Results**:

- ✅ Currency values disappear from item display
- ✅ Item names and descriptions remain visible
- ✅ Toggle state persists during session
- ✅ Re-toggling restores price visibility

**Note**: Currency display is handled by frontend conversion from penny values received from API.

### Story 5: Refresh/Variety Generation

**Scenario**: Game Master generates different loot for same inputs

**Steps**:

1. Generate loot for "Dwarf tavern", "Common" wealth
2. Note the specific items generated
3. Wait for cooldown to expire
4. Click refresh/regenerate button with identical inputs
5. Compare new results with previous generation

**Expected Results**:

- ✅ Receives different set of 4-6 items
- ✅ Items still appropriate for dwarf tavern
- ✅ Items still Common/Poor wealth levels
- ✅ Demonstrates variety in generation algorithm
- ✅ Maintains lore consistency

### Story 6: Cooldown Timer Management

**Scenario**: Verify 30-second cooldown prevents spam requests

**Steps**:

1. Generate loot successfully
2. Immediately try to generate again
3. Observe cooldown message and timer
4. Wait for timer to reach zero
5. Verify generation becomes available

**Expected Results**:

- ✅ Generate button disabled immediately after generation
- ✅ Countdown timer shows remaining seconds (starts at 30)
- ✅ Clear message explaining cooldown purpose
- ✅ Timer decrements in real-time
- ✅ Button re-enables when timer reaches zero
- ✅ User can generate again after cooldown expires

**API Test**:

```bash
# First request should succeed
curl -X POST http://localhost:5001/api/loot/generate \
  -H "Content-Type: application/json" \
  -d '{"location": "test", "wealthLevel": "Common", "language": "en", "sessionId": "cooldown-test"}'

# Immediate second request should return 429
curl -X POST http://localhost:5001/api/loot/generate \
  -H "Content-Type: application/json" \
  -d '{"location": "test", "wealthLevel": "Common", "language": "en", "sessionId": "cooldown-test"}'
```

### Story 7: Donation Button Integration

**Scenario**: User wants to support the application

**Steps**:

1. Scroll to application footer
2. Locate "Buy Me a Coffee" button
3. Click button to verify external link

**Expected Results**:

- ✅ Button visible in footer area
- ✅ Appropriate styling and icon
- ✅ Opens external donation link in new tab
- ✅ Does not interfere with main application functionality

## Edge Case Testing

### Invalid Location Handling

**Test**: Submit empty or extremely long location descriptions

**API Test**:

```bash
# Empty location
curl -X POST http://localhost:5001/api/loot/generate \
  -H "Content-Type: application/json" \
  -d '{
    "location": "",
    "wealthLevel": "Common",
    "language": "en",
    "sessionId": "edge-test-1"
  }'

# Expected: 400 Bad Request with validation error
```

### Lore Consistency Validation

**Test**: Generate items for contradictory locations

**Examples**:

- "Elven artifacts in Dwarf stronghold" → Should avoid elven items
- "Imperial heraldry in Chaos wasteland" → Should avoid Imperial symbols
- "Magical items at Rubbish wealth level" → Should contain no magic

### Service Failure Graceful Degradation

**Test**: Generate loot when Qdrant service is unavailable

**Expected Behavior**:

- Application continues to function
- Generation works without lore enhancement
- User receives appropriate quality items
- No crashes or unhandled errors

## Mobile Responsiveness Testing

### Device Testing

**Devices to Test**:

- iPhone SE (320px width)
- iPad (768px width)
- Android phone (360px width)
- Desktop (1920px width)

**Key Elements**:

- ✅ Form inputs remain usable on small screens
- ✅ Generated loot list displays properly
- ✅ Language selector accessible
- ✅ Buttons appropriately sized for touch
- ✅ Text remains readable without horizontal scrolling

## Success Criteria

All user stories must pass their validation steps:

- [x] Basic loot generation with English UI
- [x] Noble tier magical items generation
- [x] Polish language support and localization
- [x] Price toggle hide/show functionality
- [x] Variety in generation results
- [x] 30-second cooldown timer enforcement
- [x] Donation button integration

All edge cases must be handled gracefully:

- [x] Input validation and error messages
- [x] Lore consistency maintenance
- [x] Service failure graceful degradation

All functional targets must be met:

- [x] <5s API response times for AI-powered generation (manual testing sufficient)
- [x] Mobile-responsive design validation

**Ready for Production**: When all checklist items are verified ✅
