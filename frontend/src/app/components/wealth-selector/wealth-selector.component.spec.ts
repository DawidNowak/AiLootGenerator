import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { WealthSelectorComponent } from './wealth-selector.component';
import { I18nService } from '../../services/i18n.service';
import { WealthLevel } from '../../models/wealth-level.enum';
import { signal } from '@angular/core';

describe('WealthSelectorComponent', () => {
    let component: WealthSelectorComponent;
    let fixture: ComponentFixture<WealthSelectorComponent>;
    let mockI18nService: jasmine.SpyObj<I18nService>;

    beforeEach(async () => {
        const i18nServiceSpy = jasmine.createSpyObj('I18nService', ['translate', 'switchLanguage'], {
            currentLanguage: signal('en')
        });

        await TestBed.configureTestingModule({
            imports: [
                WealthSelectorComponent,
                NoopAnimationsModule,
                ReactiveFormsModule
            ],
            providers: [
                { provide: I18nService, useValue: i18nServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(WealthSelectorComponent);
        component = fixture.componentInstance;
        mockI18nService = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;

        // Setup default translations
        mockI18nService.translate.and.callFake((key: string) => {
            const translations: { [key: string]: string } = {
                'wealth.label': 'Wealth Level',
                'wealth.rubbish': 'Rubbish',
                'wealth.poor': 'Poor',
                'wealth.common': 'Common',
                'wealth.wealthy': 'Wealthy',
                'wealth.noble': 'Noble',
                'wealth.rubbish.description': '1-12 pennies - Basic scraps and trinkets',
                'wealth.poor.description': '13-60 pennies - Simple items and tools',
                'wealth.common.description': '61-240 pennies - Standard equipment and goods',
                'wealth.wealthy.description': '241-1200 pennies - Quality items and luxuries',
                'wealth.noble.description': '1201+ pennies - Rare treasures and artifacts'
            };
            return translations[key] || key;
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with Common wealth level by default', () => {
        expect(component.selectedWealthLevel()).toBe(WealthLevel.Common);
    });

    it('should initialize with provided input value', () => {
        component.value = WealthLevel.Wealthy;
        component.ngOnInit();
        expect(component.selectedWealthLevel()).toBe(WealthLevel.Wealthy);
    });

    it('should emit valueChange when selection changes', () => {
        spyOn(component.valueChange, 'emit');
        component.onSelectionChange(WealthLevel.Noble);

        expect(component.selectedWealthLevel()).toBe(WealthLevel.Noble);
        expect(component.valueChange.emit).toHaveBeenCalledWith(WealthLevel.Noble);
    });

    it('should have all 5 wealth level options', () => {
        expect(component.wealthLevelOptions).toHaveSize(5);
        expect(component.wealthLevelOptions.map(o => o.value)).toEqual([
            WealthLevel.Rubbish,
            WealthLevel.Poor,
            WealthLevel.Common,
            WealthLevel.Wealthy,
            WealthLevel.Noble
        ]);
    });

    it('should return correct tooltip text', () => {
        const rubbishOption = component.wealthLevelOptions.find(o => o.value === WealthLevel.Rubbish)!;
        const tooltipText = component.getTooltipText(rubbishOption);

        expect(mockI18nService.translate).toHaveBeenCalledWith('wealth.rubbish.description');
        expect(tooltipText).toBe('1-12 pennies - Basic scraps and trinkets');
    });

    it('should return correct option label', () => {
        const wealthyOption = component.wealthLevelOptions.find(o => o.value === WealthLevel.Wealthy)!;
        const label = component.getOptionLabel(wealthyOption);

        expect(mockI18nService.translate).toHaveBeenCalledWith('wealth.wealthy');
        expect(label).toBe('Wealthy');
    });

    it('should return correct selected option icon', () => {
        component.selectedWealthLevel.set(WealthLevel.Noble);
        const icon = component.getSelectedOptionIcon();
        expect(icon).toBe('castle');
    });

    it('should return correct selected option color', () => {
        component.selectedWealthLevel.set(WealthLevel.Wealthy);
        const color = component.getSelectedOptionColor();
        expect(color).toBe('#bf9000');
    });

    it('should return default icon for unknown wealth level', () => {
        component.selectedWealthLevel.set(999 as WealthLevel); // Invalid value
        const icon = component.getSelectedOptionIcon();
        expect(icon).toBe('business_center');
    });

    it('should return default color for unknown wealth level', () => {
        component.selectedWealthLevel.set(999 as WealthLevel); // Invalid value
        const color = component.getSelectedOptionColor();
        expect(color).toBe('#5d4037');
    });

    it('should render mat-select with correct properties', () => {
        component.disabled = true;
        component.required = false;
        fixture.detectChanges();

        const matSelect = fixture.nativeElement.querySelector('mat-select');
        expect(matSelect).toBeTruthy();
    });

    it('should render all wealth level options', async () => {
        // Trigger the select to open by clicking on it
        const trigger = fixture.debugElement.nativeElement.querySelector('.mat-mdc-select-trigger');
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        const matOptions = document.querySelectorAll('mat-option');
        expect(matOptions.length).toBe(5);
    });

    it('should display wealth level icons', async () => {
        // Trigger the select to open by clicking on it
        const trigger = fixture.debugElement.nativeElement.querySelector('.mat-mdc-select-trigger');
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        const icons = document.querySelectorAll('.wealth-icon');
        expect(icons.length).toBeGreaterThan(0);
    });
});