import { Component, Input, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LootItem } from '../../models/loot-item.interface';
import { I18nService } from '../../services/i18n.service';
import { CurrencyService, CurrencyDisplayOptions } from '../../services/currency.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'app-loot-list',
    standalone: true,
    imports: [
        CommonModule,
        MatListModule,
        MatProgressBarModule,
        TranslatePipe
    ],
    templateUrl: './loot-list.component.html',
    styleUrl: './loot-list.component.scss'
})
export class LootListComponent {
    @Input() set items(value: LootItem[]) {
        this.itemsSignal.set(value || []);
    }
    get items(): LootItem[] {
        return this.itemsSignal();
    }

    @Input() set isLoading(value: boolean) {
        this.isLoadingSignal.set(value);
    }
    get isLoading(): boolean {
        return this.isLoadingSignal();
    }

    @Input() showPrices: boolean = true;
    @Input() showFullBreakdown: boolean = false;

    // Responsive layout coordination
    @Input() set isMobile(value: boolean) {
        this.isMobileSignal.set(value);
    }
    get isMobile(): boolean {
        return this.isMobileSignal();
    }

    @Input() set isDesktop(value: boolean) {
        this.isDesktopSignal.set(value);
    }
    get isDesktop(): boolean {
        return this.isDesktopSignal();
    }

    // Internal signals for reactivity
    private itemsSignal = signal<LootItem[]>([]);
    private isLoadingSignal = signal<boolean>(false);
    private isMobileSignal = signal<boolean>(false);
    private isDesktopSignal = signal<boolean>(true);

    // Computed values for reactive updates
    currentLanguage = computed(() => this.i18nService.currentLanguage());
    hasItems = computed(() => {
        const items = this.itemsSignal();
        return items && items.length > 0;
    });
    itemCount = computed(() => {
        const items = this.itemsSignal();
        return items?.length || 0;
    });

    constructor(
        private i18nService: I18nService,
        private currencyService: CurrencyService
    ) { }

    /**
     * Format the price of a loot item.
     */
    formatPrice(item: LootItem): string {
        if (!item || !this.showPrices) {
            return '';
        }

        const options: CurrencyDisplayOptions = {
            showFullBreakdown: this.showFullBreakdown,
            showSymbols: true,
            showZeroValues: false,
            abbreviate: true,
            language: this.currentLanguage() as 'en' | 'pl'
        };

        return this.currencyService.formatCurrency(item.valueInPennies, options);
    }

    /**
     * Tracks items by index for *ngFor performance optimization
     */
    trackByIndex(index: number, item: LootItem): number {
        return index;
    }

    /**
     * Gets the appropriate empty state message based on loading state
     */
    getEmptyStateMessage(): string {
        if (this.isLoadingSignal()) {
            return 'loot.list.loading';
        }
        return 'loot.list.empty';
    }

    /**
     * Gets the appropriate empty state icon based on loading state
     */
    getEmptyStateIcon(): string {
        if (this.isLoadingSignal()) {
            return 'hourglass_empty';
        }
        return 'inventory_2';
    }
}