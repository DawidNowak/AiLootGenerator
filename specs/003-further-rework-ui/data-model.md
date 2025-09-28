# Data Model: UI Layout and Visual Improvements

## Overview

This feature involves UI-only changes with no new data entities. The existing data model remains unchanged, with modifications only to presentation layer components.

## Existing Entities (No Changes Required)

### LootItem

- **Purpose**: Represents generated loot items displayed in the results
- **Current Structure**: Maintained as-is
- **UI Impact**: Display format changes from cards to list, but data structure unchanged
- **Properties**: Name, description, value, type, rarity, etc. (existing interface preserved)

### WealthLevel

- **Purpose**: Enumeration of wealth levels for loot generation
- **Current Structure**: Maintained as-is
- **UI Impact**: Presentation in dropdown changes (icons removed), but underlying data unchanged
- **Properties**: Level identifier, display name, penny ranges, etc. (existing interface preserved)

## Component Interface Changes

### WealthSelectorComponent

```typescript
// Interface modifications (TypeScript)
interface WealthLevelDisplayOptions {
  showIcons: boolean; // NEW: Set to false
  showPennyRanges: boolean; // NEW: Set to true
  pennyRangePosition: "below" | "inline"; // NEW: Set to 'below'
}
```

### LootListComponent

```typescript
// Interface modifications (TypeScript)
interface LootDisplayOptions {
  layout: "cards" | "list"; // NEW: Default to 'list'
  responsive: boolean; // NEW: Enable responsive behavior
  position: "below" | "side"; // NEW: Dynamic based on screen size
}
```

### LootGeneratorComponent

```typescript
// Interface modifications (TypeScript)
interface LayoutConfiguration {
  useResponsiveLayout: boolean; // NEW: Enable responsive container
  breakpoint: string; // NEW: '768px' breakpoint
  mobileLayout: "stacked"; // NEW: Stack form and results vertically
  desktopLayout: "side-by-side"; // NEW: Form left, results right
}
```

## UI State Management

### Responsive Layout State

- **State**: Current viewport size classification (mobile/desktop)
- **Source**: Angular BreakpointObserver service
- **Usage**: Determines layout configuration for loot results positioning
- **Updates**: Real-time based on window resize events

### Display Preferences State

- **State**: User preferences for price display, list formatting
- **Source**: Existing component state management
- **Changes**: No modifications to existing state structure
- **Persistence**: Maintained through existing localStorage patterns

## Validation Rules

### Component Display Rules

- **Header Visibility**: All header elements must remain visible across viewport sizes
- **Layout Transitions**: Smooth transitions between mobile/desktop layouts without content loss
- **List Formatting**: Loot items must display all existing information in new list format
- **Wealth Selector**: All wealth levels must remain accessible without icons

### Responsive Behavior Rules

- **Breakpoint Logic**: Layout switches at 768px viewport width
- **Content Preservation**: No data loss during responsive transitions
- **Accessibility**: All existing accessibility features maintained in new layouts
- **Performance**: Layout calculations must not block UI thread

## Dependencies

### Data Flow (Unchanged)

- Backend API → Frontend Services → Components → Templates
- No modifications to data fetching or processing logic
- UI presentation layer only affected

### Component Relationships (Modified)

- AppComponent → LootGeneratorComponent (header visibility fixes)
- LootGeneratorComponent → LootListComponent (responsive positioning)
- LootGeneratorComponent → WealthSelectorComponent (simplified display)
- All data binding and event handling patterns preserved

## Migration Considerations

### Backward Compatibility

- **Data structures**: 100% backward compatible, no API changes
- **Component APIs**: External interfaces unchanged, internal implementation only
- **User preferences**: Existing settings preserved and respected
- **Browser support**: No breaking changes for supported browser versions

### Rollback Strategy

- **CSS changes**: Easily reversible through SCSS variable toggles
- **Component logic**: Feature flags can disable responsive behavior
- **Data integrity**: No data migration required, rollback has zero data impact
