# Component Integration Contract

**Contract**: LootFormComponent integrated interface  
**Type**: Angular Component Interface  
**Date**: September 28, 2025

## Component Interface Contract

### LootFormComponent (Integrated)

**Template Contract**:

```html
<div class="loot-form-container">
  <mat-card class="loot-form-card">
    <mat-card-header>
      <mat-card-title>{{ "loot.generation.title" | translate }}</mat-card-title>
      <mat-card-subtitle
        >{{ "loot.generation.subtitle" | translate }}</mat-card-subtitle
      >
    </mat-card-header>

    <mat-card-content>
      <form [formGroup]="lootForm" (ngSubmit)="onSubmit()">
        <!-- Integrated Location Input -->
        <mat-form-field appearance="outline">
          <mat-label>{{ "location.label" | translate }}</mat-label>
          <input
            matInput
            formControlName="location"
            [placeholder]="'location.placeholder' | translate"
            maxlength="200"
          />
          <mat-icon matPrefix>place</mat-icon>
          <mat-hint>{{ locationControl.value?.length || 0 }}/200</mat-hint>
          <mat-error *ngIf="locationControl.hasError('required')">
            {{ "validation.location.required" | translate }}
          </mat-error>
          <mat-error *ngIf="locationControl.hasError('maxlength')">
            {{ "validation.location.tooLong" | translate }}
          </mat-error>
        </mat-form-field>

        <!-- Wealth Selector (preserved as separate component) -->
        <app-wealth-selector
          [value]="lootForm.get('wealthLevel')?.value"
          [disabled]="isLoading()"
          (valueChange)="onWealthLevelChange($event)"
        >
        </app-wealth-selector>

        <!-- Error Message (preserved as separate component) -->
        <app-error-message
          *ngIf="errorMessage()"
          [error]="{ message: errorMessage()!, type: 'error' }"
          [allowDismiss]="true"
          (dismiss)="clearError()"
        >
        </app-error-message>

        <!-- Cooldown Timer (preserved as separate component) -->
        <app-cooldown-timer
          *ngIf="cooldownStatus().isActive"
          [remainingTime]="cooldownStatus().remainingMs"
          [showProgress]="true"
        >
        </app-cooldown-timer>

        <!-- Integrated Generate Button -->
        <button
          mat-raised-button
          type="submit"
          [disabled]="!canSubmit()"
          class="generate-button"
        >
          <mat-icon *ngIf="!isLoading()">casino</mat-icon>
          <mat-spinner *ngIf="isLoading()" diameter="16"></mat-spinner>
          {{ generateButtonText() }}
        </button>
      </form>
    </mat-card-content>
  </mat-card>
</div>
```

**Component Class Contract**:

```typescript
@Component({
  selector: "app-loot-form",
  standalone: true,
  imports: [
    // Angular Core
    CommonModule,
    ReactiveFormsModule,
    // Angular Material (integrated directly)
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSpinnerModule,
    // Preserved Components
    WealthSelectorComponent,
    ErrorMessageComponent,
    CooldownTimerComponent,
    // Pipes
    TranslatePipe,
  ],
})
export class LootFormComponent implements OnInit, OnDestroy {
  // Form Controls (direct integration)
  lootForm: FormGroup;

  // Computed Properties
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly canSubmit = computed(
    () =>
      this.lootForm?.valid &&
      !this.isLoading() &&
      !this.cooldownStatus().isActive
  );

  // Methods (simplified without child component events)
  onSubmit(): void;
  onWealthLevelChange(level: WealthLevel): void;
  generateButtonText(): string;
  clearError(): void;

  // Getters (simplified access)
  get locationControl(): AbstractControl;
}
```

### Eliminated Component Contracts

**LocationInputComponent**: ❌ REMOVED

- Functionality integrated directly into LootFormComponent template
- FormControl binding replaces component event emission
- Validation logic moved to parent component

**GenerateButtonComponent**: ❌ REMOVED

- Button element integrated directly into LootFormComponent template
- Loading state managed by parent component signals
- Click handling simplified to direct method calls

## Integration Test Contracts

### Component Integration Tests

**Test Contract**: Integrated form functionality

```typescript
describe('LootFormComponent Integration', () => {
  it('should render integrated location input', () => {
    // MUST NOT find separate location input component
    expect(fixture.debugElement.query(By.directive(LocationInputComponent))).toBeNull();

    // MUST find direct material form field
    const formField = fixture.debugElement.query(By.css('mat-form-field'));
    expect(formField).toBeTruthy();

    const input = formField.query(By.css('input[formControlName="location"]'));
    expect(input).toBeTruthy();
  });

  it('should render integrated generate button', () => {
    // MUST NOT find separate generate button component
    expect(fixture.debugElement.query(By.directive(GenerateButtonComponent))).toBeNull();

    // MUST find direct material button
    const button = fixture.debugElement.query(By.css('button[mat-raised-button]'));
    expect(button).toBeTruthy();
    expect(button.classes['generate-button']).toBeTruthy();
  });

  it('should handle form submission directly', () => {
    // MUST trigger onSubmit method directly
    spyOn(component, 'onSubmit');

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);

    expect(component.onSubmit).toHaveBeenCalled();
  });
}
```

### Theme Application Test Contract

**Test Contract**: Light theme application

```typescript
describe('Light Theme Integration', () => {
  it('should apply light theme classes', () => {
    const cardElement = fixture.debugElement.query(By.css('mat-card'));
    expect(cardElement.nativeElement.classList).toContain('light-theme');
  });

  it('should use light color variables', () => {
    const styles = getComputedStyle(fixture.nativeElement);
    expect(styles.getPropertyValue('--primary-color')).toBe('#eceff1');
    expect(styles.getPropertyValue('--background-primary')).toBe('#fafafa');
  });
}
```
