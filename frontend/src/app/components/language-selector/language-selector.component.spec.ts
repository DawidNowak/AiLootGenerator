import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { LanguageSelectorComponent } from './language-selector.component';
import { I18nService } from '../../services/i18n.service';

describe('LanguageSelectorComponent', () => {
    let component: LanguageSelectorComponent;
    let fixture: ComponentFixture<LanguageSelectorComponent>;
    let i18nService: jasmine.SpyObj<I18nService>;

    beforeEach(async () => {
        const i18nServiceSpy = jasmine.createSpyObj('I18nService', [
            'getAvailableLanguages',
            'getCurrentLanguageInfo',
            'switchLanguage',
            'translate'
        ], {
            currentLanguage: jasmine.createSpy().and.returnValue('en')
        });

        await TestBed.configureTestingModule({
            imports: [LanguageSelectorComponent, NoopAnimationsModule],
            providers: [
                { provide: I18nService, useValue: i18nServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LanguageSelectorComponent);
        component = fixture.componentInstance;
        i18nService = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;

        // Mock the return values
        i18nService.getAvailableLanguages.and.returnValue([
            { code: 'en', label: 'English', translations: {} },
            { code: 'pl', label: 'Polski', translations: {} }
        ]);
        i18nService.getCurrentLanguageInfo.and.returnValue({
            code: 'en', label: 'English', translations: {}
        });
        i18nService.translate.and.returnValue('Language'); // Mock translate method

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load available languages on init', () => {
        expect(component.languages.length).toBe(2);
        expect(component.languages[0]).toEqual({
            code: 'en',
            label: 'English',
            translations: {}
        });
        expect(component.languages[1]).toEqual({
            code: 'pl',
            label: 'Polski',
            translations: {}
        });
    });

    it('should get current language info', () => {
        const result = component.getCurrentLanguageLabel();
        expect(result).toContain('English');
        expect(i18nService.getCurrentLanguageInfo).toHaveBeenCalled();
    });

    it('should use mat-select without custom icons', () => {
        // Test that the mat-select is used without decorative icons in the template
        const matSelect = fixture.debugElement.query(By.css('mat-select'));
        expect(matSelect).toBeTruthy();

        // Should not have custom icons in the select options (only standard mat-select behavior)
        const matOptions = fixture.debugElement.queryAll(By.css('mat-option mat-icon'));
        expect(matOptions.length).toBe(0); // No custom icons in options
    });

    it('should have simplified styling without wealth-level colors', () => {
        const formField = fixture.debugElement.query(By.css('mat-form-field'));
        expect(formField).toBeTruthy();
        expect(formField.nativeElement.className).not.toContain('wealth-');
        expect(formField.nativeElement.className).not.toContain('custom-color');
    });

    it('should switch language when selection changes', () => {
        component.onLanguageChange('pl');
        expect(i18nService.switchLanguage).toHaveBeenCalledWith('pl');
    });
});