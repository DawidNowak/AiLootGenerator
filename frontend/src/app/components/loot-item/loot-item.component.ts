import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LootItem } from '../../models/loot-item.interface';
import { WealthLevel } from '../../models/wealth-level.enum';
import { CurrencyService, CurrencyDisplayOptions } from '../../services/currency.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'app-loot-item',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatChipsModule,
        MatTooltipModule,
        TranslatePipe
    ],
    templateUrl: './loot-item.component.html',
    styleUrl: './loot-item.component.scss'
})
export class LootItemComponent {
    @Input() item: LootItem | null = null;
    @Input() showPrice: boolean = true;
    @Input() showFullBreakdown: boolean = false;

    // Expose WealthLevel enum to template
    readonly WealthLevel = WealthLevel;

    // Computed values for reactive updates
    currentLanguage = computed(() => this.i18nService.currentLanguage());

    constructor(
        private currencyService: CurrencyService,
        private i18nService: I18nService
    ) { }

    /**
     * Gets the formatted currency display for the item's value
     */
    getFormattedPrice(): string {
        if (!this.item || !this.showPrice) {
            return '';
        }

        const options: CurrencyDisplayOptions = {
            showFullBreakdown: this.showFullBreakdown,
            showSymbols: true,
            showZeroValues: false,
            abbreviate: true,
            language: this.currentLanguage() as 'en' | 'pl'
        };

        return this.currencyService.formatCurrency(this.item.valueInPennies, options);
    }

    /**
     * Gets the wealth level display name
     */
    getWealthLevelName(): string {
        if (!this.item) {
            return '';
        }

        return this.i18nService.translate(`wealth.${this.getWealthLevelKey()}`);
    }

    /**
     * Gets the wealth level description
     */
    getWealthLevelDescription(): string {
        if (!this.item) {
            return '';
        }

        return this.i18nService.translate(`wealth.${this.getWealthLevelKey()}.description`);
    }

    /**
     * Gets the wealth level translation key
     */
    private getWealthLevelKey(): string {
        if (!this.item) {
            return 'common';
        }

        switch (this.item.wealthLevel) {
            case WealthLevel.Rubbish:
                return 'rubbish';
            case WealthLevel.Poor:
                return 'poor';
            case WealthLevel.Common:
                return 'common';
            case WealthLevel.Wealthy:
                return 'wealthy';
            case WealthLevel.Noble:
                return 'noble';
            default:
                return 'common';
        }
    }

    /**
     * Gets the wealth level color class for styling
     */
    getWealthLevelColor(): string {
        if (!this.item) {
            return 'common';
        }

        switch (this.item.wealthLevel) {
            case WealthLevel.Rubbish:
                return 'rubbish';
            case WealthLevel.Poor:
                return 'poor';
            case WealthLevel.Common:
                return 'common';
            case WealthLevel.Wealthy:
                return 'wealthy';
            case WealthLevel.Noble:
                return 'noble';
            default:
                return 'common';
        }
    }

    /**
     * Gets the appropriate icon for the wealth level
     */
    getWealthLevelIcon(): string {
        if (!this.item) {
            return 'inventory';
        }

        switch (this.item.wealthLevel) {
            case WealthLevel.Rubbish:
                return 'delete';
            case WealthLevel.Poor:
                return 'inventory';
            case WealthLevel.Common:
                return 'inventory_2';
            case WealthLevel.Wealthy:
                return 'diamond';
            case WealthLevel.Noble:
                return 'auto_awesome';
            default:
                return 'inventory';
        }
    }

    /**
     * Toggles the price breakdown display
     */
    togglePriceBreakdown(): void {
        this.showFullBreakdown = !this.showFullBreakdown;
    }
}