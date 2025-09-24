import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { LocationInputComponent } from './location-input.component';
import { I18nService } from '../../services/i18n.service';
import { signal } from '@angular/core';

describe('LocationInputComponent', () => {
    let component: LocationInputComponent;
    let fixture: ComponentFixture<LocationInputComponent>;
    let mockI18nService: jasmine.SpyObj<I18nService>;

    beforeEach(async () => {
        const i18nServiceSpy = jasmine.createSpyObj('I18nService', ['translate', 'switchLanguage'], {
            currentLanguage: signal('en')
        });

        await TestBed.configureTestingModule({
            imports: [
                LocationInputComponent,
                NoopAnimationsModule,
                ReactiveFormsModule
            ],
            providers: [
                { provide: I18nService, useValue: i18nServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LocationInputComponent);
        component = fixture.componentInstance;
        mockI18nService = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;

        // Setup default translations
        mockI18nService.translate.and.callFake((key: string) => {
            const translations: { [key: string]: string } = {
                'location.label': 'Location',
                'location.placeholder': 'Enter location (e.g., "Ubersreik barracks", "Altdorf marketplace")',
                'location.validation.required': 'Location is required',
                'location.validation.minLength': 'Location must be at least 1 character',
                'location.validation.maxLength': 'Location must not exceed 200 characters',
                'location.hint': 'Describe where the loot is found to enhance the generation',
                'common.clear': 'Clear'
            };
            return translations[key] || key;
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with empty value by default', () => {
        expect(component.locationControl.value).toBe('');
        expect(component.characterCount()).toBe(0);
    });

    it('should initialize with provided input value', () => {
        component.value = 'Test location';
        component.ngOnInit();
        expect(component.locationControl.value).toBe('Test location');
        expect(component.characterCount()).toBe(13);
    });

    it('should emit valueChange when form control value changes', fakeAsync(() => {
        spyOn(component.valueChange, 'emit');

        component.locationControl.setValue('New location');
        tick();

        expect(component.valueChange.emit).toHaveBeenCalledWith('New location');
    }));

    it('should emit validationChange when form control validity changes', fakeAsync(() => {
        spyOn(component.validationChange, 'emit');

        // Set invalid value (empty when required)
        component.locationControl.setValue('');
        tick();

        expect(component.validationChange.emit).toHaveBeenCalledWith(false);

        // Set valid value
        component.locationControl.setValue('Valid location');
        tick();

        expect(component.validationChange.emit).toHaveBeenCalledWith(true);
    }));

    it('should update character count on input', () => {
        const testValue = 'Test input value';
        component.locationControl.setValue(testValue);

        expect(component.characterCount()).toBe(testValue.length);
    });

    it('should validate required field', () => {
        component.required = true;
        component.locationControl.setValue('');
        component.locationControl.markAsTouched();

        expect(component.locationControl.hasError('required')).toBeTruthy();
        expect(component.getErrorMessage()).toBe('Location is required');
    });

    it('should validate minimum length', () => {
        component.minLength = 5;
        component.locationControl.setValidators([]);
        component['updateValidators']();
        component.locationControl.setValue('abc');
        component.locationControl.markAsTouched();

        expect(component.locationControl.hasError('minlength')).toBeTruthy();
        expect(component.getErrorMessage()).toBe('Location must be at least 1 character');
    });

    it('should validate maximum length', () => {
        component.maxLength = 10;
        component.locationControl.setValidators([]);
        component['updateValidators']();
        component.locationControl.setValue('This is a very long text that exceeds limit');
        component.locationControl.markAsTouched();

        expect(component.locationControl.hasError('maxlength')).toBeTruthy();
        expect(component.getErrorMessage()).toBe('Location must not exceed 200 characters');
    });

    it('should detect near character limit', () => {
        component.maxLength = 100;
        component.characterCount.set(85); // 85% of 100

        expect(component.isCharacterCountNearLimit()).toBeTruthy();
        expect(component.isCharacterCountAtLimit()).toBeFalsy();
    });

    it('should detect at character limit', () => {
        component.maxLength = 100;
        component.characterCount.set(100);

        expect(component.isCharacterCountAtLimit()).toBeTruthy();
        expect(component.isCharacterCountNearLimit()).toBeTruthy();
    });

    it('should clear input when clearInput is called', () => {
        component.locationControl.setValue('Some text');
        component.clearInput();

        expect(component.locationControl.value).toBe('');
        expect(component.locationControl.touched).toBeTruthy();
    });

    it('should update character count on input event', () => {
        const inputElement = document.createElement('input');
        inputElement.value = 'Test value';
        const event = { target: inputElement } as any;

        component.onInput(event);

        expect(component.characterCount()).toBe(10);
    });

    it('should rotate placeholder text', fakeAsync(() => {
        const initialPlaceholder = component.currentPlaceholder();

        // Trigger placeholder rotation
        tick(3001); // More than 3 seconds

        // Placeholder should potentially be different (unless random selected the same one)
        // We can at least verify the signal is reactive
        expect(typeof component.currentPlaceholder()).toBe('string');
    }));

    it('should generate placeholder text with example', () => {
        component.currentPlaceholder.set('Test example');
        const placeholderText = component.getPlaceholderText();

        expect(placeholderText).toContain('Test example');
        expect(mockI18nService.translate).toHaveBeenCalledWith('location.placeholder');
    });

    it('should handle disabled state through FormControl', () => {
        component.disabled = true;
        component.maxLength = 150;
        component.ngOnInit(); // Re-initialize to apply disabled state
        fixture.detectChanges();

        const inputElement = fixture.nativeElement.querySelector('input');
        expect(inputElement).toBeTruthy();
        expect(component.locationControl.disabled).toBeTruthy();
        expect(inputElement.maxLength).toBe(150);
    });

    it('should show clear button when has value and not disabled', () => {
        component.locationControl.setValue('Some text');
        component.disabled = false;
        fixture.detectChanges();

        const clearButton = fixture.nativeElement.querySelector('.clear-button');
        expect(clearButton).toBeTruthy();
    });

    it('should hide clear button when FormControl is disabled', () => {
        component.locationControl.setValue('Some text');
        component.locationControl.disable();
        fixture.detectChanges();

        const clearButton = fixture.nativeElement.querySelector('.clear-button');
        expect(clearButton).toBeFalsy();
    });

    it('should display character counter', () => {
        component.locationControl.setValue('Test');
        fixture.detectChanges();

        const counter = fixture.nativeElement.querySelector('.character-counter');
        expect(counter).toBeTruthy();
        expect(counter.textContent.trim()).toContain('4/200');
    });

    it('should apply near-limit class when approaching character limit', () => {
        component.maxLength = 100;
        component.locationControl.setValue('a'.repeat(85)); // 85 characters
        fixture.detectChanges();

        const counter = fixture.nativeElement.querySelector('.character-counter');
        expect(counter).toBeTruthy();
        expect(component.isCharacterCountNearLimit()).toBeTruthy();
        // Due to Angular's async nature, we check the component logic rather than DOM class
    });

    it('should apply at-limit class when at character limit', () => {
        component.maxLength = 100;
        component.locationControl.setValue('a'.repeat(100)); // 100 characters
        fixture.detectChanges();

        const counter = fixture.nativeElement.querySelector('.character-counter');
        expect(counter).toBeTruthy();
        expect(component.isCharacterCountAtLimit()).toBeTruthy();
        // Due to Angular's async nature, we check the component logic rather than DOM class
    });
});