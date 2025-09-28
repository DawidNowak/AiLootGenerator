# Data Model: UI Component Simplification

**Feature**: Further UI Rework for Simplicity  
**Created**: September 28, 2025  
**Purpose**: Define UI component structure and styling requirements for simplification

## UI Component Entities

### LocationInput

**Purpose**: Text input for location descriptions  
**Type**: Form Input Component  
**Properties**:

- `value`: string - The location description text
- `placeholder`: string - Hint text for user input
- `multiline`: boolean - Enables textarea behavior (true)
- `rows`: number - Minimum visible rows (default: 3)
- `validation`: object - Form validation rules

**Relationships**:

- Used by: Main generation form
- Validates: Non-empty location description

**State Transitions**:

- Empty → User typing → Valid location → Form submittable

### StatusMessage

**Purpose**: Display system status and readiness indicators  
**Type**: Display Component  
**Properties**:

- `message`: string - Status text to display
- `type`: enum - 'ready' | 'loading' | 'error' | 'info'
- `visible`: boolean - Whether message is displayed
- `contrast`: string - Color contrast level ('high' | 'normal')

**Validation Rules**:

- Message text must be clearly visible (WCAG AA contrast ratio ≥ 4.5:1)
- Ready state must use high contrast styling

### LootItem

**Purpose**: Individual loot item display  
**Type**: Display Component  
**Properties**:

- `name`: string - Item name
- `description`: string - Item description
- `price`: number - Item value (optional)
- `styling`: string - Consistent light styling class
- `wealth_level`: enum - No longer affects display styling

**Validation Rules**:

- All items use identical light styling regardless of wealth_level
- No decorative icons displayed
- Consistent spacing and typography

### ComponentMapping

**Purpose**: Define custom component to standard component replacements  
**Type**: Configuration Entity  
**Properties**:

| Custom Component | Standard Replacement | Angular Material Component |
| ---------------- | -------------------- | -------------------------- |
| LanguageSelector | Standard Dropdown    | mat-select                 |
| CooldownTimer    | Text/Progress        | mat-progress-bar + text    |
| LootItem         | List Item            | mat-list-item              |
| LootList         | List Container       | mat-list                   |
| PriceToggle      | Checkbox/Toggle      | mat-checkbox               |
| WealthSelector   | Dropdown             | mat-select                 |

### LayoutSpacing

**Purpose**: Define spacing and layout optimization rules  
**Type**: Styling Entity  
**Properties**:

- `generate_button_margin_bottom`: string - Reduced bottom margin
- `status_message_contrast`: string - Enhanced contrast values
- `component_spacing`: object - Consistent spacing between elements
- `responsive_breakpoints`: object - Mobile and desktop layout rules

**Validation Rules**:

- Minimal whitespace below generate button
- Consistent spacing patterns throughout application
- Responsive design maintained

## Relationships

```
Main Form
├── LocationInput (multiline textarea)
├── WealthSelector (mat-select)
├── LanguageSelector (mat-select)
├── PriceToggle (mat-checkbox)
├── StatusMessage (enhanced contrast)
├── Generate Button (reduced bottom spacing)
└── Results Section
    ├── CooldownTimer (mat-progress-bar + text)
    └── LootList (mat-list)
        └── LootItem[] (mat-list-item, uniform styling)
```

## State Management

### Form State

- `location`: string (multiline input)
- `wealth_level`: enum (standard dropdown)
- `language`: enum (standard dropdown)
- `show_prices`: boolean (standard checkbox)

### Display State

- `status`: string (high contrast display)
- `loading`: boolean (standard progress indicator)
- `loot_items`: array (uniformly styled list items)

## Styling Requirements

### Color Palette

- **Status Ready**: High contrast color (e.g., #2e7d32 on light background)
- **Loot Items**: Consistent light styling (e.g., #f5f5f5 background, #212121 text)
- **Form Elements**: Standard Angular Material theming

### Spacing Rules

- **Generate Button**: margin-bottom reduced to 8px (from current excessive spacing)
- **Component Spacing**: 16px standard gap between form sections
- **List Items**: 8px padding, consistent across all wealth levels

### Typography

- **Status Messages**: Medium weight, 14px, high contrast
- **Loot Items**: Regular weight, 14px, consistent styling
- **Form Labels**: Standard Angular Material typography scale

## Migration Strategy

1. **Component Replacement**: Replace custom components with mat-\* equivalents
2. **Styling Unification**: Remove wealth-level and icon-based styling
3. **Layout Optimization**: Adjust spacing and contrast
4. **Functionality Preservation**: Maintain all existing behaviors

This data model ensures UI simplification while preserving all functional requirements.
