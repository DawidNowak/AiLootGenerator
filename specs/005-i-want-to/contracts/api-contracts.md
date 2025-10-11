# API Contracts: WealthLevel Extension

**Date**: October 11, 2025  
**Feature**: 005-i-want-to  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the API contract changes required to support the new Treasure tier in the WealthLevel enum. The existing API structure remains unchanged - only the accepted enum values are extended.

## Endpoints Affected

### POST /api/loot/generate

**Purpose**: Generate loot items based on wealth level and location

**Request Contract** (Updated):

```json
{
  "wealthLevel": 1 | 2 | 3 | 4 | 5 | 6,  // Extended to include 6 (Treasure)
  "location": "string",
  "count": "integer (optional, defaults to appropriate amount)"
}
```

**Response Contract** (Unchanged):

```json
{
  "items": [
    {
      "name": "string",
      "value": "integer",  // Penny value
      "description": "string",
      "category": "string",
      "rarity": "string"
    }
  ],
  "totalValue": "integer",
  "wealthLevel": 1 | 2 | 3 | 4 | 5 | 6,  // Echoes request value
  "location": "string"
}
```

**Validation Changes**:

- WealthLevel parameter now accepts integers 1-6 (previously 1-5)
- All other validation rules remain unchanged

### GET /api/loot/wealth-levels

**Purpose**: Get available wealth levels for UI dropdown population

**Response Contract** (Updated):

```json
{
  "wealthLevels": [
    { "value": 1, "name": "Rubbish", "range": "1-12 pennies" },
    { "value": 2, "name": "Poor", "range": "13-60 pennies" },
    { "value": 3, "name": "Common", "range": "61-240 pennies" },
    { "value": 4, "name": "Wealthy", "range": "241-1200 pennies" },
    { "value": 5, "name": "Noble", "range": "1201-3600 pennies" },
    { "value": 6, "name": "Treasure", "range": "3601+ pennies" }
  ]
}
```

**Changes**:

- Noble tier range updated from "1201+ pennies" to "1201-3600 pennies"
- New Treasure tier added with range "3601+ pennies"

## HTTP Status Codes

**Unchanged** - All existing status codes remain the same:

- `200 OK`: Successful loot generation
- `400 Bad Request`: Invalid wealth level (now includes value > 6 or < 1)
- `422 Unprocessable Entity`: Valid wealth level but other validation failures
- `500 Internal Server Error`: Server-side generation issues

## Error Responses

**Updated** - BadRequest for invalid wealth level:

```json
{
  "error": "Invalid wealth level",
  "message": "WealthLevel must be between 1 and 6", // Updated range
  "validValues": [1, 2, 3, 4, 5, 6] // Extended array
}
```

## Backward Compatibility

### Existing Clients

- Clients sending WealthLevel values 1-5 continue working unchanged
- Response format identical for existing values
- No breaking changes to existing integrations

### New Clients

- Can immediately use new WealthLevel value 6 (Treasure)
- Will receive appropriate high-value loot items (3601+ pennies)
- All existing functionality available plus new tier

## OpenAPI Specification Changes

**WealthLevel Schema Update**:

```yaml
WealthLevel:
  type: integer
  enum: [1, 2, 3, 4, 5, 6] # Extended from [1, 2, 3, 4, 5]
  description: |
    Wealth tier for loot generation:
    - 1: Rubbish (1-12 pennies)
    - 2: Poor (13-60 pennies)
    - 3: Common (61-240 pennies)
    - 4: Wealthy (241-1200 pennies)
    - 5: Noble (1201-3600 pennies)  # Updated range
    - 6: Treasure (3601+ pennies)   # New tier
```

**Generation Request Schema** (minimal change):

```yaml
GenerationRequest:
  type: object
  required: [wealthLevel, location]
  properties:
    wealthLevel:
      $ref: "#/components/schemas/WealthLevel" # Uses updated enum
    location:
      type: string
      minLength: 1
    count:
      type: integer
      minimum: 1
      maximum: 20
      default: 5
```

## Contract Tests Required

### Test Cases for New Functionality

1. **POST /api/loot/generate with WealthLevel=6**

   - Should return 200 OK
   - All items should have value >= 3601 pennies
   - Response should echo wealthLevel: 6

2. **GET /api/wealth-levels**
   - Should return 6 wealth levels
   - Noble tier should show range "1201-3600 pennies"
   - Treasure tier should show range "3601+ pennies"

### Regression Test Cases

1. **Existing WealthLevel values (1-5)**

   - Should continue working exactly as before
   - Response format unchanged
   - Value ranges for tiers 1-4 unchanged
   - Noble tier (5) should generate items 1201-3600 pennies (updated range)

2. **Invalid WealthLevel values**
   - Values < 1 or > 6 should return 400 Bad Request
   - Error message should indicate valid range 1-6

### Edge Cases

1. **WealthLevel=5 (Noble) boundary testing**

   - Should generate items between 1201-3600 pennies
   - Should not generate items > 3600 pennies
   - Verify upper bound enforcement

2. **WealthLevel=6 (Treasure) boundary testing**
   - Should generate items >= 3601 pennies
   - No upper limit on generated item values
   - Verify lower bound enforcement

## Deployment Considerations

### Rolling Deployment

1. **Backend First**: Deploy API changes supporting WealthLevel=6
2. **Frontend Second**: Deploy UI changes adding Treasure option
3. **Validation**: Existing clients unaffected during rollout

### Rollback Strategy

1. **Frontend Rollback**: Remove Treasure option from UI
2. **Backend**: Can remain deployed (backward compatible)
3. **Emergency**: Both can be rolled back independently

---

**API Contracts Complete**: All endpoints, validation, and test cases defined
