# Quickstart: Extend WealthLevel Enum with Treasure Tier

**Date**: October 11, 2025  
**Feature**: 005-i-want-to  
**Phase**: 1 - Design & Contracts

## Overview

This quickstart guide validates the WealthLevel extension feature through step-by-step user scenarios. Execute these steps after implementation to verify the feature works end-to-end.

## Prerequisites

- Backend service running on localhost
- Frontend application running
- Both services configured and communicating
- Test data loaded

## Test Scenarios

### Scenario 1: Verify Treasure Tier in UI

**Objective**: Confirm the new Treasure tier appears in the wealth selection dropdown

**Steps**:

1. Open the loot generator application in browser
2. Navigate to the main loot generation interface
3. Click on the wealth level dropdown selector
4. Verify all 6 wealth tiers are visible:
   - Rubbish (1-12 pennies)
   - Poor (13-60 pennies)
   - Common (61-240 pennies)
   - Wealthy (241-1200 pennies)
   - Noble (1201-3600 pennies) ← Updated range
   - Treasure (3601+ pennies) ← New tier

**Expected Result**: ✅ Treasure tier visible as 6th option with correct description

### Scenario 2: Generate Treasure Tier Loot

**Objective**: Verify treasure tier generates appropriate high-value items

**Steps**:

1. From the loot generation interface
2. Select "Treasure (3601+ pennies)" from wealth level dropdown
3. Enter location: "Ancient Dragon's Hoard"
4. Click "Generate Loot" button
5. Examine the generated loot items
6. Verify all items have values ≥ 3601 pennies
7. Note the total value and item quality descriptions

**Expected Result**: ✅ All generated items worth 3601+ pennies, premium quality descriptions

### Scenario 3: Verify Noble Tier Range Update

**Objective**: Confirm Noble tier now caps at 3600 pennies (not unlimited)

**Steps**:

1. Select "Noble (1201-3600 pennies)" from wealth level dropdown
2. Enter location: "Royal Treasury"
3. Generate loot multiple times (3-5 generations)
4. For each generation, verify all items are between 1201-3600 pennies
5. Ensure no items exceed 3600 pennies (which would now be Treasure tier)

**Expected Result**: ✅ All Noble tier items between 1201-3600 pennies, none higher

### Scenario 4: Test Backward Compatibility

**Objective**: Ensure existing wealth tiers continue working as before

**Steps**:

1. Test each existing tier (Rubbish through Wealthy):
   - **Rubbish**: Generate items worth 1-12 pennies
   - **Poor**: Generate items worth 13-60 pennies
   - **Common**: Generate items worth 61-240 pennies
   - **Wealthy**: Generate items worth 241-1200 pennies
2. Verify value ranges remain unchanged for these tiers
3. Verify item quality and descriptions remain consistent

**Expected Result**: ✅ All existing tiers work exactly as before

### Scenario 5: API Direct Testing

**Objective**: Verify API accepts new wealth level value directly

**API Test Commands**:

**Test Treasure Tier Generation**:

```bash
curl -X POST http://localhost:5000/api/loot/generate \
  -H "Content-Type: application/json" \
  -d '{
    "wealthLevel": 6,
    "location": "Legendary Artifact Vault",
    "count": 3
  }'
```

**Expected Response**:

```json
{
  "items": [
    {
      "name": "...",
      "value": 4500, // >= 3601
      "description": "...",
      "category": "..."
    }
  ],
  "totalValue": 13000, // Sum >= 10803
  "wealthLevel": 6,
  "location": "Legendary Artifact Vault"
}
```

**Test Wealth Levels Endpoint**:

```bash
curl http://localhost:5000/api/loot/wealth-levels
```

**Expected Response**:

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

### Scenario 6: Error Handling

**Objective**: Verify proper error handling for edge cases

**Test Invalid Wealth Level**:

```bash
curl -X POST http://localhost:5000/api/loot/generate \
  -H "Content-Type: application/json" \
  -d '{
    "wealthLevel": 7,
    "location": "Invalid Test"
  }'
```

**Expected Response**: HTTP 400 Bad Request

```json
{
  "error": "Invalid wealth level",
  "message": "WealthLevel must be between 1 and 6",
  "validValues": [1, 2, 3, 4, 5, 6]
}
```

## Performance Validation

### Load Testing

**Objective**: Ensure new tier doesn't impact performance

**Test Commands**:

```bash
# Test multiple concurrent treasure tier requests
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/loot/generate \
    -H "Content-Type: application/json" \
    -d '{"wealthLevel": 6, "location": "Load Test"}' &
done
wait
```

**Expected Result**: ✅ All requests complete within normal timeframes (< 500ms each)

### Memory Usage

**Objective**: Verify no memory leaks from enum extension

**Steps**:

1. Monitor backend memory usage before testing
2. Generate loot for all 6 tiers repeatedly (100+ requests each)
3. Monitor memory usage during and after testing
4. Verify memory returns to baseline

**Expected Result**: ✅ No memory leaks, stable memory usage

## Success Criteria Checklist

Execute all scenarios and verify each passes:

- [ ] **UI Display**: Treasure tier visible in dropdown with correct description
- [ ] **Treasure Generation**: Items generated with values ≥ 3601 pennies
- [ ] **Noble Range Update**: Items generated between 1201-3600 pennies only
- [ ] **Backward Compatibility**: Existing tiers (1-4) work unchanged
- [ ] **API Contracts**: Direct API calls work with new wealthLevel=6
- [ ] **Error Handling**: Invalid values (< 1 or > 6) return proper errors
- [ ] **Performance**: No degradation in response times
- [ ] **Memory**: No memory leaks from enum extension

## Troubleshooting

### Common Issues

**Issue**: Treasure tier not visible in UI dropdown  
**Solution**: Verify frontend enum mirrors backend, check component template

**Issue**: Generated items don't meet value requirements  
**Solution**: Check loot generation service range mapping logic

**Issue**: API returns 400 for wealthLevel=6  
**Solution**: Verify backend enum includes Treasure=6, check validation logic

**Issue**: Noble tier generates items > 3600 pennies  
**Solution**: Update generation service to respect new Noble upper bound

### Validation Commands

**Check Backend Enum**:

```bash
curl http://localhost:5000/api/loot/wealth-levels | jq '.wealthLevels | length'
# Should return: 6
```

**Check Frontend Build**:

```bash
# In frontend directory
npm run build
# Should complete without TypeScript errors
```

## Rollback Procedure

If validation fails and rollback is needed:

1. **Frontend Rollback**: Remove Treasure option from UI
2. **Backend Rollback**: Revert WealthLevel enum to 5 values
3. **Database**: No rollback needed (no schema changes)
4. **Cache**: Clear any cached enum values

---

**Quickstart Complete**: All validation scenarios defined and ready for execution
