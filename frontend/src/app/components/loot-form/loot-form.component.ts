import { Component, OnInit, OnDestroy, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, combineLatest, switchMap, catchError, of, EMPTY } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// No more separate components needed

// Services and Models
import { SessionService, CooldownStatus } from '../../services/session.service';
import { LootApiService, LootGenerationResponse } from '../../services/loot-api.service';
import { I18nService } from '../../services/i18n.service';
import { GenerationRequest } from '../../models/generation-request.interface';
import { WealthLevel } from '../../models/wealth-level.enum';
import { LootItem } from '../../models/loot-item.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

/**
 * Form state for the loot generation form.
 */
export interface LootFormState {
    location: string;
    wealthLevel: WealthLevel;
    isValid: boolean;
    isLoading: boolean;
    cooldownStatus: CooldownStatus;
    errorMessage: string | null;
}

/**
 * Event emitted when loot generation is successful.
 */
export interface LootGeneratedEvent {
    items: LootItem[];
    request: GenerationRequest;
}

/**
 * Integrated loot generation form component with light minimalistic design.
 * 
 * This component integrates location input and generation button directly into a single
 * cohesive interface, eliminating separate child components for a cleaner user experience.
 * 
 * Features:
 * - Direct Angular Material form integration (location input, generate button)
 * - Light theme with instant visual feedback (no animations/transitions) 
 * - Form validation and submission handling
 * - Cooldown timer integration
 * - Loading state management with spinner
 * - Responsive design across all viewport sizes
 * - Accessibility support for keyboard navigation and screen readers
 * 
 * @example
 * ```html
 * <app-loot-form 
 *   (lootGenerated)="onLootGenerated($event)"
 *   (generationError)="onError($event)">
 * </app-loot-form>
 * ```
 * 
 * @version 2.0.0 - Integrated design without separate LocationInput/GenerateButton components
 */
@Component({
    selector: 'app-loot-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatSelectModule,
        MatProgressBarModule,
        TranslatePipe,
        LanguageSelectorComponent
    ],
    templateUrl: './loot-form.component.html',
    styleUrls: ['./loot-form.component.scss']
})
export class LootFormComponent implements OnInit, OnDestroy {
    @Output() lootGenerated = new EventEmitter<LootGeneratedEvent>();
    @Output() generationError = new EventEmitter<string>();
    @Output() priceToggleChanged = new EventEmitter<boolean>();

    // Form setup
    lootForm!: FormGroup;

    // Reactive state
    private readonly destroy$ = new Subject<void>();
    public readonly isLoading = signal<boolean>(false);
    public readonly errorMessage = signal<string | null>(null);
    private readonly formValid = signal<boolean>(false);
    public readonly showPrices = signal<boolean>(false);
    public readonly cooldownStatus = signal<CooldownStatus>({
        isActive: false,
        remainingMs: 0,
        remainingSeconds: 0,
        expiresAt: null
    });

    // Computed properties
    public readonly canSubmit = computed(() => {
        const cooldown = this.cooldownStatus();
        const loading = this.isLoading();
        const formValid = this.formValid();

        return formValid && !cooldown.isActive && !loading;
    });

    public readonly cooldownRemaining = computed(() => {
        return this.cooldownStatus().remainingMs;
    });

    // Wealth level options derived from enum
    public readonly wealthLevelOptions = Object.keys(WealthLevel)
        .filter(key => !isNaN(Number(WealthLevel[key as keyof typeof WealthLevel])))
        .map(key => ({
            value: WealthLevel[key as keyof typeof WealthLevel],
            labelKey: `wealth.${key.toLowerCase()}`,
            descriptionKey: `wealth.${key.toLowerCase()}.description`
        }));

