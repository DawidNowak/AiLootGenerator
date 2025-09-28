import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { LootGeneratorComponent } from './loot-generator.component';
import { I18nService } from '../../services/i18n.service';
import { WealthLevel } from '../../models/wealth-level.enum';
import { LootItem } from '../../models/loot-item.interface';

// T008: Responsive behavior integration tests (these should FAIL initially)
describe('LootGeneratorComponent - Responsive Integration (T008)', () => {
    let component: LootGeneratorComponent;
    let fixture: ComponentFixture<LootGeneratorComponent>;
    let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;
    let mockI18nService: jasmine.SpyObj<I18nService>;

    const mockLootItems: LootItem[] = [
        {
            name: 'Test Sword',
            description: 'A test sword for responsive testing',
            valueInPennies: 240,
            wealthLevel: WealthLevel.Common
        },
        {
            name: 'Test Shield',
            description: 'A test shield for responsive testing',
            valueInPennies: 120,
            wealthLevel: WealthLevel.Poor
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

        mockI18nService.translate.and.returnValue('Test Translation');

        // Create Platform mock
        const mockPlatform = jasmine.createSpyObj('Platform', [], {
            isBrowser: true,
            isAndroid: false,
            isIOS: false
        });

        await TestBed.configureTestingModule({
            imports: [
                LootGeneratorComponent,
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

        fixture = TestBed.createComponent(LootGeneratorComponent);
        component = fixture.componentInstance;
    });

    it('should initialize with desktop layout by default', () => {
        // Mock desktop breakpoint
        mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));

        component.ngOnInit();
        fixture.detectChanges();

        // Will fail until responsive state is properly implemented
        expect(component.isMobile()).toBe(false);
        expect(component.isDesktop()).toBe(true);
    });

    it('should switch to mobile layout when breakpoint matches', () => {
        // Mock mobile breakpoint
        mockBreakpointObserver.observe.and.returnValue(of({ matches: true, breakpoints: {} }));

        component.ngOnInit();
        fixture.detectChanges();

        // Will fail until responsive state is properly implemented
        expect(component.isMobile()).toBe(true);
        expect(component.isDesktop()).toBe(false);
    });

    it('should maintain layout consistency during loot generation', () => {
        // Start with mobile layout
        mockBreakpointObserver.observe.and.returnValue(of({ matches: true, breakpoints: {} }));
        component.ngOnInit();
        fixture.detectChanges();

        // Generate loot
        const event = {
            items: mockLootItems,
            request: {
                sessionId: 'test',
                location: 'Test Location',
                wealthLevel: WealthLevel.Common,
                language: 'en'
            }
        };

        component.onLootGenerated(event);
        fixture.detectChanges();

        // Layout should remain mobile even after loot generation
        expect(component.isMobile()).toBe(true);
        expect(component.generatedLoot()).toEqual(mockLootItems);
    });

    it('should handle breakpoint transitions smoothly', () => {
        // Start desktop
        let breakpointSubject = of({ matches: false, breakpoints: {} });
        mockBreakpointObserver.observe.and.returnValue(breakpointSubject);

        component.ngOnInit();
        fixture.detectChanges();

        expect(component.isDesktop()).toBe(true);

        // Switch to mobile
        breakpointSubject = of({ matches: true, breakpoints: {} });
        mockBreakpointObserver.observe.and.returnValue(breakpointSubject);

        // Simulate breakpoint change
        component.ngOnInit(); // Re-initialize to trigger new subscription
        fixture.detectChanges();

        // Will fail until smooth transitions are implemented
        expect(component.isMobile()).toBe(true);
    });

    it('should apply responsive container classes based on breakpoint', () => {
        // Test desktop layout
        mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));
        component.ngOnInit();
        fixture.detectChanges();

        // Will fail until template includes responsive container
        const container = fixture.nativeElement.querySelector('.responsive-container');
        expect(container).toBeTruthy();

        // Test mobile layout
        mockBreakpointObserver.observe.and.returnValue(of({ matches: true, breakpoints: {} }));
        component.ngOnInit();
        fixture.detectChanges();

        // Container should still exist but with different layout
        const mobileContainer = fixture.nativeElement.querySelector('.responsive-container');
        expect(mobileContainer).toBeTruthy();
    });

    it('should preserve form functionality across layout changes', () => {
        // Generate loot in desktop mode
        mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));
        component.ngOnInit();
        fixture.detectChanges();

        const event = {
            items: mockLootItems,
            request: {
                sessionId: 'test',
                location: 'Test Location',
                wealthLevel: WealthLevel.Common,
                language: 'en'
            }
        };

        component.onLootGenerated(event);
        expect(component.generatedLoot()).toEqual(mockLootItems);

        // Switch to mobile
        mockBreakpointObserver.observe.and.returnValue(of({ matches: true, breakpoints: {} }));
        component.ngOnInit();
        fixture.detectChanges();

        // Loot should still be there and form should still work
        expect(component.generatedLoot()).toEqual(mockLootItems);

        // Test error handling still works
        component.onLootGenerationError('Test error');
        expect(component.currentError()).toBeTruthy();
    });

    it('should handle rapid breakpoint changes gracefully', () => {
        // Simulate rapid changes
        const breakpointChanges = [
            { matches: false, breakpoints: {} }, // Desktop
            { matches: true, breakpoints: {} },  // Mobile
            { matches: false, breakpoints: {} }, // Desktop again
        ];

        breakpointChanges.forEach((breakpoint, index) => {
            mockBreakpointObserver.observe.and.returnValue(of(breakpoint));
            component.ngOnInit();
            fixture.detectChanges();

            // Should handle rapid changes without errors
            expect(component.isMobile()).toBe(breakpoint.matches);
            expect(component.isDesktop()).toBe(!breakpoint.matches);
        });
    });

    it('should cleanup subscriptions on destroy', () => {
        mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));
        component.ngOnInit();

        // Should have active subscription
        expect((component as any).destroy$).toBeDefined();

        // Destroy component
        component.ngOnDestroy();

        // Should cleanup properly - will fail until ngOnDestroy is implemented
        expect((component as any).destroy$.closed).toBe(true);
    });
});