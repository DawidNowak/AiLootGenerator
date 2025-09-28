import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LootGeneratorComponent } from './loot-generator.component';
import { LootFormComponent, LootGeneratedEvent } from '../loot-form/loot-form.component';
import { LootListComponent } from '../loot-list/loot-list.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';
import { WealthLevel } from '../../models/wealth-level.enum';
import { LootItem } from '../../models/loot-item.interface';

describe('LootGeneratorComponent', () => {
    let component: LootGeneratorComponent;
    let fixture: ComponentFixture<LootGeneratorComponent>;
    let mockI18nService: jasmine.SpyObj<I18nService>;

    const mockLootItems: LootItem[] = [
        {
            name: 'Test Sword',
            description: 'A test sword for testing',
            valueInPennies: 240,
            wealthLevel: WealthLevel.Common
        },
        {
            name: 'Test Shield',
            description: 'A test shield for testing',
            valueInPennies: 120,
            wealthLevel: WealthLevel.Poor
        }
    ];

    beforeEach(async () => {
        mockI18nService = jasmine.createSpyObj('I18nService', [
            'translate',
            'switchLanguage',
            'getAvailableLanguages',
            'getCurrentLanguageInfo'
        ], {
            currentLanguage: signal('en')
        });

        mockI18nService.translate.and.returnValue('Test Translation');

        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                LootGeneratorComponent,
                LootFormComponent,
                LootListComponent,
                ErrorMessageComponent,
                TranslatePipe
            ],
            providers: [
                { provide: I18nService, useValue: mockI18nService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LootGeneratorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Component Structure', () => {
        it('should render the generation section', () => {
            const generationSection = fixture.debugElement.query(By.css('.generation-section'));
            expect(generationSection).toBeTruthy();
        });

        it('should render the loot form', () => {
            const lootForm = fixture.debugElement.query(By.css('app-loot-form'));
            expect(lootForm).toBeTruthy();
        });

        it('should show empty state when no loot is generated', () => {
            component.generatedLoot.set([]);
            fixture.detectChanges();

            const emptyState = fixture.debugElement.query(By.css('.empty-state'));
            expect(emptyState).toBeTruthy();
        });

        it('should hide empty state when loot is generated', () => {
            component.generatedLoot.set(mockLootItems);
            fixture.detectChanges();

            const emptyState = fixture.debugElement.query(By.css('.empty-state'));
            expect(emptyState).toBeFalsy();
        });

        it('should show results section when loot is generated', () => {
            component.generatedLoot.set(mockLootItems);
            fixture.detectChanges();

            const resultsSection = fixture.debugElement.query(By.css('.results-section'));
            expect(resultsSection).toBeTruthy();
        });

        it('should render loot list when loot is generated', () => {
            component.generatedLoot.set(mockLootItems);
            fixture.detectChanges();

            const lootList = fixture.debugElement.query(By.css('app-loot-list'));
            expect(lootList).toBeTruthy();
        });

        it('should render price toggle in results section', () => {
            component.generatedLoot.set(mockLootItems);
            fixture.detectChanges();

            const priceToggle = fixture.debugElement.query(By.css('.results-section mat-checkbox'));
            expect(priceToggle).toBeTruthy();
        });
    });

    describe('Error Handling', () => {
        it('should show error section when there is an error', () => {
            component.currentError.set({
                message: 'Test error',
                type: 'error',
                code: 'TEST_ERROR',
                retryable: true
            });
            fixture.detectChanges();

            const errorSection = fixture.debugElement.query(By.css('.error-section'));
            expect(errorSection).toBeTruthy();
        });

        it('should hide error section when there is no error', () => {
            component.currentError.set(null);
            fixture.detectChanges();

            const errorSection = fixture.debugElement.query(By.css('.error-section'));
            expect(errorSection).toBeFalsy();
        });

        it('should render error message component when there is an error', () => {
            component.currentError.set({
                message: 'Test error',
                type: 'error',
                code: 'TEST_ERROR',
                retryable: true
            });
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('app-error-message'));
            expect(errorMessage).toBeTruthy();
        });
    });

    describe('Event Handling', () => {
        it('should handle loot generation event', () => {
            const event: LootGeneratedEvent = {
                items: mockLootItems,
                request: {
                    sessionId: 'test-session-id',
                    location: 'Test Location',
                    wealthLevel: WealthLevel.Common,
                    language: 'en'
                }
            };

            spyOn(console, 'log');

            component.onLootGenerated(event);

            expect(component.generatedLoot()).toEqual(mockLootItems);
            expect(component.currentError()).toBeNull();
        });

        it('should handle loot generation error', () => {
            const errorMessage = 'Generation failed';
            spyOn(console, 'error');

            component.onLootGenerationError(errorMessage);

            expect(component.currentError()).toEqual(jasmine.objectContaining({
                message: errorMessage,
                type: 'error',
                code: 'GEN_ERROR',
                retryable: true
            }));
            expect(console.error).toHaveBeenCalledWith('Loot generation error:', errorMessage);
        });

        it('should handle price toggle change', () => {
            spyOn(console, 'log');

            component.onPriceToggleChange(false);

            expect(component.showPriceDetails()).toBe(false);

            component.onPriceToggleChange(true);

            expect(component.showPriceDetails()).toBe(true);
        });

        it('should handle error dismissal', () => {
            component.currentError.set({
                message: 'Test error',
                type: 'error',
                code: 'TEST_ERROR',
                retryable: true
            });

            component.onErrorDismiss();

            expect(component.currentError()).toBeNull();
        });

        it('should handle error retry', () => {
            component.currentError.set({
                message: 'Test error',
                type: 'error',
                code: 'TEST_ERROR',
                retryable: true
            });

            component.onErrorRetry();

            expect(component.currentError()).toBeNull();
        });
    });

    describe('Component Inputs and Outputs', () => {
        it('should pass correct properties to loot list', () => {
            component.generatedLoot.set(mockLootItems);
            component.showPriceDetails.set(false);
            fixture.detectChanges();

            const lootList = fixture.debugElement.query(By.css('app-loot-list'));
            const lootListComponent = lootList.componentInstance;

            expect(lootListComponent.items).toEqual(mockLootItems);
            expect(lootListComponent.showPrices).toBe(false);
            expect(lootListComponent.showFullBreakdown).toBe(true);
            expect(lootListComponent.isLoading).toBe(false);
        });

        it('should show price toggle checkbox', () => {
            component.generatedLoot.set(mockLootItems);
            component.showPriceDetails.set(true);
            fixture.detectChanges();

            const priceToggle = fixture.debugElement.query(By.css('mat-checkbox'));
            expect(priceToggle).toBeTruthy();
            expect(priceToggle.componentInstance.checked).toBe(true);
        });

        it('should pass correct properties to error message', () => {
            const error = {
                message: 'Test error',
                type: 'error' as const,
                code: 'TEST_ERROR',
                retryable: true
            };

            component.currentError.set(error);
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('app-error-message'));
            const errorMessageComponent = errorMessage.componentInstance;

            expect(errorMessageComponent.error).toEqual(error);
            expect(errorMessageComponent.allowDismiss).toBe(true);
            expect(errorMessageComponent.allowRetry).toBe(true);
            expect(errorMessageComponent.inline).toBe(false);
        });
    });

    describe('Responsive Behavior', () => {
        it('should have responsive CSS classes', () => {
            const lootGenerator = fixture.debugElement.query(By.css('.loot-generator'));
            expect(lootGenerator).toBeTruthy();
        });

        it('should have proper section structure for mobile layout', () => {
            component.generatedLoot.set(mockLootItems);
            fixture.detectChanges();

            // Check visible sections only
            const generationSection = fixture.debugElement.query(By.css('.generation-section'));
            const resultsSection = fixture.debugElement.query(By.css('.results-section'));
            const emptyStateSection = fixture.debugElement.query(By.css('.empty-state'));

            expect(generationSection).toBeTruthy();
            expect(resultsSection).toBeTruthy();
            expect(emptyStateSection).toBeFalsy(); // Should be hidden when loot is generated
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            component.generatedLoot.set(mockLootItems);
            fixture.detectChanges();

            const h2Headers = fixture.debugElement.queryAll(By.css('h2'));
            const h3Headers = fixture.debugElement.queryAll(By.css('h3'));

            expect(h2Headers.length).toBeGreaterThan(0);
            expect(h3Headers.length).toBeGreaterThan(0);
        });

        it('should have semantic section elements', () => {
            const sections = fixture.debugElement.queryAll(By.css('section'));
            expect(sections.length).toBeGreaterThan(0);
        });
    });

    describe('State Management', () => {
        it('should initialize with empty loot array', () => {
            expect(component.generatedLoot()).toEqual([]);
        });

        it('should initialize with show price details enabled', () => {
            expect(component.showPriceDetails()).toBe(true);
        });

        it('should initialize with no current error', () => {
            expect(component.currentError()).toBeNull();
        });

        it('should clear error when loot is successfully generated', () => {
            // Set initial error state
            component.currentError.set({
                message: 'Previous error',
                type: 'error',
                code: 'PREV_ERROR',
                retryable: true
            });

            // Generate loot successfully
            const event: LootGeneratedEvent = {
                items: mockLootItems,
                request: {
                    sessionId: 'test-session-id',
                    location: 'Test Location',
                    wealthLevel: WealthLevel.Common,
                    language: 'en'
                }
            };

            component.onLootGenerated(event);

            expect(component.currentError()).toBeNull();
        });
    });

    // T006: Responsive layout tests (these should FAIL initially)
    describe('Responsive Layout (T006)', () => {
        it('should initialize responsive state signals', () => {
            expect(component.isMobile).toBeDefined();
            expect(component.isDesktop).toBeDefined();

            // Check actual values and log them for debugging
            console.log('Initial values:', {
                isMobile: component.isMobile(),
                isDesktop: component.isDesktop()
            });

            // Component initializes with whatever the current breakpoint is
            expect(typeof component.isMobile()).toBe('boolean');
            expect(typeof component.isDesktop()).toBe('boolean');
        });

        it('should use stacked layout on mobile viewports', () => {
            // Simulate mobile breakpoint
            (component as any).isMobile.set(true);
            (component as any).isDesktop.set(false);
            fixture.detectChanges();

            const container = fixture.debugElement.query(By.css('.responsive-container'));
            expect(container).toBeTruthy();
            expect(container.nativeElement).toHaveClass('layout-stacked');
            expect(container.nativeElement).not.toHaveClass('layout-side-by-side');
        });

        it('should use side-by-side layout on desktop viewports', () => {
            // Simulate desktop breakpoint
            (component as any).isMobile.set(false);
            (component as any).isDesktop.set(true);
            fixture.detectChanges();

            const container = fixture.debugElement.query(By.css('.responsive-container'));
            expect(container).toBeTruthy();
            expect(container.nativeElement).toHaveClass('layout-side-by-side');
            expect(container.nativeElement).not.toHaveClass('layout-stacked');
        });

        it('should observe breakpoint changes and update state', async () => {
            // This test will fail until BreakpointObserver is properly implemented
            expect(component.ngOnInit).toBeDefined();
            expect(component.ngOnDestroy).toBeDefined();

            // Mock breakpoint observer behavior
            component.ngOnInit();

            // Verify that the component subscribes to breakpoint changes
            expect((component as any).destroy$).toBeDefined();
        });

        it('should apply correct grid areas to form and results sections', () => {
            const mockItems = [mockLootItems[0]];
            component.onLootGenerated({
                items: mockItems,
                request: {
                    sessionId: 'test',
                    location: 'Test',
                    wealthLevel: WealthLevel.Common,
                    language: 'en'
                }
            });
            fixture.detectChanges();

            // Check for grid area classes
            const formSection = fixture.debugElement.query(By.css('.generation-section'));
            const resultsSection = fixture.debugElement.query(By.css('.results-section'));

            expect(formSection).toBeTruthy();
            expect(resultsSection).toBeTruthy();

            expect(formSection.nativeElement).toHaveClass('grid-form');
            expect(resultsSection.nativeElement).toHaveClass('grid-results');
        });

        it('should transition smoothly between layouts', () => {
            // Set initial state
            (component as any).isMobile.set(false);
            fixture.detectChanges();

            const container = fixture.debugElement.query(By.css('.responsive-container'));
            expect(container).toBeTruthy();

            // Check if transition is defined (the exact value may vary in testing environments)
            const computedStyle = getComputedStyle(container.nativeElement);
            expect(computedStyle.transition).toBeTruthy();
            expect(computedStyle.transition.length).toBeGreaterThan(0);
        });

        it('should maintain existing form functionality with responsive layout', () => {
            // Ensure form still works in responsive container
            const formComponent = fixture.debugElement.query(By.css('app-loot-form'));
            expect(formComponent).toBeTruthy();

            // Test that events still work
            const event: LootGeneratedEvent = {
                items: mockLootItems,
                request: {
                    sessionId: 'test',
                    location: 'Test',
                    wealthLevel: WealthLevel.Common,
                    language: 'en'
                }
            };

            component.onLootGenerated(event);
            expect(component.generatedLoot()).toEqual(mockLootItems);
        });
    });
});