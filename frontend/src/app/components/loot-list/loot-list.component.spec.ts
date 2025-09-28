import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { LootListComponent } from './loot-list.component';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LootItem } from '../../models/loot-item.interface';
import { WealthLevel } from '../../models/wealth-level.enum';
import { CurrencyService } from '../../services/currency.service';

// Mock I18n Service
class MockI18nService {
    private currentLanguageSignal = signal('en');

    currentLanguage = this.currentLanguageSignal.asReadonly();

    setLanguage(code: string): void {
        this.currentLanguageSignal.set(code);
    }

    translate(key: string, params?: any): string {
        const translations: { [key: string]: string } = {
            'loot.list.title': 'Generated Loot',
            'loot.list.loading': 'Generating loot items...',
            'loot.list.empty': 'No loot items generated yet',
            'loot.list.emptyHint': 'Click the "Generate Loot" button to create thematic items',
        };
        return translations[key] || key;
    }
}

// Mock Translate Pipe
class MockTranslatePipe {
    transform(key: string, params?: any): string {
        const mockI18n = new MockI18nService();
        return mockI18n.translate(key, params);
    }
}

// Mock Currency Service
class MockCurrencyService {
    formatCurrency(valueInPennies: number, options?: any): string {
        const gold = Math.floor(valueInPennies / 240);
        const silver = Math.floor((valueInPennies % 240) / 12);
        const pennies = valueInPennies % 12;

        let result = '';
        if (gold > 0) result += `${gold}g `;
        if (silver > 0) result += `${silver}s `;
        if (pennies > 0) result += `${pennies}p`;

        return result.trim() || '0p';
    }
}

// Test Host Component to test Input bindings
@Component({
    template: `
        <app-loot-list
            [items]="testItems"
            [isLoading]="testIsLoading"
            [showPrices]="testShowPrices"
            [showFullBreakdown]="testShowFullBreakdown">
        </app-loot-list>
    `
})
class TestHostComponent {
    testItems: LootItem[] = [];
    testIsLoading = false;
    testShowPrices = true;
    testShowFullBreakdown = false;
}

