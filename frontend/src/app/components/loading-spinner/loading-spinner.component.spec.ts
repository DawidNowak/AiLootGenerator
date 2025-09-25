import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement, signal } from '@angular/core';
import { By } from '@angular/platform-browser';

import { LoadingSpinnerComponent } from './loading-spinner.component';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

// Mock I18nService
class MockI18nService {
    private currentLanguageSignal = signal<string>('en');
    currentLanguage = this.currentLanguageSignal.asReadonly();

    translate(key: string): string {
        const translations: { [key: string]: string } = {
            'loading.default': 'Loading...',
            'loading.generating': 'Generating content...'
        };
        return translations[key] || key;
    }
}

describe('LoadingSpinnerComponent', () => {
    let component: LoadingSpinnerComponent;
    let fixture: ComponentFixture<LoadingSpinnerComponent>;
    let mockI18nService: MockI18nService;

    beforeEach(async () => {
        mockI18nService = new MockI18nService();

        await TestBed.configureTestingModule({
            imports: [
                LoadingSpinnerComponent,
                NoopAnimationsModule
            ],
            providers: [
                { provide: I18nService, useValue: mockI18nService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoadingSpinnerComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default input values', () => {
        expect(component.isLoading).toBe(false);
        expect(component.message).toBe('');
        expect(component.size).toBe(50);
        expect(component.strokeWidth).toBe(4);
        expect(component.color).toBe('primary');
        expect(component.showMessage).toBe(true);
    });

    it('should not show spinner when isLoading is false', () => {
        component.isLoading = false;
        fixture.detectChanges();

        const spinnerElement = fixture.debugElement.query(By.css('mat-spinner'));
        const containerElement = fixture.debugElement.query(By.css('.loading-container'));

        expect(spinnerElement).toBeFalsy();
        expect(containerElement.nativeElement.classList.contains('loading-visible')).toBe(false);
    });

    it('should show spinner when isLoading is true', () => {
        component.isLoading = true;
        fixture.detectChanges();

        const spinnerElement = fixture.debugElement.query(By.css('mat-spinner'));
        const containerElement = fixture.debugElement.query(By.css('.loading-container'));

        expect(spinnerElement).toBeTruthy();
        expect(containerElement.nativeElement.classList.contains('loading-visible')).toBe(true);
    });

    it('should configure spinner with custom properties', () => {
        component.isLoading = true;
        component.size = 100;
        component.strokeWidth = 6;
        component.color = 'accent';
        fixture.detectChanges();

        const spinnerElement = fixture.debugElement.query(By.css('mat-spinner'));

        expect(spinnerElement.attributes['ng-reflect-diameter']).toBe('100');
        expect(spinnerElement.attributes['ng-reflect-stroke-width']).toBe('6');
        expect(spinnerElement.attributes['ng-reflect-color']).toBe('accent');
    });

    it('should show loading message when isLoading is true and showMessage is true', () => {
        component.isLoading = true;
        component.showMessage = true;
        fixture.detectChanges();

        const messageElement = fixture.debugElement.query(By.css('.loading-message'));
        expect(messageElement).toBeTruthy();
        expect(messageElement.nativeElement.textContent.trim()).toBe('Loading...');
    });

    it('should hide loading message when showMessage is false', () => {
        component.isLoading = true;
        component.showMessage = false;
        fixture.detectChanges();

        const messageElement = fixture.debugElement.query(By.css('.loading-message'));
        expect(messageElement).toBeFalsy();
    });

    it('should hide loading message when isLoading is false', () => {
        component.isLoading = false;
        component.showMessage = true;
        fixture.detectChanges();

        const messageElement = fixture.debugElement.query(By.css('.loading-message'));
        expect(messageElement).toBeFalsy();
    });

    it('should use custom message when provided', () => {
        component.isLoading = true;
        component.message = 'loading.generating';
        fixture.detectChanges();

        const messageElement = fixture.debugElement.query(By.css('.loading-message'));
        expect(messageElement.nativeElement.textContent.trim()).toBe('Generating content...');
    });

    it('should use default message when no custom message provided', () => {
        component.isLoading = true;
        component.message = '';
        fixture.detectChanges();

        const messageElement = fixture.debugElement.query(By.css('.loading-message'));
        expect(messageElement.nativeElement.textContent.trim()).toBe('Loading...');
    });

    it('should return default message key when getDefaultMessage called', () => {
        component.message = '';
        expect(component.getDefaultMessage()).toBe('loading.default');

        component.message = 'custom.message';
        expect(component.getDefaultMessage()).toBe('custom.message');
    });

    it('should apply loading-visible class when isLoading is true', () => {
        component.isLoading = true;
        fixture.detectChanges();

        const containerElement = fixture.debugElement.query(By.css('.loading-container'));
        expect(containerElement.nativeElement.classList.contains('loading-visible')).toBe(true);
    });

    it('should remove loading-visible class when isLoading is false', () => {
        component.isLoading = true;
        fixture.detectChanges();

        let containerElement = fixture.debugElement.query(By.css('.loading-container'));
        expect(containerElement.nativeElement.classList.contains('loading-visible')).toBe(true);

        component.isLoading = false;
        fixture.detectChanges();

        containerElement = fixture.debugElement.query(By.css('.loading-container'));
        expect(containerElement.nativeElement.classList.contains('loading-visible')).toBe(false);
    });

    it('should handle color input variations', () => {
        const colorVariations: Array<'primary' | 'accent' | 'warn'> = ['primary', 'accent', 'warn'];

        colorVariations.forEach(color => {
            component.isLoading = true;
            component.color = color;
            fixture.detectChanges();

            const spinnerElement = fixture.debugElement.query(By.css('mat-spinner'));
            expect(spinnerElement.attributes['ng-reflect-color']).toBe(color);
        });
    });
});