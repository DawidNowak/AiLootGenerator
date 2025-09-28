# Component Contracts: UI Layout and Visual Improvements

## WealthSelectorComponent Contract

### Input Properties

```typescript
@Input() required: boolean = false;               // Existing - unchanged
@Input() showIcons: boolean = false;              // NEW - disable icon display
@Input() showPennyRanges: boolean = true;         // NEW - enable penny range display
@Input() pennyRangePosition: 'below' = 'below';   // NEW - position ranges below dropdown
```

### Output Events

```typescript
@Output() selectionChange: EventEmitter<WealthLevel>; // Existing - unchanged
```

### Template Contract

- Dropdown MUST NOT display icons in options
- Penny range text MUST appear below dropdown component
- All existing accessibility attributes MUST be preserved
- Tooltip functionality MUST remain available

### CSS Classes

```scss
.wealth-selector {
  // Existing base styles preserved

  .wealth-option-content {
    // Remove icon container styles
    .wealth-icon {
      display: none;
    } // NEW
  }

  .penny-range-display {
    // NEW
    display: block;
    font-size: 0.875rem;
    color: var(--mdc-theme-text-secondary);
    margin-top: 0.5rem;
  }
}
```

## LootListComponent Contract

### Input Properties

```typescript
@Input() items: LootItem[] = [];           // Existing - unchanged
@Input() showPrices: boolean = false;      // Existing - unchanged
@Input() showFullBreakdown: boolean = false; // Existing - unchanged
@Input() isLoading: boolean = false;       // Existing - unchanged
@Input() layout: 'list' = 'list';          // NEW - force list layout
```

### Template Contract

- Items MUST display as vertical list, not grid of cards
- All existing item information MUST remain visible
- Loading and empty states MUST be preserved
- Accessibility semantics MUST use proper list markup

### CSS Classes

```scss
.loot-items-grid {
  // Convert from grid to list layout
  display: flex;
  flex-direction: column;
  gap: 0.75rem; // NEW - list item spacing

  // Remove grid-specific styles
  grid-template-columns: none;
  grid-gap: none;
}

.loot-item-wrapper {
  // NEW - list item styling
  width: 100%;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

## LootGeneratorComponent Contract

### Template Contract

- Generation form and results MUST use responsive container
- Desktop (>768px): Form left, results right in two-column layout
- Mobile (≤768px): Form top, results bottom in stacked layout
- All existing form functionality MUST be preserved

### CSS Classes

```scss
.loot-generator {
  .responsive-container {
    display: grid;
    gap: 2rem;

    // Mobile-first (stacked)
    grid-template-columns: 1fr;
    grid-template-areas:
      "form"
      "results";

    // Desktop (side-by-side)
    @media (min-width: 769px) {
      grid-template-columns: 400px 1fr;
      grid-template-areas: "form results";
    }
  }

  .generation-section {
    grid-area: form;
  }

  .results-section {
    grid-area: results;
  }
}
```

## AppComponent Contract

### Template Contract

- Header content MUST be fully visible on all viewport sizes
- Header height MUST NOT cause content overflow issues
- All existing navigation and controls MUST remain functional

### CSS Classes

```scss
.app-header {
  // Fix visibility issues
  min-height: auto; // Remove fixed height constraints
  padding: 1rem 0 2rem 0; // Reduce excessive padding

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;

    // Ensure content fits viewport
    @media (max-height: 600px) {
      padding: 0 1rem;
      .app-title {
        font-size: 2rem; // Reduce title size on small screens
      }
    }
  }
}
```

## Responsive Behavior Contracts

### Breakpoint Contract

```typescript
// Service contract for breakpoint detection
interface ResponsiveBreakpoints {
  mobile: "(max-width: 768px)";
  desktop: "(min-width: 769px)";
}

// Component contract for breakpoint handling
@Injectable()
export class ResponsiveLayoutService {
  isMobile$: Observable<boolean>;
  isDesktop$: Observable<boolean>;
}
```

### Layout Transition Contract

- Layout changes MUST be smooth (transition duration ≤300ms)
- Content MUST NOT jump or cause layout shift during transitions
- Focus management MUST be preserved during responsive changes
- Scroll position MUST be maintained appropriately

## Testing Contracts

### Unit Test Requirements

```typescript
// WealthSelectorComponent tests
describe("WealthSelectorComponent", () => {
  it("should not display icons when showIcons is false");
  it("should display penny ranges below dropdown when enabled");
  it("should maintain existing form validation behavior");
});

// LootListComponent tests
describe("LootListComponent", () => {
  it("should display items as vertical list");
  it("should preserve all item information in list format");
  it("should maintain loading and empty states");
});

// LootGeneratorComponent tests
describe("LootGeneratorComponent", () => {
  it("should use stacked layout on mobile viewports");
  it("should use side-by-side layout on desktop viewports");
  it("should transition smoothly between layouts");
});
```

### Integration Test Requirements

- Cross-component layout behavior validation
- Responsive breakpoint transition testing
- Accessibility compliance verification
- Visual regression testing for layout changes
