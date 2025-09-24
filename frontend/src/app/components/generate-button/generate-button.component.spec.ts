import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GenerateButtonComponent } from './generate-button.component';
import { I18nService } from '../../services/i18n.service';
import { signal } from '@angular/core';

describe('GenerateButtonComponent', () => {
    let component: GenerateButtonComponent;
    let fixture: ComponentFixture<GenerateButtonComponent>;
    let mockI18nService: jasmine.SpyObj<I18nService>;

    beforeEach(async () => {
        const i18nServiceSpy = jasmine.createSpyObj('I18nService', ['translate'], {
            currentLanguage: signal('en')
        });

        await TestBed.configureTestingModule({
            imports: [
                GenerateButtonComponent,
                NoopAnimationsModule
            ],
            providers: [
                { provide: I18nService, useValue: i18nServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(GenerateButtonComponent);
        component = fixture.componentInstance;
        mockI18nService = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;

        // Mock translation returns
        mockI18nService.translate.and.callFake((key: string, params?: Record<string, string>) => {
            const translations: Record<string, string> = {
                'common.generate': 'Generate Loot',
                'common.generating': 'Generating...',
                'common.cooldown': `Wait ${params?.['seconds'] || '0'}s`,
                'common.cooldown.remaining': 'Cooldown remaining'
            };

            if (params && key === 'common.cooldown') {
                return `Wait ${params['seconds']}s`;
            }

            return translations[key] || key;
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display "Generate Loot" text by default', () => {
        expect(component.buttonText()).toBe('Generate Loot');
        expect(mockI18nService.translate).toHaveBeenCalledWith('common.generate');
    });

    it('should display "Generating..." when loading', () => {
        component.isLoading = true;
        fixture.detectChanges(); // Trigger change detection

        expect(component.buttonText()).toBe('Generating...');
        expect(mockI18nService.translate).toHaveBeenCalledWith('common.generating');
    });

    it('should display cooldown text when cooldown is active', () => {
        component.cooldownRemaining = 5000; // 5 seconds
        fixture.detectChanges(); // Trigger change detection

        expect(component.buttonText()).toBe('Wait 5s');
        expect(mockI18nService.translate).toHaveBeenCalledWith('common.cooldown', { seconds: '5' });
    });

    it('should show casino icon by default', () => {
        expect(component.buttonIcon()).toBe('casino');
    });

    it('should show timer icon when cooldown is active', () => {
        component.cooldownRemaining = 3000;
        fixture.detectChanges(); // Trigger change detection

        expect(component.buttonIcon()).toBe('timer');
    });

    it('should show refresh icon when loading', () => {
        component.isLoading = true;
        fixture.detectChanges(); // Trigger change detection

        expect(component.buttonIcon()).toBe('refresh');
    });

    it('should be disabled when isDisabled is true', () => {
        component.isDisabled = true;
        fixture.detectChanges(); // Trigger change detection

        expect(component.isButtonDisabled()).toBe(true);
    });

    it('should be disabled when loading', () => {
        component.isLoading = true;
        fixture.detectChanges(); // Trigger change detection

        expect(component.isButtonDisabled()).toBe(true);
    });

    it('should be disabled when cooldown is active', () => {
        component.cooldownRemaining = 2000;
        fixture.detectChanges(); // Trigger change detection

        expect(component.isButtonDisabled()).toBe(true);
    });

    it('should emit generateClick when clicked and enabled', () => {
        spyOn(component.generateClick, 'emit');

        component.onGenerateClick();

        expect(component.generateClick.emit).toHaveBeenCalled();
    });

    it('should not emit generateClick when disabled', () => {
        spyOn(component.generateClick, 'emit');
        component.isDisabled = true;
        fixture.detectChanges(); // Trigger change detection

        component.onGenerateClick();

        expect(component.generateClick.emit).not.toHaveBeenCalled();
    });

    it('should calculate cooldown seconds correctly', () => {
        component.cooldownRemaining = 7500; // 7.5 seconds
        fixture.detectChanges(); // Trigger change detection

        // Should round up to 8 seconds
        expect(component.buttonText()).toBe('Wait 8s');
    });

    it('should show cooldown progress in template when cooldown is active', () => {
        component.cooldownRemaining = 15000; // 15 seconds
        fixture.detectChanges();

        const cooldownElement = fixture.nativeElement.querySelector('.cooldown-progress');
        expect(cooldownElement).toBeTruthy();

        const progressBar = fixture.nativeElement.querySelector('.progress-bar');
        expect(progressBar).toBeTruthy();
        expect(progressBar.style.width).toBe('50%'); // 15000/30000 * 100 = 50%
    });

    it('should not show cooldown progress when no cooldown', () => {
        component.cooldownRemaining = 0;
        fixture.detectChanges();

        const cooldownElement = fixture.nativeElement.querySelector('.cooldown-progress');
        expect(cooldownElement).toBeFalsy();
    });

    it('should show loading spinner when loading', () => {
        component.isLoading = true;
        fixture.detectChanges();

        const spinner = fixture.nativeElement.querySelector('mat-spinner');
        expect(spinner).toBeTruthy();
    });

    it('should not show loading spinner when not loading', () => {
        component.isLoading = false;
        fixture.detectChanges();

        const spinner = fixture.nativeElement.querySelector('mat-spinner');
        expect(spinner).toBeFalsy();
    });
});