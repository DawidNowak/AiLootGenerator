import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { of } from 'rxjs';

import { LootFormComponent } from './loot-form.component';
import { SessionService } from '../../services/session.service';
import { LootApiService } from '../../services/loot-api.service';
import { I18nService } from '../../services/i18n.service';
import { WealthLevel } from '../../models/wealth-level.enum';

// Mock Services
const mockSessionService = {
    getCooldownStatus: () => of({ isActive: false, remainingMs: 0, remainingSeconds: 0, expiresAt: null }),
    getSessionId: () => 'test-session-id',
    updateSessionAfterGeneration: jasmine.createSpy('updateSessionAfterGeneration')
};

const mockLootApiService = {
    generateLoot: jasmine.createSpy('generateLoot').and.returnValue(of({
        items: [],
        sessionId: 'test-session-id',
        cooldownExpiresAt: '2025-09-25T12:00:00Z',
        totalItems: 0
    }))
};

const mockI18nService = {
    currentLanguage: () => 'en',
    translate: (key: string) => `Translated: ${key}`
};

describe('LootFormComponent', () => {
    let component: LootFormComponent;
    let fixture: ComponentFixture<LootFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LootFormComponent,
                ReactiveFormsModule,
                NoopAnimationsModule,
                MatCardModule,
                MatDividerModule
            ],
            providers: [
                { provide: SessionService, useValue: mockSessionService },
                { provide: LootApiService, useValue: mockLootApiService },
                { provide: I18nService, useValue: mockI18nService }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(LootFormComponent);
        component = fixture.componentInstance;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize form with default values', () => {
            fixture.detectChanges();

            expect(component.lootForm).toBeDefined();
            expect(component.lootForm.get('location')?.value).toBe('');
            expect(component.lootForm.get('wealthLevel')?.value).toBe(WealthLevel.Common);
        });

        it('should initialize with loading false and no error', () => {
            fixture.detectChanges();

            expect(component.isLoading()).toBeFalse();
            expect(component.errorMessage()).toBeNull();
        });
    });

    describe('Form Validation', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should be invalid when location is empty', () => {
            component.lootForm.patchValue({ location: '', wealthLevel: WealthLevel.Common });

            expect(component.lootForm.invalid).toBeTrue();
        });

        it('should be valid with proper location and wealth level', () => {
            component.lootForm.patchValue({
                location: 'Ubersreik barracks',
                wealthLevel: WealthLevel.Common
            });

            expect(component.lootForm.valid).toBeTrue();
        });

        it('should be invalid when location is too long', () => {
            const longLocation = 'a'.repeat(201);
            component.lootForm.patchValue({ location: longLocation });

            expect(component.lootForm.invalid).toBeTrue();
        });
    });

    describe('Form Input Handling', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should handle wealth level changes', () => {
            component.onWealthLevelChange(WealthLevel.Noble);

            expect(component.lootForm.get('wealthLevel')?.value).toBe(WealthLevel.Noble);
            expect(component.errorMessage()).toBeNull();
        });

        it('should handle location changes through direct form control', () => {
            const testLocation = 'Test Location';

            // Update form control directly (integrated approach)
            component.lootForm.patchValue({ location: testLocation });

            expect(component.lootForm.get('location')?.value).toBe(testLocation);
        });
    });

    describe('Component State Management', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should reset form to initial state', () => {
            component.lootForm.patchValue({
                location: 'Test location',
                wealthLevel: WealthLevel.Noble
            });
            component.errorMessage.set('Test error');

            component.resetForm();

            expect(component.lootForm.get('location')?.value).toBe('');
            expect(component.lootForm.get('wealthLevel')?.value).toBe(WealthLevel.Common);
            expect(component.errorMessage()).toBeNull();
        });

        it('should return current form state', () => {
            const testLocation = 'Test location';
            component.lootForm.patchValue({
                location: testLocation,
                wealthLevel: WealthLevel.Noble
            });
            component.isLoading.set(true);

            const state = component.getFormState();

            expect(state.location).toBe(testLocation);
            expect(state.wealthLevel).toBe(WealthLevel.Noble);
            expect(state.isLoading).toBeTrue();
            expect(state.isValid).toBeTrue();
        });

        it('should clear errors when clearError is called', () => {
            component.errorMessage.set('Test error');

            component.clearError();

            expect(component.errorMessage()).toBeNull();
        });
    });

    // ===== CONTRACT TESTS (T004-T007) =====
    // These tests MUST FAIL initially and pass after integration

    describe('Component Integration Contract Tests', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        // T004 [P] Component integration contract test
        it('should have integrated location input instead of separate LocationInputComponent', () => {
            const compiled = fixture.nativeElement;

            // MUST NOT find separate location input component
            expect(compiled.querySelector('app-location-input')).toBeNull();

            // MUST find direct material form field with location input
            const formField = compiled.querySelector('mat-form-field');
            expect(formField).toBeTruthy();

            const locationInput = formField.querySelector('input[formControlName="location"]');
            expect(locationInput).toBeTruthy();
            expect(locationInput.getAttribute('maxlength')).toBe('200');
        });

        // T004 [P] Component integration contract test (continued)
        it('should have integrated generate button instead of separate GenerateButtonComponent', () => {
            const compiled = fixture.nativeElement;

            // MUST NOT find separate generate button component
            expect(compiled.querySelector('app-generate-button')).toBeNull();

            // MUST find direct material button
            const generateButton = compiled.querySelector('button[mat-raised-button].generate-button');
            expect(generateButton).toBeTruthy();
            expect(generateButton.getAttribute('type')).toBe('submit');
        });

        // T005 [P] Light theme application contract test
        it('should apply light theme CSS custom properties', () => {
            const compiled = fixture.nativeElement;
            const cardElement = compiled.querySelector('.loot-form-card');
            expect(cardElement).toBeTruthy();

            // Check that CSS custom properties are available
            const rootStyles = getComputedStyle(document.documentElement);
            expect(rootStyles.getPropertyValue('--background-default')).toBe('#fafafa');
            expect(rootStyles.getPropertyValue('--primary-50')).toBe('#eceff1');
            expect(rootStyles.getPropertyValue('--text-primary')).toBe('#212121');
        });

        // T006 [P] Animation elimination contract test
        it('should eliminate CSS transitions and animations', () => {
            const compiled = fixture.nativeElement;
            const input = compiled.querySelector('input[formControlName="location"]');

            if (input) {
                const styles = getComputedStyle(input);
                expect(styles.transitionDuration).toBe('0s');
                expect(styles.animationDuration).toBe('0s');
            }

            // Check that ripple effects are disabled
            const rippleElements = compiled.querySelectorAll('.mat-ripple-element');
            rippleElements.forEach((element: Element) => {
                const styles = getComputedStyle(element as HTMLElement);
                expect(styles.display).toBe('none');
            });
        });

        // T007 [P] User interaction integration test - direct form controls
        it('should handle form submission through direct form controls', () => {
            const compiled = fixture.nativeElement;
            spyOn(component, 'onSubmit');

            // MUST trigger onSubmit method directly through form submission
            const form = compiled.querySelector('form');
            expect(form).toBeTruthy();

            // Set valid form data
            component.lootForm.patchValue({
                location: 'Ubersreik tavern',
                wealthLevel: WealthLevel.Common
            });
            fixture.detectChanges();

            // Trigger form submission
            form.dispatchEvent(new Event('ngSubmit'));
            expect(component.onSubmit).toHaveBeenCalled();
        });

        // T007 [P] User interaction integration test (continued)
        it('should handle location input changes through direct FormControl binding', () => {
            const compiled = fixture.nativeElement;
            const locationInput = compiled.querySelector('input[formControlName="location"]');

            if (locationInput) {
                // Simulate user typing
                locationInput.value = 'Altdorf marketplace';
                locationInput.dispatchEvent(new Event('input'));
                fixture.detectChanges();

                // Form control should be updated directly
                expect(component.lootForm.get('location')?.value).toBe('Altdorf marketplace');
            }
        });
    });
});