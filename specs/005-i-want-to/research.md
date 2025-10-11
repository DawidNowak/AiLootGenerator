# Research: Extend WealthLevel Enum with Treasure Tier

**Date**: October 11, 2025  
**Feature**: 005-i-want-to  
**Phase**: 0 - Research & Best Practices

## Research Questions

1. Best practices for extending C# enums while maintaining backward compatibility
2. Angular Material mat-select patterns for additional dropdown options
3. Testing strategies for enum modifications in full-stack applications

## Findings

### 1. C# Enum Extension Best Practices

**Decision**: Add new enum value at the end with explicit integer value

**Rationale**:

- Appending new values preserves existing integer mappings
- Explicit values prevent accidental reordering issues
- Maintains JSON serialization compatibility
- No breaking changes for existing code

**Implementation Pattern**:

```csharp
public enum WealthLevel
{
    Rubbish = 1,    // Existing
    Poor = 2,       // Existing
    Common = 3,     // Existing
    Wealthy = 4,    // Existing
    Noble = 5,      // Existing - update documentation only
    Treasure = 6    // New - add at end
}
```

**Alternatives Considered**:

- Insert between existing values: Rejected (would break integer mappings)
- Use string enums: Rejected (not consistent with existing codebase)
- Flag enums: Rejected (wealth levels are mutually exclusive)

### 2. Angular Material Dropdown Extensions

**Decision**: Add new option to existing mat-select without structural changes

**Rationale**:

- mat-select automatically handles additional options
- Consistent with existing wealth selection patterns
- No template restructuring required
- Maintains accessibility features

**Implementation Pattern**:

```typescript
export enum WealthLevel {
  Rubbish = 1,
  Poor = 2,
  Common = 3,
  Wealthy = 4,
  Noble = 5,
  Treasure = 6, // Add to end
}

// In component template - just add new option
<mat-option value="6">Treasure (3601+ pennies)</mat-option>;
```

**Alternatives Considered**:

- Separate premium tier selector: Rejected (adds UI complexity)
- Grouped options: Rejected (only 6 total options, not needed)
- Multi-select: Rejected (mutually exclusive selection required)

### 3. Testing Strategy for Enum Extensions

**Decision**: Comprehensive test coverage at all levels

**Test Categories**:

1. **Unit Tests (Backend)**:

   - Enum value validation
   - Serialization/deserialization
   - Range boundary testing

2. **Integration Tests**:

   - Loot generation with new tier
   - API contract validation
   - Cross-tier compatibility

3. **Frontend Tests**:
   - Component rendering with new option
   - Selection behavior validation
   - Form submission with new value

**Rationale**:

- Ensures no regression in existing functionality
- Validates new tier works end-to-end
- Catches serialization issues between frontend/backend

**Risk Mitigation**:

- Test existing enum values still work
- Verify Noble tier range update doesn't break generation logic
- Confirm UI properly displays all 6 options

## Technology Decisions

### Backend Implementation

- **Language**: C# 8.0+ (existing codebase)
- **Framework**: ASP.NET Core 6.0+ (existing)
- **Testing**: MSTest/NUnit (follow existing patterns)
- **Serialization**: System.Text.Json (existing)

### Frontend Implementation

- **Language**: TypeScript 5.5+ (existing)
- **Framework**: Angular 18+ (existing)
- **UI Components**: Angular Material mat-select (existing pattern)
- **Testing**: Jasmine/Karma (existing)

### Integration Points

- **API Contracts**: No changes to endpoint structure
- **Data Flow**: Enum values passed as integers (existing pattern)
- **Validation**: Server-side enum validation (existing)

## Risk Assessment

### Low Risk Items

- Adding enum value at end (standard practice)
- Frontend dropdown option addition (trivial change)
- Documentation updates (non-breaking)

### Medium Risk Items

- Noble tier range update (affects existing loot generation)
- Cross-system enum synchronization (frontend/backend)

### Mitigation Strategies

- Comprehensive test coverage before/after changes
- Staged deployment (backend first, then frontend)
- Rollback plan if generation logic issues discovered

## Performance Impact

**Expected Impact**: Negligible

- Enum operations are O(1)
- One additional dropdown option minimal UI impact
- No database schema changes required
- JSON file parsing unchanged

**Monitoring Points**:

- Loot generation response times (should remain constant)
- Frontend rendering performance (minimal impact expected)

## Dependencies

### Internal Dependencies

- `WealthLevel.cs` - Primary change target
- `LootGenerationService.cs` - May need range validation updates
- Angular wealth selector component - UI updates needed

### External Dependencies

- No new external dependencies required
- Existing Angular Material version supports additional options
- ASP.NET Core enum handling sufficient

## Next Steps

1. Phase 1: Create data model specification
2. Generate API contracts with new enum value
3. Design test scenarios for end-to-end validation
4. Update agent context files with new tier information

---

**Research Complete**: All technical approaches validated and decisions documented
