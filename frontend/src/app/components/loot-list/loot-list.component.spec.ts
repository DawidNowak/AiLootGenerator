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
import { LootItemComponent } from '../loot-item/loot-item.component';

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
            'loot.list.summary': params ? `${params.count} items generated` : 'Items generated'
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
                LootItemComponent,
                NoopAnimationsModule
            ],
            providers: [
                { provide: I18nService, useValue: mockI18nService },
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
            const loadingIcon = fixture.debugElement.query(By.css('.loading'));

            expect(loadingState).toBeTruthy();
            expect(loadingIcon).toBeTruthy();
            expect(loadingIcon.classes['loading']).toBeTruthy();
        });

        it('should render loot items grid when items exist', () => {
            component.items = sampleLootItems;
            component.isLoading = false;
            fixture.detectChanges();

            const itemsGrid = fixture.debugElement.query(By.css('.loot-items-grid'));
            const lootItems = fixture.debugElement.queryAll(By.directive(LootItemComponent));

            expect(itemsGrid).toBeTruthy();
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
            const summaryCard = fixture.debugElement.query(By.css('.summary-card'));

            expect(summary).toBeTruthy();
            expect(summaryCard).toBeTruthy();
        });

        it('should not show list content when loading', () => {
            component.items = sampleLootItems;
            component.isLoading = true;
            fixture.detectChanges();

            const itemsGrid = fixture.debugElement.query(By.css('.loot-items-grid'));
            const listHeader = fixture.debugElement.query(By.css('.list-header'));
            const summary = fixture.debugElement.query(By.css('.results-summary'));

            expect(itemsGrid).toBeFalsy();
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
            imports: [LootListComponent, LootItemComponent, NoopAnimationsModule],
            declarations: [TestHostComponent],
            providers: [
                { provide: I18nService, useValue: mockI18nService },
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

        const lootItemComponents = hostFixture.debugElement.queryAll(By.directive(LootItemComponent));
        expect(lootItemComponents.length).toBe(1);
    });

    it('should handle empty items array', () => {
        hostComponent.testItems = [];
        hostFixture.detectChanges();

        const emptyState = hostFixture.debugElement.query(By.css('.empty-state'));
        const lootItems = hostFixture.debugElement.queryAll(By.directive(LootItemComponent));

        expect(emptyState).toBeTruthy();
        expect(lootItems.length).toBe(0);
    });

    it('should show loading state when isLoading is true', () => {
        hostComponent.testIsLoading = true;
        hostFixture.detectChanges();

        const loadingState = hostFixture.debugElement.query(By.css('.empty-state'));
        const loadingIcon = hostFixture.debugElement.query(By.css('.loading'));

        expect(loadingState).toBeTruthy();
        expect(loadingIcon).toBeTruthy();
    });

    it('should pass showPrices property to loot item components', () => {
        hostComponent.testItems = sampleLootItems.slice(0, 1);
        hostComponent.testShowPrices = false;
        hostFixture.detectChanges();

        const lootItemComponent = hostFixture.debugElement.query(By.directive(LootItemComponent));
        expect(lootItemComponent.componentInstance.showPrice).toBe(false);
    });

    it('should pass showFullBreakdown property to loot item components', () => {
        hostComponent.testItems = sampleLootItems.slice(0, 1);
        hostComponent.testShowFullBreakdown = true;
        hostFixture.detectChanges();

        const lootItemComponent = hostFixture.debugElement.query(By.directive(LootItemComponent));
        expect(lootItemComponent.componentInstance.showFullBreakdown).toBe(true);
    });
});