import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LootGeneratorComponent } from './components/loot-generator/loot-generator.component';
import { LootListComponent } from './components/loot-list/loot-list.component';
import { I18nService } from './services/i18n.service';
import { WealthLevel } from './models/wealth-level.enum';
import { LootItem } from './models/loot-item.interface';

// T009: Cross-component layout integration tests (these should FAIL initially)
describe('App Integration - Cross-Component Layout (T009)', () => {
    let appComponent: AppComponent;
    let appFixture: ComponentFixture<AppComponent>;
    let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;
    let mockI18nService: jasmine.SpyObj<I18nService>;

    const mockLootItems: LootItem[] = [
        {
            name: 'Integration Test Sword',
            description: 'A sword for testing cross-component integration',
            valueInPennies: 300,
            wealthLevel: WealthLevel.Common
        },
        {
            name: 'Integration Test Armor',
            description: 'Armor for testing responsive layout integration',
            valueInPennies: 500,
            wealthLevel: WealthLevel.Wealthy
        }
    ];

    beforeEach(async () => {
        mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe']);
        mockI18nService = jasmine.createSpyObj('I18nService', [
            'translate',
            'switchLanguage',
            'getAvailableLanguages',
            'getCurrentLanguageInfo'
        ], {
            currentLanguage: signal('en')
        });

        // Setup default BreakpointObserver mock (desktop by default)
        mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));

        // Create Platform mock
        const mockPlatform = jasmine.createSpyObj('Platform', [], {
            isBrowser: true,
            isAndroid: false,
            isIOS: false
        });

        // Setup translations
        mockI18nService.translate.and.callFake((key: string) => {
            const translations: Record<string, string> = {
                'app.title': 'AI Loot Generator',
                'app.subtitle': 'Warhammer Fantasy Edition',
                'app.description': 'Generate legendary treasures and magical artifacts',
                'loot.generation.title': 'Generate Loot',
                'loot.generation.description': 'Create thematic items',
                'loot.generated.title': 'Generated Loot',
                'loot.empty.title': 'No loot generated yet',
                'loot.empty.description': 'Click Generate Loot to create items',
                'loot.list.title': 'Generated Items',
                'wealth.label': 'Wealth Level'
            };
            return translations[key] || key;
        });

        mockI18nService.getAvailableLanguages.and.returnValue([
            { code: 'en', label: 'English', translations: {} }
        ]);
        mockI18nService.getCurrentLanguageInfo.and.returnValue({
            code: 'en', label: 'English', translations: {}
        });

        await TestBed.configureTestingModule({
            imports: [
                AppComponent,
                HttpClientTestingModule,
                NoopAnimationsModule
            ],
            providers: [
                { provide: BreakpointObserver, useValue: mockBreakpointObserver },
                { provide: I18nService, useValue: mockI18nService },
                { provide: Platform, useValue: mockPlatform },
                {
                    provide: DOCUMENT,
                    useValue: {
                        addEventListener: jasmine.createSpy('addEventListener'),
                        removeEventListener: jasmine.createSpy('removeEventListener'),
                        querySelectorAll: () => [],
                        body: { 
                            style: {},
                            classList: {
                                add: jasmine.createSpy('add'),
                                remove: jasmine.createSpy('remove'),
                                contains: jasmine.createSpy('contains').and.returnValue(false)
                            }
                        }
                    }
                }
            ]
        }).compileComponents();

        appFixture = TestBed.createComponent(AppComponent);
        appComponent = appFixture.componentInstance;

        // Default to desktop layout
        mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));
    });

    it('should maintain header visibility with responsive loot generator layout', () => {
        appFixture.detectChanges();

        // Check header is present
        const header = appFixture.debugElement.query(By.css('.app-header'));
        expect(header).toBeTruthy();

        // Check loot generator is present
        const lootGenerator = appFixture.debugElement.query(By.css('app-loot-generator'));
        expect(lootGenerator).toBeTruthy();

        // Will fail until header visibility issues are fixed
        const headerElement = header.nativeElement as HTMLElement;
        const computedStyle = getComputedStyle(headerElement);
        expect(computedStyle.visibility).not.toBe('hidden');
        expect(computedStyle.display).not.toBe('none');
    });

    it('should coordinate desktop layout between generator and list components', () => {
        // Desktop breakpoint
        mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));
        appFixture.detectChanges();

        const lootGenerator = appFixture.debugElement.query(By.directive(LootGeneratorComponent));
        expect(lootGenerator).toBeTruthy();

        const generatorComponent = lootGenerator.componentInstance as LootGeneratorComponent;

        // Will fail until responsive layout is implemented
        expect(generatorComponent.isDesktop()).toBe(true);
        expect(generatorComponent.isMobile()).toBe(false);

        // Check for responsive container in template
        const responsiveContainer = appFixture.debugElement.query(By.css('.responsive-container'));
        expect(responsiveContainer).toBeTruthy(); // Will fail until template is updated
    });

    it('should coordinate mobile layout between generator and list components', () => {
        // Mobile breakpoint
        mockBreakpointObserver.observe.and.returnValue(of({ matches: true, breakpoints: {} }));
        appFixture.detectChanges();

        const lootGenerator = appFixture.debugElement.query(By.directive(LootGeneratorComponent));
        const generatorComponent = lootGenerator.componentInstance as LootGeneratorComponent;

        // Will fail until responsive layout is implemented
        expect(generatorComponent.isMobile()).toBe(true);
        expect(generatorComponent.isDesktop()).toBe(false);

        // Check layout switches to stacked
        const responsiveContainer = appFixture.debugElement.query(By.css('.responsive-container'));
        if (responsiveContainer) {
            // In test environment, we check for layout classes rather than computed styles
            expect(responsiveContainer.nativeElement).toHaveClass('layout-stacked');
            expect(responsiveContainer.nativeElement).not.toHaveClass('layout-side-by-side');
        }
    });

    it('should maintain proper spacing between header and generator content', () => {
        appFixture.detectChanges();

        const header = appFixture.debugElement.query(By.css('.app-header'));
        const mainContent = appFixture.debugElement.query(By.css('.main-content'));

        expect(header).toBeTruthy();
        expect(mainContent).toBeTruthy();

        // Will fail until proper spacing is ensured
        const headerElement = header.nativeElement as HTMLElement;
        const mainElement = mainContent.nativeElement as HTMLElement;

        const headerBottom = headerElement.getBoundingClientRect().bottom;
        const mainTop = mainElement.getBoundingClientRect().top;

        // Should have some spacing between header and main content
        expect(mainTop).toBeGreaterThanOrEqual(headerBottom);
    });

    it('should handle loot generation with proper layout coordination', () => {
        appFixture.detectChanges();

        const lootGenerator = appFixture.debugElement.query(By.directive(LootGeneratorComponent));
        const generatorComponent = lootGenerator.componentInstance as LootGeneratorComponent;

        // Simulate loot generation
        const event = {
            items: mockLootItems,
            request: {
                sessionId: 'integration-test',
                location: 'Test Location',
                wealthLevel: WealthLevel.Common,
                language: 'en'
            }
        };

        generatorComponent.onLootGenerated(event);
        appFixture.detectChanges();

        // Check that loot list appears with proper layout
        const resultsSection = appFixture.debugElement.query(By.css('.results-section'));
        expect(resultsSection).toBeTruthy();

        // Will fail until list layout is implemented
        const lootList = appFixture.debugElement.query(By.directive(LootListComponent));
        expect(lootList).toBeTruthy();

        const listComponent = lootList.componentInstance as LootListComponent;
        expect(listComponent.items).toEqual(mockLootItems);
    });

    it('should preserve all functionality during responsive transitions', () => {
        appFixture.detectChanges();

        const lootGenerator = appFixture.debugElement.query(By.directive(LootGeneratorComponent));
        const generatorComponent = lootGenerator.componentInstance as LootGeneratorComponent;

        // Start with desktop
        mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));
        generatorComponent.ngOnInit();
        appFixture.detectChanges();

        // Generate loot
        const event = {
            items: mockLootItems,
            request: {
                sessionId: 'transition-test',
                location: 'Test Location',
                wealthLevel: WealthLevel.Common,
                language: 'en'
            }
        };

        generatorComponent.onLootGenerated(event);
        appFixture.detectChanges();

        expect(generatorComponent.generatedLoot()).toEqual(mockLootItems);

        // Switch to mobile
        mockBreakpointObserver.observe.and.returnValue(of({ matches: true, breakpoints: {} }));
        generatorComponent.ngOnInit();
        appFixture.detectChanges();

        // Functionality should still work
        expect(generatorComponent.generatedLoot()).toEqual(mockLootItems);
        expect(generatorComponent.isMobile()).toBe(true);
    });

    it('should maintain accessibility across all layout changes', () => {
        appFixture.detectChanges();

        // Check header accessibility
        const header = appFixture.debugElement.query(By.css('.app-header'));
        const title = appFixture.debugElement.query(By.css('.app-title'));

        expect(header).toBeTruthy();
        expect(title).toBeTruthy();

        // Should maintain proper heading hierarchy
        const titleElement = title.nativeElement as HTMLElement;
        expect(titleElement.tagName.toLowerCase()).toBe('h1');

        // Check that responsive changes don't break accessibility
        mockBreakpointObserver.observe.and.returnValue(of({ matches: true, breakpoints: {} }));
        appFixture.detectChanges();

        // Accessibility should still be maintained
        const mobileTitle = appFixture.debugElement.query(By.css('.app-title'));
        expect(mobileTitle.nativeElement.tagName.toLowerCase()).toBe('h1');
    });

    it('should handle error states properly across components', () => {
        appFixture.detectChanges();

        const lootGenerator = appFixture.debugElement.query(By.directive(LootGeneratorComponent));
        const generatorComponent = lootGenerator.componentInstance as LootGeneratorComponent;

        // Simulate error
        generatorComponent.onLootGenerationError('Integration test error');
        appFixture.detectChanges();

        // Error should be displayed properly
        const errorSection = appFixture.debugElement.query(By.css('.error-section'));
        expect(errorSection).toBeTruthy(); // Will fail until error display is properly integrated

        // Layout should still be maintained during error state
        const header = appFixture.debugElement.query(By.css('.app-header'));
        expect(header).toBeTruthy();
    });
});