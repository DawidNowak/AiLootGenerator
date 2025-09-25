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

        it('should handle location changes', () => {
            const testLocation = 'Test Location';
            component.onLocationChange(testLocation);

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
});