describe('LootListComponent', () => {
    let component: LootListComponent;
    let fixture: ComponentFixture<LootListComponent>;
    let mockI18nService: MockI18nService;

    // Sample test data
    const sampleLootItems: LootItem[] = [
        {
            name: 'Jungfreud Tabard',
            description: 'A well-maintained cloth tabard bearing the heraldry of House Jungfreud',
            valueInPennies: 60,
            wealthLevel: WealthLevel.Poor
        },
        {
            name: 'Iron-bound Training Shield',
            description: 'A practice shield showing wear from countless drills',
            valueInPennies: 36,
            wealthLevel: WealthLevel.Poor
        },
        {
            name: 'Noble\'s Signet Ring',
            description: 'An ornate gold ring bearing an ancient family crest',
            valueInPennies: 1500,
            wealthLevel: WealthLevel.Noble
        }
    ];

    beforeEach(async () => {
        mockI18nService = new MockI18nService();

        await TestBed.configureTestingModule({
            imports: [
                LootListComponent,
                NoopAnimationsModule
            ],
            providers: [
                { provide: I18nService, useValue: mockI18nService },
                { provide: CurrencyService, useClass: MockCurrencyService },
                { provide: TranslatePipe, useClass: MockTranslatePipe }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LootListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with default values', () => {
            expect(component.items).toEqual([]);
            expect(component.isLoading).toBe(false);
            expect(component.showPrices).toBe(true);
            expect(component.showFullBreakdown).toBe(false);
        });

        it('should have computed properties initialized', () => {
            expect(component.currentLanguage).toBeDefined();
            expect(component.hasItems).toBeDefined();
            expect(component.itemCount).toBeDefined();
        });
    });

    describe('Computed Properties', () => {
        it('should compute hasItems correctly', () => {
            expect(component.hasItems()).toBe(false);

            component.items = sampleLootItems;
            fixture.detectChanges();

            expect(component.hasItems()).toBe(true);
        });

        it('should compute itemCount correctly', () => {
            expect(component.itemCount()).toBe(0);

            component.items = sampleLootItems;
            fixture.detectChanges();

            expect(component.itemCount()).toBe(3);

            component.items = sampleLootItems.slice(0, 1);
            fixture.detectChanges();

            expect(component.itemCount()).toBe(1);
        });

        it('should handle null items array', () => {
            component.items = null as any;
            fixture.detectChanges();

            expect(component.hasItems()).toBe(false);
            expect(component.itemCount()).toBe(0);
        });
    });

    describe('Template Rendering', () => {
        it('should show empty state when no items and not loading', () => {
            component.items = [];
            component.isLoading = false;
            fixture.detectChanges();

            const emptyState = fixture.debugElement.query(By.css('.empty-state'));
            const emptyMessage = fixture.debugElement.query(By.css('.empty-state-message'));

            expect(emptyState).toBeTruthy();
            expect(emptyMessage).toBeTruthy();
        });

        it('should show loading state when isLoading is true', () => {
            component.isLoading = true;
            fixture.detectChanges();

            const loadingState = fixture.debugElement.query(By.css('.empty-state'));
            const loadingBar = fixture.debugElement.query(By.css('.loading-bar'));

            expect(loadingState).toBeTruthy();
            expect(loadingBar).toBeTruthy();
        });

        it('should render loot items list when items exist', () => {
            component.items = sampleLootItems;
            component.isLoading = false;
            fixture.detectChanges();

            const itemsList = fixture.debugElement.query(By.css('.loot-items-list'));
            const lootItems = fixture.debugElement.queryAll(By.css('mat-list-item'));

            expect(itemsList).toBeTruthy();
            expect(lootItems.length).toBe(3);
        });

        it('should show list header when items exist', () => {
            component.items = sampleLootItems;
            component.isLoading = false;
            fixture.detectChanges();

            const listHeader = fixture.debugElement.query(By.css('.list-header'));
            const listTitle = fixture.debugElement.query(By.css('.list-title'));

            expect(listHeader).toBeTruthy();
            expect(listTitle).toBeTruthy();
        });

        it('should show results summary when items exist', () => {
            component.items = sampleLootItems;
            component.isLoading = false;
            fixture.detectChanges();

            const summary = fixture.debugElement.query(By.css('.results-summary'));
            const summaryText = fixture.debugElement.query(By.css('.summary-text'));

            expect(summary).toBeTruthy();
            expect(summaryText).toBeTruthy();
        });

        it('should not show list content when loading', () => {
            component.items = sampleLootItems;
            component.isLoading = true;
            fixture.detectChanges();

            const itemsList = fixture.debugElement.query(By.css('.loot-items-list'));
            const listHeader = fixture.debugElement.query(By.css('.list-header'));
            const summary = fixture.debugElement.query(By.css('.results-summary'));

            expect(itemsList).toBeFalsy();
            expect(listHeader).toBeFalsy();
            expect(summary).toBeFalsy();
        });
    });

    describe('Component Methods', () => {
        describe('trackByIndex', () => {
            it('should return the index for tracking', () => {
                const index = 2;
                const item = sampleLootItems[0];

                const result = component.trackByIndex(index, item);

                expect(result).toBe(index);
            });
        });

        describe('getEmptyStateMessage', () => {
            it('should return loading message when loading', () => {
                component.isLoading = true;

                const message = component.getEmptyStateMessage();

                expect(message).toBe('loot.list.loading');
            });

            it('should return empty message when not loading', () => {
                component.isLoading = false;

                const message = component.getEmptyStateMessage();

                expect(message).toBe('loot.list.empty');
            });
        });

        describe('getEmptyStateIcon', () => {
            it('should return hourglass icon when loading', () => {
                component.isLoading = true;

                const icon = component.getEmptyStateIcon();

                expect(icon).toBe('hourglass_empty');
            });

            it('should return inventory icon when not loading', () => {
                component.isLoading = false;

                const icon = component.getEmptyStateIcon();

                expect(icon).toBe('inventory_2');
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading structure', () => {
            component.items = sampleLootItems;
            component.isLoading = false;
            fixture.detectChanges();

            const heading = fixture.debugElement.query(By.css('.list-title'));
            expect(heading).toBeTruthy();
            expect(heading.nativeElement.tagName.toLowerCase()).toBe('h3');
        });

        it('should provide meaningful empty state content', () => {
            component.items = [];
            component.isLoading = false;
            fixture.detectChanges();

            const emptyMessage = fixture.debugElement.query(By.css('.empty-state-message'));
            const emptyHint = fixture.debugElement.query(By.css('.empty-state-hint'));

            expect(emptyMessage).toBeTruthy();
            expect(emptyHint).toBeTruthy();
        });
    });

    // T005: List layout tests (these should FAIL initially)
    describe('List Layout (T005)', () => {
        it('should display items in vertical list format instead of grid', () => {
            const mockItems = sampleLootItems.slice(0, 3);
            component.items = mockItems;
            fixture.detectChanges();

            const listContainer = fixture.debugElement.query(By.css('.loot-items-list'));
            expect(listContainer).toBeTruthy();
            expect(listContainer.nativeElement.tagName.toLowerCase()).toBe('mat-list');

            const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
            expect(listItems.length).toBe(3);
        });

        it('should apply list item styling to each loot item', () => {
            const mockItems = sampleLootItems.slice(0, 2);
            component.items = mockItems;
            fixture.detectChanges();

            const itemElements = fixture.debugElement.queryAll(By.css('mat-list-item'));
            expect(itemElements.length).toBe(2);

            itemElements.forEach((element: any) => {
                expect(element.nativeElement.classList.contains('loot-item-light')).toBe(true);
            });
        });

        it('should preserve all item information in list format', () => {
            const mockItem = sampleLootItems[0];
            component.items = [mockItem];
            fixture.detectChanges();

            const itemElement = fixture.debugElement.query(By.css('mat-list-item'));
            expect(itemElement).toBeTruthy();

            const nameElement = itemElement.query(By.css('.item-name'));
            const descriptionElement = itemElement.query(By.css('.item-description'));
            const priceElement = itemElement.query(By.css('.item-price'));

            expect(nameElement.nativeElement.textContent.trim()).toBe(mockItem.name);
            expect(descriptionElement.nativeElement.textContent.trim()).toBe(mockItem.description);
            expect(priceElement).toBeTruthy(); // Price should be shown when showPrices is true
        });

        it('should maintain proper list spacing between items', () => {
            const mockItems = sampleLootItems.slice(0, 3);
            component.items = mockItems;
            fixture.detectChanges();

            const listContainer = fixture.debugElement.query(By.css('.loot-items-list'));
            expect(listContainer).toBeTruthy();

            const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
            expect(listItems.length).toBe(3);
        });

        it('should use semantic list markup for accessibility', () => {
            const mockItems = sampleLootItems.slice(0, 2);
            component.items = mockItems;
            fixture.detectChanges();

            // mat-list automatically provides proper ARIA roles
            const listElement = fixture.debugElement.query(By.css('mat-list'));
            expect(listElement).toBeTruthy();

            const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
            expect(listItems.length).toBe(2);
        });

        it('should preserve loading and empty states in list layout', () => {
            // Test empty state
            component.items = [];
            fixture.detectChanges();

            const emptyState = fixture.debugElement.query(By.css('.empty-state'));
            expect(emptyState).toBeTruthy();

            // Test loading state
            component.isLoading = true;
            fixture.detectChanges();

            const loadingState = fixture.debugElement.query(By.css('.empty-state .loading-bar'));
            expect(loadingState).toBeTruthy();
        });
    });
});

// Separate describe block for Input Properties tests
describe('LootListComponent Input Properties', () => {
    let hostComponent: TestHostComponent;
    let hostFixture: ComponentFixture<TestHostComponent>;
    let mockI18nService: MockI18nService;

    const sampleLootItems: LootItem[] = [
        {
            name: 'Test Item',
            description: 'Test Description',
            valueInPennies: 60,
            wealthLevel: WealthLevel.Poor
        }
    ];

    beforeEach(async () => {
        mockI18nService = new MockI18nService();

        await TestBed.configureTestingModule({
            imports: [LootListComponent, NoopAnimationsModule],
            declarations: [TestHostComponent],
            providers: [
                { provide: I18nService, useValue: mockI18nService },
                { provide: CurrencyService, useClass: MockCurrencyService },
                { provide: TranslatePipe, useClass: MockTranslatePipe }
            ]
        }).compileComponents();

        hostFixture = TestBed.createComponent(TestHostComponent);
        hostComponent = hostFixture.componentInstance;
        hostFixture.detectChanges();
    });

    it('should accept and display loot items', () => {
        hostComponent.testItems = sampleLootItems;
        hostFixture.detectChanges();

        const lootItemElements = hostFixture.debugElement.queryAll(By.css('mat-list-item'));
        expect(lootItemElements.length).toBe(1);
    });

    it('should handle empty items array', () => {
        hostComponent.testItems = [];
        hostFixture.detectChanges();

        const emptyState = hostFixture.debugElement.query(By.css('.empty-state'));
        const lootItems = hostFixture.debugElement.queryAll(By.css('mat-list-item'));

        expect(emptyState).toBeTruthy();
        expect(lootItems.length).toBe(0);
    });

    it('should show loading state when isLoading is true', () => {
        hostComponent.testIsLoading = true;
        hostFixture.detectChanges();

        const loadingState = hostFixture.debugElement.query(By.css('.empty-state'));
        const loadingBar = hostFixture.debugElement.query(By.css('.loading-bar'));

        expect(loadingState).toBeTruthy();
        expect(loadingBar).toBeTruthy();
    });

    it('should pass showPrices property to loot item display', () => {
        hostComponent.testItems = sampleLootItems.slice(0, 1);
        hostComponent.testShowPrices = false;
        hostFixture.detectChanges();

        const priceElement = hostFixture.debugElement.query(By.css('.item-price'));
        expect(priceElement).toBeFalsy(); // Price should not be displayed
    });

    describe('UI Simplification Requirements', () => {
        it('should use mat-list container instead of custom grid', () => {
            hostComponent.testItems = sampleLootItems.slice(0, 2);
            hostFixture.detectChanges();

            // Should find mat-list
            const matList = hostFixture.debugElement.query(By.css('mat-list'));
            expect(matList).toBeTruthy();

            // Should use the correct CSS class
            expect(matList.nativeElement.classList.contains('loot-items-list')).toBe(true);
        });

        it('should have simplified header without decorative icons', () => {
            hostComponent.testItems = sampleLootItems.slice(0, 1);
            hostFixture.detectChanges();

            const headerIcon = hostFixture.debugElement.query(By.css('.list-title mat-icon'));
            expect(headerIcon).toBeFalsy(); // No decorative icons in header
        });

        it('should maintain accessibility with proper mat-list structure', () => {
            hostComponent.testItems = sampleLootItems.slice(0, 2);
            hostFixture.detectChanges();

            const matList = hostFixture.debugElement.query(By.css('mat-list'));
            expect(matList).toBeTruthy();

            // mat-list automatically provides proper accessibility attributes
            const listItems = hostFixture.debugElement.queryAll(By.css('mat-list-item'));
            expect(listItems.length).toBe(2);
        });
    });
});