import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';
import { WealthLevel } from '../../models/wealth-level.enum';

export interface WealthLevelOption {
    value: WealthLevel;
    labelKey: string;
    descriptionKey: string;
    icon: string;
    color: string;
}

@Component({
    selector: 'app-wealth-selector',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatIconModule,
        TranslatePipe
    ],
    templateUrl: './wealth-selector.component.html',
    styleUrls: ['./wealth-selector.component.scss']
})
export class WealthSelectorComponent implements OnInit, OnChanges {
    @Input() value: WealthLevel = WealthLevel.Common;
    @Input() disabled: boolean = false;
    @Input() required: boolean = true;
    @Input() showIcons: boolean = false;              // NEW - disable icon display
    @Input() showPennyRanges: boolean = true;         // NEW - enable penny range display
    @Input() pennyRangePosition: 'below' = 'below';   // NEW - position ranges below dropdown
    @Output() valueChange = new EventEmitter<WealthLevel>();

    wealthLevelControl = new FormControl(WealthLevel.Common);
    selectedWealthLevel = signal<WealthLevel>(WealthLevel.Common);

    wealthLevelOptions: WealthLevelOption[] = [
        {
            value: WealthLevel.Rubbish,
            labelKey: 'wealth.rubbish',
            descriptionKey: 'wealth.rubbish.description',
            icon: 'delete_outline',
            color: '#8d6e63'
        },
        {
            value: WealthLevel.Poor,
            labelKey: 'wealth.poor',
            descriptionKey: 'wealth.poor.description',
            icon: 'person_outline',
            color: '#795548'
        },
        {
            value: WealthLevel.Common,
            labelKey: 'wealth.common',
            descriptionKey: 'wealth.common.description',
            icon: 'business_center',
            color: '#5d4037'
        },
        {
            value: WealthLevel.Wealthy,
            labelKey: 'wealth.wealthy',
            descriptionKey: 'wealth.wealthy.description',
            icon: 'diamond',
            color: '#bf9000'
        },
        {
            value: WealthLevel.Noble,
            labelKey: 'wealth.noble',
            descriptionKey: 'wealth.noble.description',
            icon: 'castle',
            color: '#ff6f00'
        }
    ];

    constructor(private i18nService: I18nService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value'] && !changes['value'].firstChange) {
            const newValue = changes['value'].currentValue;
            if (this.wealthLevelControl.value !== newValue) {
                this.wealthLevelControl.setValue(newValue, { emitEvent: false });
                this.selectedWealthLevel.set(newValue);
            }
        }

        if (changes['disabled']) {
            if (changes['disabled'].currentValue) {
                this.wealthLevelControl.disable();
            } else {
                this.wealthLevelControl.enable();
            }
        }
    }

    ngOnInit(): void {
        this.wealthLevelControl.setValue(this.value);
        this.selectedWealthLevel.set(this.value);

        if (this.disabled) {
            this.wealthLevelControl.disable();
        }

        this.wealthLevelControl.valueChanges.subscribe((value) => {
            if (value !== null) {
                this.selectedWealthLevel.set(value);
                this.valueChange.emit(value);
            }
        });
    }

    onSelectionChange(wealthLevel: WealthLevel): void {
        this.wealthLevelControl.setValue(wealthLevel);
        // The valueChanges subscription will handle the rest
    }

    getTooltipText(option: WealthLevelOption): string {
        return this.i18nService.translate(option.descriptionKey);
    }

    getOptionLabel(option: WealthLevelOption): string {
        return this.i18nService.translate(option.labelKey);
    }

    getSelectedOptionIcon(): string {
        const selected = this.wealthLevelOptions.find(
            option => option.value === this.selectedWealthLevel()
        );
        return selected?.icon || 'business_center';
    }

    getSelectedOptionColor(): string {
        const selected = this.wealthLevelOptions.find(
            option => option.value === this.selectedWealthLevel()
        );
        return selected?.color || '#5d4037';
    }

    /**
     * Get penny range text for the selected wealth level
     */
    getPennyRangeText(): string {
        const selected = this.wealthLevelOptions.find(
            option => option.value === this.selectedWealthLevel()
        );

        if (!selected) {
            return '';
        }

        // Get the description which contains penny range info
        const description = this.i18nService.translate(selected.descriptionKey);

        // Extract just the penny range part (before the dash if it exists)
        const pennyRange = description.split(' - ')[0];
        return pennyRange || description;
    }
}