    constructor(
        private fb: FormBuilder,
        private sessionService: SessionService,
        private lootApiService: LootApiService,
        private i18nService: I18nService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.initializeCooldownTracking();
        this.initializeFormValidation();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Initialize the reactive form with validation rules.
     */
    private initializeForm(): void {
        this.lootForm = this.fb.group({
            location: ['', [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(200)
            ]],
            wealthLevel: [WealthLevel.Common, [Validators.required]],
            showPrices: [true] // Add price toggle checkbox
        });

        // Initialize form validity signal
        this.formValid.set(this.lootForm.valid);
    }

    /**
     * Initialize cooldown status tracking.
     */
    private initializeCooldownTracking(): void {
        this.sessionService.getCooldownStatus()
            .pipe(takeUntil(this.destroy$))
            .subscribe(status => {
                this.cooldownStatus.set(status);
            });
    }

    /**
     * Initialize form validation and real-time feedback.
     */
    private initializeFormValidation(): void {
        // Clear errors when form becomes valid and update form validity signal
        this.lootForm.statusChanges
            .pipe(
                takeUntil(this.destroy$),
                distinctUntilChanged()
            )
            .subscribe(status => {
                this.formValid.set(status === 'VALID');
                if (status === 'VALID' && this.errorMessage()) {
                    this.errorMessage.set(null);
                }
            });

        // Debounce location input validation
        this.lootForm.get('location')?.valueChanges
            .pipe(
                takeUntil(this.destroy$),
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(value => {
                this.validateLocationInput(value);
            });
    }

    /**
     * Validate location input and provide user feedback.
     */
    private validateLocationInput(location: string): void {
        if (!location || location.trim().length === 0) {
            return; // Let the required validator handle this
        }

        if (location.length > 200) {
            this.setError('validation.location.tooLong');
        }
    }

    /**
     * Handle form submission and loot generation.
     */
    onSubmit(): void {
        if (!this.canSubmit()) {
            this.validateFormAndSetErrors();
            return;
        }

        this.generateLoot();
    }

    /**
     * Validate the form and set appropriate error messages.
     */
    private validateFormAndSetErrors(): void {
        if (!this.lootForm.valid) {
            const locationControl = this.lootForm.get('location');

            if (locationControl?.hasError('required')) {
                this.setError('validation.location.required');
                return;
            }

            if (locationControl?.hasError('minlength')) {
                this.setError('validation.location.required');
                return;
            }

            if (locationControl?.hasError('maxlength')) {
                this.setError('validation.location.tooLong');
                return;
            }
        }

        if (this.cooldownStatus().isActive) {
            const seconds = Math.ceil(this.cooldownStatus().remainingMs / 1000);
            this.setError('errors.cooldownActive', { seconds: seconds.toString() });
            return;
        }

        this.setError('errors.formInvalid');
    }

    /**
     * Generate loot items by calling the API.
     */
    private generateLoot(): void {
        this.isLoading.set(true);
        this.errorMessage.set(null);

        const request: GenerationRequest = {
            location: this.lootForm.value.location.trim(),
            wealthLevel: this.lootForm.value.wealthLevel,
            language: this.i18nService.currentLanguage(),
            sessionId: this.sessionService.getSessionId()
        };

        this.lootApiService.generateLoot(request)
            .pipe(
                takeUntil(this.destroy$),
                catchError(error => {
                    console.error('Loot generation error:', error);
                    this.handleGenerationError(error);
                    return EMPTY;
                })
            )
            .subscribe(response => {
                this.handleGenerationSuccess(response, request);
            });
    }

    /**
     * Handle successful loot generation.
     */
    private handleGenerationSuccess(response: LootGenerationResponse, request: GenerationRequest): void {
        this.isLoading.set(false);

        // Update session with new cooldown
        if (response.cooldownExpiresAt) {
            this.sessionService.updateSessionAfterGeneration(response.cooldownExpiresAt);
        }

        // Emit success event
        this.lootGenerated.emit({
            items: response.items,
            request: request
        });

        // Clear any previous errors
        this.errorMessage.set(null);
    }

    /**
     * Handle loot generation errors.
     */
    private handleGenerationError(error: any): void {
        this.isLoading.set(false);

        let errorKey = 'errors.generationFailed';
        let errorParams = {};

        // Handle specific error types
        if (error?.status === 400) {
            errorKey = 'errors.invalidRequest';
        } else if (error?.status === 429) {
            errorKey = 'errors.cooldownActive';
            if (error?.error?.details?.cooldownExpiresAt) {
                const expiresAt = new Date(error.error.details.cooldownExpiresAt);
                const remaining = Math.max(0, expiresAt.getTime() - Date.now());
                const seconds = Math.ceil(remaining / 1000);
                errorParams = { seconds: seconds.toString() };
            }
        } else if (error?.status === 500) {
            errorKey = 'errors.serverError';
        } else if (error?.status === 0 || !error?.status) {
            errorKey = 'errors.networkError';
        }

        this.setError(errorKey, errorParams);
        this.generationError.emit(this.i18nService.translate(errorKey, errorParams));
    }

    /**
     * Set an error message with optional translation parameters.
     */
    private setError(messageKey: string, params: Record<string, string> = {}): void {
        const translatedMessage = this.i18nService.translate(messageKey, params);
        this.errorMessage.set(translatedMessage);
    }

    /**
     * Clear any error messages.
     */
    clearError(): void {
        this.errorMessage.set(null);
    }

    /**
     * Handle price toggle change and emit to parent.
     */
    onPriceToggleChange(showPrices: boolean): void {
        this.showPrices.set(showPrices);
        this.priceToggleChanged.emit(showPrices);
    }

    /**
     * Get cooldown progress as percentage (0-100).
     */
    getCooldownProgress(): number {
        const status = this.cooldownStatus();
        if (!status.isActive || !status.expiresAt) return 0;

        // Simple calculation: how much time has elapsed vs total cooldown time
        const totalCooldownMs = 30000; // 30 seconds in milliseconds
        const remainingMs = status.remainingMs;
        const elapsedMs = totalCooldownMs - remainingMs;

        const progress = (elapsedMs / totalCooldownMs) * 100;
        return Math.max(0, Math.min(100, progress));
    }

    /**
     * Get cooldown remaining time as formatted text.
     */
    getCooldownText(): string {
        const status = this.cooldownStatus();
        if (!status.isActive) return '';

        const seconds = Math.ceil(status.remainingMs / 1000);
        return `${seconds}s`;
    }

    /**
     * Reset the form to initial state.
     */
    resetForm(): void {
        this.lootForm.reset({
            location: '',
            wealthLevel: WealthLevel.Common
        });
        this.errorMessage.set(null);
    }

    /**
     * Get current form state for external access.
     */
    getFormState(): LootFormState {
        return {
            location: this.lootForm.value.location || '',
            wealthLevel: this.lootForm.value.wealthLevel || WealthLevel.Common,
            isValid: this.lootForm.valid,
            isLoading: this.isLoading(),
            cooldownStatus: this.cooldownStatus(),
            errorMessage: this.errorMessage()
        };
    }

    /**
     * Get location control for template access.
     */
    get locationControl(): AbstractControl {
        return this.lootForm.get('location')!;
    }

    /**
     * Get display text for selected wealth level (shows only the label, not description).
     */
    getWealthDisplayText(value: WealthLevel): string {
        const option = this.wealthLevelOptions.find(opt => opt.value === value);
        return option ? this.i18nService.translate(option.labelKey) : '';
    }

    /**
     * Get generate button text based on current state.
     */
    generateButtonText(): string {
        if (this.isLoading()) {
            return this.i18nService.translate('common.generating');
        }

        if (this.cooldownStatus().isActive) {
            return this.i18nService.translate('common.cooldown.wait');
        }

        return this.i18nService.translate('common.generate');
    }
}