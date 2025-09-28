# Data Model: Modern Minimalistic Frontend Redesign

**Feature**: Frontend component integration and light theme  
**Date**: September 28, 2025  
**Context**: Angular component restructuring and theme application

## Core Entities

### Form Interface

**Purpose**: Single, integrated component containing all form elements and generation controls

**Structure**:

```typescript
interface IntegratedFormInterface {
  // Form Controls (direct Angular Material integration)
  locationInput: {
    control: FormControl<string>;
    validation: ValidationRules;
    placeholder: string;
    maxLength: number;
  };

  wealthSelector: {
    control: FormControl<WealthLevel>;
    options: WealthLevel[];
    validation: ValidationRules;
  };

  generateButton: {
    state: ButtonState;
    disabled: boolean;
    loadingIndicator: boolean;
  };

  // Form State Management
  formState: {
    valid: boolean;
    submitted: boolean;
    loading: boolean;
    errors: ValidationError[];
  };
}

enum ButtonState {
  IDLE = "idle",
  LOADING = "loading",
  DISABLED = "disabled",
  COOLDOWN = "cooldown",
}
```

**Validation Rules**:

- Location input: Required, 1-200 characters, no special validation beyond length
- Wealth level: Required, must be valid WealthLevel enum value
- Form submission: All controls valid + no active cooldown

**State Transitions**:

1. Initial → User Input → Validation → Ready
2. Ready → Generate Click → Loading → Success/Error → Ready
3. Success → Cooldown → Ready
4. Error → User Correction → Ready

### Visual Theme

**Purpose**: Light color palette with minimal contrast and clean aesthetics

**Structure**:

```typescript
interface LightThemeConfiguration {
  // Primary Colors
  primary: {
    main: "#eceff1"; // Blue Grey 50
    contrast: "#263238"; // Blue Grey 800
  };

  accent: {
    main: "#ffe082"; // Amber 200
    contrast: "#ff8f00"; // Amber 600
  };

  background: {
    default: "#fafafa"; // Grey 50
    paper: "#ffffff"; // White
    elevated: "#f5f5f5"; // Grey 100
  };

  text: {
    primary: "#212121"; // Grey 900
    secondary: "#757575"; // Grey 600
    disabled: "#bdbdbd"; // Grey 400
  };

  // Functional Colors
  success: "#4caf50"; // Green 500
  warning: "#ff9800"; // Orange 500
  error: "#f44336"; // Red 500
}
```

**Application Scope**:

- All Angular Material components
- Custom form elements
- Background colors and text
- Button states and hover effects
- Error and validation messaging

### User Interactions

**Purpose**: Simplified feedback mechanisms without complex animations

**Structure**:

```typescript
interface UserInteractionPatterns {
  // Input Feedback
  focus: {
    indicator: "subtle-border-color";
    animation: "none";
    transition: "none";
  };

  validation: {
    success: "green-border-color";
    error: "red-border-color";
    message: "text-display";
    animation: "none";
  };

  // Button Feedback
  hover: {
    background: "subtle-lightening";
    animation: "none";
    cursor: "pointer";
  };

  press: {
    background: "subtle-darkening";
    animation: "none";
    duration: "instant";
  };

  loading: {
    indicator: "static-spinner";
    text: "loading-message";
    disabled: true;
    animation: "spinner-only";
  };
}
```

**Interaction Principles**:

- No CSS transitions or keyframe animations
- State changes are immediate and clear
- Visual feedback through color and text only
- Preserve accessibility indicators
- Maintain semantic HTML structure

## Component Relationships

### Before Integration (Current State)

```
LootFormComponent
├── LocationInputComponent
├── GenerateButtonComponent
├── WealthSelectorComponent (preserved)
├── CooldownTimerComponent (preserved)
└── ErrorMessageComponent (preserved)
```

### After Integration (Target State)

```
LootFormComponent (integrated)
├── Direct HTML form controls
│   ├── mat-form-field (location)
│   └── mat-button (generate)
├── WealthSelectorComponent (preserved)
├── CooldownTimerComponent (preserved)
└── ErrorMessageComponent (preserved)
```

**Integration Points**:

- Location input becomes direct `<input matInput>` within `<mat-form-field>`
- Generate button becomes direct `<button mat-raised-button>`
- Form validation handled by reactive forms in parent component
- Event handling simplified to direct method calls

## Data Flow Simplification

### Current Data Flow

```
User Input → LocationInputComponent → Event Emission → LootFormComponent
User Click → GenerateButtonComponent → Event Emission → LootFormComponent
LootFormComponent → API Service → Response Handling
```

### Simplified Data Flow

```
User Input → Direct FormControl → LootFormComponent Validation
User Click → Direct Method Call → LootFormComponent API Service
API Response → Direct Component State Update
```

**Benefits**:

- Eliminates event emission overhead
- Reduces component communication complexity
- Improves type safety with direct FormControl binding
- Simplifies debugging and testing
