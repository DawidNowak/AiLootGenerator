# Frontend Component Contracts

**Purpose**: Define interface contracts for UI component simplification  
**Last Updated**: September 28, 2025

## Component Interface Contracts

### LocationInput Component Contract

```typescript
interface LocationInputComponent {
  // Input Properties
  value: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;

  // Output Events
  valueChange: EventEmitter<string>;
  blur: EventEmitter<void>;

  // Methods
  focus(): void;
  clear(): void;

  // Validation
  valid: boolean;
  errors: string[];
}
```

**Implementation Requirements**:

- MUST use Angular Material mat-form-field + textarea
- MUST support multiline input (minimum 3 rows)
- MUST maintain existing validation behavior

### StatusMessage Component Contract

```typescript
interface StatusMessageComponent {
  // Input Properties
  message: string;
  type: "ready" | "loading" | "error" | "info";
  visible: boolean;

  // Computed Properties
  cssClasses: string[];
  ariaLabel: string;

  // Accessibility
  role: "status" | "alert";
}
```

**Implementation Requirements**:

- MUST ensure WCAG AA contrast ratio (≥4.5:1) for 'ready' state
- MUST use semantic HTML for screen readers
- MUST be clearly visible against background

### LootItem Component Contract

```typescript
interface LootItemComponent {
  // Input Properties
  item: {
    name: string;
    description: string;
    price?: number;
    wealthLevel: WealthLevel; // No longer affects styling
  };
  showPrices: boolean;

  // Styling (Uniform)
  readonly cssClass: "loot-item-light"; // Consistent for all items
  readonly hasIcons: false; // No icons allowed
}
```

**Implementation Requirements**:

- MUST use mat-list-item for consistent Material Design
- MUST apply identical styling regardless of wealthLevel
- MUST NOT display any decorative icons

### Component Replacement Contracts

#### LanguageSelector → mat-select

```typescript
interface LanguageSelector {
  selectedLanguage: string;
  availableLanguages: string[];
  languageChange: EventEmitter<string>;
}
```

#### WealthSelector → mat-select

```typescript
interface WealthSelector {
  selectedWealth: WealthLevel;
  wealthLevels: WealthLevel[];
  wealthChange: EventEmitter<WealthLevel>;
}
```

#### PriceToggle → mat-checkbox

```typescript
interface PriceToggle {
  checked: boolean;
  checkedChange: EventEmitter<boolean>;
  label: string;
}
```

#### CooldownTimer → mat-progress-bar + text

```typescript
interface CooldownTimer {
  remaining: number;
  total: number;
  active: boolean;
  mode: "determinate";
  value: number; // percentage (0-100)
  displayText: string;
}
```

## Layout Contract

### Spacing Requirements

```typescript
interface LayoutSpacing {
  generateButtonMarginBottom: "8px";
  componentGap: "16px";
  listItemPadding: "8px";
  formSectionSpacing: "24px";
}
```

### Responsive Breakpoints

```typescript
interface ResponsiveLayout {
  mobile: "max-width: 768px";
  tablet: "max-width: 1024px";
  desktop: "min-width: 1025px";
}
```

## Styling Contracts

### Color Palette

```scss
// Status message colors (high contrast)
$status-ready: #2e7d32;
$status-error: #d32f2f;
$status-info: #1976d2;

// Loot item colors (uniform light theme)
$loot-item-background: #f5f5f5;
$loot-item-text: #212121;
$loot-item-border: #e0e0e0;
```

### Typography Scale

```scss
$status-message: (
  font-size: 14px,
  font-weight: 500,
  line-height: 1.4,
);

$loot-item-text: (
  font-size: 14px,
  font-weight: 400,
  line-height: 1.5,
);
```

## Testing Contracts

### Visual Testing

- Status message visibility test (contrast ratio verification)
- Component spacing measurements
- Responsive layout validation
- Cross-browser compatibility

### Functional Testing

- All existing functionality preserved
- Form validation behavior unchanged
- Component interaction patterns maintained
- Accessibility features working

### Performance Testing

- No degradation in load times
- Component rendering performance maintained
- Bundle size impact minimal

## Migration Checklist

- [ ] Replace custom LanguageSelector with mat-select
- [ ] Replace custom CooldownTimer with mat-progress-bar + text
- [ ] Replace custom LootItem with mat-list-item
- [ ] Replace custom LootList with mat-list
- [ ] Replace custom PriceToggle with mat-checkbox
- [ ] Replace custom WealthSelector with mat-select
- [ ] Remove wealth-level based styling from loot items
- [ ] Remove all decorative icons from loot items
- [ ] Reduce spacing below generate button
- [ ] Enhance status message contrast
- [ ] Convert location input to multiline textarea
- [ ] Update all related unit tests
- [ ] Verify accessibility compliance
- [ ] Validate responsive design
