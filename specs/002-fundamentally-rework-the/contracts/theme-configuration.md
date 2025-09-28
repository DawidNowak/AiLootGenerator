# Theme Configuration Contract

**Contract**: Light theme implementation  
**Type**: Angular Material Theme + CSS Custom Properties  
**Date**: September 28, 2025

## Theme Configuration Contract

### Angular Material Theme Definition

**File**: `src/styles/themes/light-theme.scss`

```scss
@use "@angular/material" as mat;

// Light theme palette definitions
$light-primary: mat.define-palette(mat.$blue-grey-palette, 50, 100, 200);
$light-accent: mat.define-palette(mat.$amber-palette, 200, 100, 300);
$light-warn: mat.define-palette(mat.$red-palette, 500, 400, 600);

// Light theme definition
$light-theme: mat.define-light-theme(
  (
    color: (
      primary: $light-primary,
      accent: $light-accent,
      warn: $light-warn,
    ),
    typography: mat.define-typography-config(
        $font-family: '"Roboto", "Helvetica Neue", sans-serif',
        $headline-1: mat.define-typography-level(32px, 48px, 300),
        $headline-6: mat.define-typography-level(20px, 32px, 500),
        $body-1: mat.define-typography-level(14px, 24px, 400),
      ),
  )
);
```

### CSS Custom Properties Contract

**File**: `src/styles/themes/light-variables.scss`

```scss
:root {
  // Primary Color System
  --primary-50: #eceff1;
  --primary-100: #cfd8dc;
  --primary-200: #b0bec5;
  --primary-800: #37474f;
  --primary-900: #263238;

  // Accent Color System
  --accent-100: #fff3c4;
  --accent-200: #ffe082;
  --accent-600: #ff8f00;

  // Background System
  --background-default: #fafafa;
  --background-paper: #ffffff;
  --background-elevated: #f5f5f5;
  --background-card: #ffffff;

  // Text System
  --text-primary: #212121;
  --text-secondary: #757575;
  --text-disabled: #bdbdbd;
  --text-hint: #9e9e9e;

  // Functional Colors
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-error: #f44336;
  --color-info: #2196f3;

  // Interactive States
  --button-hover: #e8eaf6;
  --button-active: #c5cae9;
  --button-disabled: #e0e0e0;

  // Form Elements
  --form-border: #e0e0e0;
  --form-border-focus: var(--primary-200);
  --form-border-error: var(--color-error);
  --form-background: #ffffff;

  // Shadows (minimal for light theme)
  --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-medium: 0 2px 6px rgba(0, 0, 0, 0.16);
}
```

### Component Theme Application Contract

**File**: `src/app/components/loot-form/loot-form.component.scss`

```scss
.loot-form-container {
  background-color: var(--background-default);
  color: var(--text-primary);

  .loot-form-card {
    background-color: var(--background-card);
    border: 1px solid var(--form-border);
    box-shadow: var(--shadow-light);
    border-radius: 8px;

    mat-card-header {
      background-color: var(--background-paper);

      mat-card-title {
        color: var(--text-primary);
        font-weight: 500;
      }

      mat-card-subtitle {
        color: var(--text-secondary);
      }
    }
  }

  // Integrated form field styling
  mat-form-field {
    &.mat-form-field-appearance-outline {
      .mat-form-field-outline {
        color: var(--form-border);
      }

      &.mat-focused .mat-form-field-outline-thick {
        color: var(--form-border-focus);
      }

      &.mat-form-field-invalid .mat-form-field-outline-thick {
        color: var(--form-border-error);
      }
    }

    .mat-form-field-label {
      color: var(--text-secondary);
    }

    input {
      color: var(--text-primary);
    }

    mat-hint {
      color: var(--text-hint);
    }

    mat-error {
      color: var(--color-error);
    }
  }

  // Integrated button styling
  .generate-button {
    background-color: var(--primary-200);
    color: var(--primary-900);
    border: none;

    &:hover:not(:disabled) {
      background-color: var(--button-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--button-active);
    }

    &:disabled {
      background-color: var(--button-disabled);
      color: var(--text-disabled);
    }
  }
}
```

## Animation Elimination Contract

### CSS Reset for Animations

**File**: `src/styles/global/animations-disabled.scss`

```scss
// Complete animation and transition elimination
*,
*::before,
*::after {
  // Remove all CSS transitions
  transition-duration: 0s !important;
  transition-delay: 0s !important;

  // Remove all CSS animations
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
}

// Override Angular Material animations
.mat-ripple-element {
  display: none !important;
}

.mat-button-focus-overlay {
  opacity: 0 !important;
}

// Preserve only loading spinner animation (essential feedback)
mat-spinner circle {
  animation: mat-spinner-rotate 1.4s linear infinite !important;
}
```

### Preserved Feedback Contract

**Essential User Feedback** (preserved without animations):

```scss
// Focus indicators (instant)
.mat-form-field.mat-focused {
  .mat-form-field-label {
    color: var(--form-border-focus);
    // NO transition
  }
}

// Button press feedback (instant)
button:active {
  background-color: var(--button-active);
  // NO transition
}

// Validation state feedback (instant)
.mat-form-field-invalid {
  .mat-form-field-outline {
    color: var(--form-border-error);
    // NO transition
  }
}
```

## Integration Test Contract for Theme

### Theme Application Tests

**Test File**: `src/app/components/loot-form/loot-form.component.spec.ts`

```typescript
describe("LootFormComponent Theme Integration", () => {
  it("should apply light theme variables", () => {
    const compiled = fixture.nativeElement;
    const cardElement = compiled.querySelector(".loot-form-card");

    const styles = getComputedStyle(cardElement);
    expect(styles.backgroundColor).toBe("rgb(255, 255, 255)"); // --background-card
  });

  it("should eliminate animations on form elements", () => {
    const input = fixture.nativeElement.querySelector("input");
    const styles = getComputedStyle(input);

    expect(styles.transitionDuration).toBe("0s");
    expect(styles.animationDuration).toBe("0s");
  });

  it("should preserve loading spinner animation", () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector("mat-spinner circle");
    const styles = getComputedStyle(spinner);

    expect(styles.animationDuration).not.toBe("0s");
    expect(styles.animationName).toContain("rotate");
  });
});
```
