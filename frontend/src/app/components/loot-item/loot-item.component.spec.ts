import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { LootItemComponent } from './loot-item.component';
import { LootItem } from '../../models/loot-item.interface';
import { WealthLevel } from '../../models/wealth-level.enum';
import { CurrencyService } from '../../services/currency.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

describe('LootItemComponent', () => {
    let component: LootItemComponent;
    let fixture: ComponentFixture<LootItemComponent>;
    let mockCurrencyService: jasmine.SpyObj<CurrencyService>;
    let mockI18nService: jasmine.SpyObj<I18nService>;

    const mockLootItem: LootItem = {
        name: 'Enchanted Sword of Ubersreik',
        description: 'A beautifully crafted longsword with intricate engravings depicting the coat of arms of Ubersreik. The blade gleams with a faint magical aura.',
        valueInPennies: 1440, // 6 gold crowns
        wealthLevel: WealthLevel.Wealthy
    };

    beforeEach(async () => {
        // Create spy objects for dependencies
        mockCurrencyService = jasmine.createSpyObj('CurrencyService', ['formatCurrency']);
        mockI18nService = jasmine.createSpyObj('I18nService', ['translate', 'currentLanguage'], {
            currentLanguage: signal('en')
        });

        // Setup default spy return values
        mockCurrencyService.formatCurrency.and.returnValue('6 GC');
        mockI18nService.translate.and.returnValue('Wealthy');

        await TestBed.configureTestingModule({
            imports: [
                LootItemComponent,
                MatCardModule,
                MatIconModule,
                MatChipsModule,
                MatTooltipModule,
                NoopAnimationsModule,
                TranslatePipe
            ],
            providers: [
                { provide: CurrencyService, useValue: mockCurrencyService },
                { provide: I18nService, useValue: mockI18nService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LootItemComponent);
        component = fixture.componentInstance;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with default values', () => {
            expect(component.item).toBeNull();
            expect(component.showPrice).toBeTrue();
            expect(component.showFullBreakdown).toBeFalse();
        });

        it('should expose WealthLevel enum', () => {
            expect(component.WealthLevel).toBe(WealthLevel);
        });
    });

    describe('Display Logic', () => {
        beforeEach(() => {
            component.item = mockLootItem;
        });

        it('should display item name', () => {
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;
            const titleElement = compiled.querySelector('.item-name');
            expect(titleElement?.textContent?.trim()).toBe('Enchanted Sword of Ubersreik');
        });

        it('should display item description', () => {
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;
            const descriptionElement = compiled.querySelector('.item-description');
            expect(descriptionElement?.textContent?.trim()).toContain('beautifully crafted longsword');
        });

        it('should show price when showPrice is true', () => {
            component.showPrice = true;
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;
            const priceSection = compiled.querySelector('.item-actions');
            expect(priceSection).toBeTruthy();
        });

        it('should hide price when showPrice is false', () => {
            component.showPrice = false;
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;
            const priceSection = compiled.querySelector('.item-actions');
            expect(priceSection).toBeFalsy();
        });

        it('should display placeholder when item is null', () => {
            component.item = null;
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;
            const placeholderCard = compiled.querySelector('.loot-item-placeholder');
            expect(placeholderCard).toBeTruthy();
        });
    });

    describe('Currency Formatting', () => {
        beforeEach(() => {
            component.item = mockLootItem;
        });

        it('should call currency service with correct parameters', () => {
            component.showPrice = true;
            component.showFullBreakdown = false;

            component.getFormattedPrice();

            expect(mockCurrencyService.formatCurrency).toHaveBeenCalledWith(1440, {
                showFullBreakdown: false,
                showSymbols: true,
                showZeroValues: false,
                abbreviate: true,
                language: 'en'
            });
        });

        it('should return empty string when showPrice is false', () => {
            component.showPrice = false;
            const result = component.getFormattedPrice();
            expect(result).toBe('');
        });

        it('should return empty string when item is null', () => {
            component.item = null;
            component.showPrice = true;
            const result = component.getFormattedPrice();
            expect(result).toBe('');
        });

        it('should toggle price breakdown', () => {
            component.showFullBreakdown = false;
            component.togglePriceBreakdown();
            expect(component.showFullBreakdown).toBeTrue();

            component.togglePriceBreakdown();
            expect(component.showFullBreakdown).toBeFalse();
        });
    });

    describe('Wealth Level Logic', () => {
        it('should return correct wealth level name', () => {
            component.item = { ...mockLootItem, wealthLevel: WealthLevel.Wealthy };
            mockI18nService.translate.and.returnValue('Wealthy');

            const result = component.getWealthLevelName();
            expect(mockI18nService.translate).toHaveBeenCalledWith('wealth.wealthy');
            expect(result).toBe('Wealthy');
        });

        it('should return correct wealth level description', () => {
            component.item = { ...mockLootItem, wealthLevel: WealthLevel.Wealthy };
            mockI18nService.translate.and.returnValue('Quality items and luxuries');

            const result = component.getWealthLevelDescription();
            expect(mockI18nService.translate).toHaveBeenCalledWith('wealth.wealthy.description');
            expect(result).toBe('Quality items and luxuries');
        });

        it('should return correct color class for each wealth level', () => {
            const testCases = [
                { wealthLevel: WealthLevel.Rubbish, expected: 'rubbish' },
                { wealthLevel: WealthLevel.Poor, expected: 'poor' },
                { wealthLevel: WealthLevel.Common, expected: 'common' },
                { wealthLevel: WealthLevel.Wealthy, expected: 'wealthy' },
                { wealthLevel: WealthLevel.Noble, expected: 'noble' }
            ];

            testCases.forEach(({ wealthLevel, expected }) => {
                component.item = { ...mockLootItem, wealthLevel };
                expect(component.getWealthLevelColor()).toBe(expected);
            });
        });

        it('should return correct icon for each wealth level', () => {
            const testCases = [
                { wealthLevel: WealthLevel.Rubbish, expected: 'delete' },
                { wealthLevel: WealthLevel.Poor, expected: 'inventory' },
                { wealthLevel: WealthLevel.Common, expected: 'inventory_2' },
                { wealthLevel: WealthLevel.Wealthy, expected: 'diamond' },
                { wealthLevel: WealthLevel.Noble, expected: 'auto_awesome' }
            ];

            testCases.forEach(({ wealthLevel, expected }) => {
                component.item = { ...mockLootItem, wealthLevel };
                expect(component.getWealthLevelIcon()).toBe(expected);
            });
        });

        it('should handle null item in wealth level methods', () => {
            component.item = null;

            expect(component.getWealthLevelName()).toBe('');
            expect(component.getWealthLevelDescription()).toBe('');
            expect(component.getWealthLevelColor()).toBe('common');
            expect(component.getWealthLevelIcon()).toBe('inventory');
        });

        it('should default to common for unknown wealth levels', () => {
            component.item = { ...mockLootItem, wealthLevel: 99 as WealthLevel };

            expect(component.getWealthLevelColor()).toBe('common');
            expect(component.getWealthLevelIcon()).toBe('inventory');
        });
    });

    describe('Accessibility', () => {
        beforeEach(() => {
            component.item = mockLootItem;
            fixture.detectChanges();
        });

        it('should have proper aria-label for price toggle button', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const toggleButton = compiled.querySelector('.price-toggle');
            expect(toggleButton?.getAttribute('aria-label')).toBeTruthy();
        });

        it('should have tooltip on wealth level chip', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const chip = compiled.querySelector('mat-chip[mattooltipposition]');
            expect(chip).toBeTruthy();
        });

        it('should have title attributes for truncated text', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const nameElement = compiled.querySelector('.item-name');
            const descriptionElement = compiled.querySelector('.item-description');

            expect(nameElement?.getAttribute('title')).toBe(mockLootItem.name);
            expect(descriptionElement?.getAttribute('title')).toBe(mockLootItem.description);
        });
    });

    describe('Responsive Behavior', () => {
        beforeEach(() => {
            component.item = mockLootItem;
            fixture.detectChanges();
        });

        it('should apply correct CSS classes for wealth levels', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const card = compiled.querySelector('.loot-item-card');
            expect(card?.classList).toContain('wealth-wealthy');
        });

        it('should show expandable price details', () => {
            component.showPrice = true;
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const toggleButton = compiled.querySelector('.price-toggle');
            expect(toggleButton).toBeTruthy();
        });
    });

    describe('Error Handling', () => {
        it('should handle currency service errors gracefully', () => {
            component.item = mockLootItem;
            mockCurrencyService.formatCurrency.and.throwError('Currency error');

            expect(() => component.getFormattedPrice()).toThrowError('Currency error');
        });

        it('should handle i18n service errors gracefully', () => {
            component.item = mockLootItem;
            mockI18nService.translate.and.throwError('Translation error');

            expect(() => component.getWealthLevelName()).toThrowError('Translation error');
        });
    });

    describe('Integration Tests', () => {
        it('should update display when language changes', () => {
            component.item = mockLootItem;

            // Simulate language change
            const newLanguageSignal = signal('pl');
            Object.defineProperty(mockI18nService, 'currentLanguage', {
                get: () => newLanguageSignal
            });

            // Trigger change detection
            fixture.detectChanges();

            // Should call currency service with new language
            component.getFormattedPrice();
            expect(mockCurrencyService.formatCurrency).toHaveBeenCalledWith(
                jasmine.any(Number),
                jasmine.objectContaining({ language: 'pl' })
            );
        });

        it('should properly render all wealth levels', () => {
            const wealthLevels = [
                WealthLevel.Rubbish,
                WealthLevel.Poor,
                WealthLevel.Common,
                WealthLevel.Wealthy,
                WealthLevel.Noble
            ];

            wealthLevels.forEach(wealthLevel => {
                component.item = { ...mockLootItem, wealthLevel };
                fixture.detectChanges();

                const compiled = fixture.nativeElement as HTMLElement;
                const card = compiled.querySelector('.loot-item-card');
                expect(card).toBeTruthy();
            });
        });
    });
});