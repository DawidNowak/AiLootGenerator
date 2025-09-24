import { Component, Input, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LootItem } from '../../models/loot-item.interface';
import { LootItemComponent } from '../loot-item/loot-item.component';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'app-loot-list',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        LootItemComponent,
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

    // Internal signals for reactivity
    private itemsSignal = signal<LootItem[]>([]);
    private isLoadingSignal = signal<boolean>(false);

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
        private i18nService: I18nService
    ) { }

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