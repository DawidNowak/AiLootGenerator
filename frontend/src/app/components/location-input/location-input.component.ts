import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

@Component({
    selector: 'app-location-input',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatTooltipModule,
        TranslatePipe
    ],
    templateUrl: './location-input.component.html',
    styleUrls: ['./location-input.component.scss']
})
export class LocationInputComponent implements OnInit, OnChanges {
    @Input() value: string = '';
    @Input() disabled: boolean = false;
    @Input() required: boolean = true;
    @Input() maxLength: number = 200;
    @Input() minLength: number = 1;
    @Output() valueChange = new EventEmitter<string>();
    @Output() validationChange = new EventEmitter<boolean>();

    locationControl = new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200)
    ]);

    characterCount = signal<number>(0);

    // Warhammer Fantasy location examples for placeholder rotation
    private locationExamples = [
        'Ubersreik barracks',
        'Altdorf marketplace',
        'Reikland village inn',
        'Middenheim temple',
        'Bogenhafen merchant district',
        'Nuln engineering guild',
        'Talabheim watch tower',
        'Averheim noble quarter'
    ];

    currentPlaceholder = signal<string>('');

    constructor(private i18nService: I18nService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value'] && !changes['value'].firstChange) {
            const newValue = changes['value'].currentValue || '';
            if (this.locationControl.value !== newValue) {
                this.locationControl.setValue(newValue, { emitEvent: false });
                this.updateCharacterCount(newValue);
            }
        }

        if (changes['disabled']) {
            if (changes['disabled'].currentValue) {
                this.locationControl.disable();
            } else {
                this.locationControl.enable();
            }
        }
    }

    ngOnInit(): void {
        // Initialize form control with input value
        this.locationControl.setValue(this.value);
        this.updateCharacterCount(this.value);

        // Update validators based on inputs
        this.updateValidators();

        // Handle disabled state
        if (this.disabled) {
            this.locationControl.disable();
        }

        // Set initial placeholder
        this.rotatePlaceholder();

        // Listen to form control changes
        this.locationControl.valueChanges.subscribe((value) => {
            const locationValue = value || '';
            this.updateCharacterCount(locationValue);
            this.valueChange.emit(locationValue);
            this.validationChange.emit(this.locationControl.valid);
        });

        // Listen to status changes for validation
        this.locationControl.statusChanges.subscribe(() => {
            this.validationChange.emit(this.locationControl.valid);
        });

        // Rotate placeholder every 3 seconds
        setInterval(() => {
            this.rotatePlaceholder();
        }, 3000);
    }

    private updateValidators(): void {
        const validators = [];

        if (this.required) {
            validators.push(Validators.required);
        }

        if (this.minLength > 0) {
            validators.push(Validators.minLength(this.minLength));
        }

        if (this.maxLength > 0) {
            validators.push(Validators.maxLength(this.maxLength));
        }

        this.locationControl.setValidators(validators);
        this.locationControl.updateValueAndValidity();
    }

    private updateCharacterCount(value: string): void {
        this.characterCount.set(value.length);
    }

    private rotatePlaceholder(): void {
        const randomIndex = Math.floor(Math.random() * this.locationExamples.length);
        const example = this.locationExamples[randomIndex];
        this.currentPlaceholder.set(example);
    }

    getErrorMessage(): string {
        if (this.locationControl.hasError('required')) {
            return this.i18nService.translate('location.validation.required');
        }

        if (this.locationControl.hasError('minlength')) {
            return this.i18nService.translate('location.validation.minLength');
        }

        if (this.locationControl.hasError('maxlength')) {
            return this.i18nService.translate('location.validation.maxLength');
        }

        return '';
    }

    isCharacterCountNearLimit(): boolean {
        const count = this.characterCount();
        return count > (this.maxLength * 0.8); // 80% of max length
    }

    isCharacterCountAtLimit(): boolean {
        return this.characterCount() >= this.maxLength;
    }

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        const value = target.value;
        this.updateCharacterCount(value);
    }

    clearInput(): void {
        this.locationControl.setValue('');
        this.locationControl.markAsTouched();
    }

    getPlaceholderText(): string {
        const baseText = this.i18nService.translate('location.placeholder');
        return `${baseText} (${this.currentPlaceholder()})`;
    }
}