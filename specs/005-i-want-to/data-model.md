# Data Model: Extend WealthLevel Enum with Treasure Tier

**Date**: October 11, 2025  
**Feature**: 005-i-want-to  
**Phase**: 1 - Design & Contracts

## Core Entities

### WealthLevel Enum (Modified)

**Purpose**: Defines the six-tier wealth system for loot quality and value ranges

**Current State** (5 tiers):

```csharp
public enum WealthLevel
{
    Rubbish = 1,  // 1-12 pennies
    Poor = 2,     // 13-60 pennies
    Common = 3,   // 61-240 pennies
    Wealthy = 4,  // 241-1200 pennies
    Noble = 5     // 1201+ pennies
}
```

**Target State** (6 tiers):

```csharp
public enum WealthLevel
{
    Rubbish = 1,  // 1-12 pennies (unchanged)
    Poor = 2,     // 13-60 pennies (unchanged)
    Common = 3,   // 61-240 pennies (unchanged)
    Wealthy = 4,  // 241-1200 pennies (unchanged)
    Noble = 5,    // 1201-3600 pennies (range updated)
    Treasure = 6  // 3601+ pennies (new tier)
}
```

**Value Ranges**:
| Tier | Integer Value | Penny Range | Description |
|------|--------------|-------------|-------------|
| Rubbish | 1 | 1-12 | Junk items, lowest tier |
| Poor | 2 | 13-60 | Peasant scraps, basic items |
| Common | 3 | 61-240 | Everyday goods, standard quality |
| Wealthy | 4 | 241-1200 | Merchant spoils, valuable items |
| Noble | 5 | 1201-3600 | Opulent treasures, rare magic items |
| Treasure | 6 | 3601+ | Legendary artifacts, ultimate treasures |

**Validation Rules**:

- Enum values must be integers 1-6
- Value ranges are inclusive for lower bound, exclusive for upper bound (except highest tier)
- Noble tier upper bound changed from unbounded to 3600
- Treasure tier is new unbounded upper tier

**Serialization**:

- JSON: Integer values (1-6)
- API: Integer values in requests/responses
- Frontend: TypeScript enum mirrors backend values

## Supporting Entities

### LootItem (No Changes Required)

**Purpose**: Represents individual loot items with value and metadata

**Structure** (unchanged):

```csharp
public class LootItem
{
    public string Name { get; set; }
    public int Value { get; set; }        // Penny value
    public string Description { get; set; }
    public string Category { get; set; }
    // ... other properties
}
```

**Relationship to WealthLevel**:

- LootItem.Value determines which WealthLevel tier it belongs to
- Generation logic uses WealthLevel to filter appropriate items
- No structural changes needed, only generation logic updates

### GenerationRequest (Minor Update)

**Purpose**: Request model for loot generation API

**Current Structure**:

```csharp
public class GenerationRequest
{
    public WealthLevel WealthLevel { get; set; }
    public string Location { get; set; }
    public int Count { get; set; }
    // ... other properties
}
```

**Impact**:

- No structural changes required
- WealthLevel property now accepts value 6 (Treasure)
- Validation updates needed to accept new enum value

## State Transitions

### Wealth Tier Selection Flow

**Current Flow** (5 options):

```
User Interface → Select Wealth Level (1-5) → Generate Loot → Display Results
```

**Updated Flow** (6 options):

```
User Interface → Select Wealth Level (1-6) → Generate Loot → Display Results
```

**State Validation**:

- Input validation: Accept integers 1-6
- Backend validation: Ensure enum value is valid
- Generation logic: Route to appropriate loot pools

### Loot Generation Logic

**Current Logic**:

```
WealthLevel → Filter loot data by value range → Select random items
```

**Updated Logic**:

```
WealthLevel (1-6) → Map to value range → Filter loot data → Select random items
```

**Range Mapping Changes**:

- Noble (5): 1201+ → 1201-3600 (bounded)
- Treasure (6): 3601+ → ∞ (unbounded, new)

## Data Constraints

### Business Rules

1. **Backward Compatibility**: Existing WealthLevel values (1-5) must continue working
2. **Range Integrity**: No gaps or overlaps in penny ranges
3. **Upper Bound**: Only Treasure tier is unbounded (3601+)
4. **Value Consistency**: LootItem.Value must align with WealthLevel ranges

### Technical Constraints

1. **Enum Values**: Must be sequential integers starting from 1
2. **Serialization**: JSON integer representation required
3. **Frontend Sync**: TypeScript enum must mirror C# enum exactly
4. **API Compatibility**: Existing API contracts continue working

### Validation Rules

1. **Input Validation**: WealthLevel must be 1-6
2. **Range Validation**: Generated loot values must fall within tier ranges
3. **Type Safety**: Enum usage prevents invalid values at compile time

## Migration Considerations

### Data Migration

- **Not Required**: No persistent data stores affected
- **JSON Files**: Static loot data files unchanged
- **Runtime**: All changes are compile-time enum extensions

### Backward Compatibility

- **API Endpoints**: Continue accepting existing WealthLevel values (1-5)
- **Frontend**: Existing functionality preserved, new option added
- **Loot Generation**: Existing tiers generate same quality loot

### Version Compatibility

- **Client/Server**: Frontend can send new value (6) to updated backend
- **Rollback**: If needed, remove Treasure option from frontend only
- **Deployment**: Backend can be updated first, frontend second

## Testing Implications

### Data Validation Tests

- Enum value boundaries (1-6)
- Range mapping accuracy
- Serialization/deserialization

### Integration Tests

- Loot generation with all 6 tiers
- API contract validation
- Frontend/backend enum synchronization

### Regression Tests

- Existing tier functionality unchanged
- Noble tier range update validation
- Backward compatibility verification

---

**Data Model Complete**: All entities, relationships, and constraints defined
