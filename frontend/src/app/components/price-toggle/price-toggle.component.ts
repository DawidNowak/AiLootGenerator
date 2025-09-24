import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

@Component({
    selector: 'app-price-toggle',
    standalone: true,
    imports: [
        CommonModule,
        MatSlideToggleModule,
        MatIconModule,
        MatTooltipModule,
        TranslatePipe
    ],
    templateUrl: './price-toggle.component.html',
    styleUrls: ['./price-toggle.component.scss']
})
export class PriceToggleComponent implements OnInit, OnChanges {
    @Input() showDetailedPrices: boolean = false;
    @Input() disabled: boolean = false;
    @Output() showDetailedPricesChange = new EventEmitter<boolean>();

    isDetailed = signal<boolean>(false);

    constructor(private i18nService: I18nService) { }

    ngOnInit(): void {
        this.isDetailed.set(this.showDetailedPrices);
    }

    ngOnChanges(): void {
        this.isDetailed.set(this.showDetailedPrices);
    }

    onToggleChange(checked: boolean): void {
        this.isDetailed.set(checked);
        this.showDetailedPricesChange.emit(checked);
    }

    getToggleLabel(): string {
        return this.isDetailed()
            ? this.i18nService.translate('currency.collapse')
            : this.i18nService.translate('currency.expand');
    }

    getToggleIcon(): string {
        return this.isDetailed() ? 'expand_less' : 'expand_more';
    }

    getTooltipText(): string {
        return this.isDetailed()
            ? this.i18nService.translate('currency.collapse')
            : this.i18nService.translate('currency.expand');
    }
}