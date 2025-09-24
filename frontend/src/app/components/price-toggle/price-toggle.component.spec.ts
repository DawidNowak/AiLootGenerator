import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { PriceToggleComponent } from './price-toggle.component';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

describe('PriceToggleComponent', () => {
    let component: PriceToggleComponent;
    let fixture: ComponentFixture<PriceToggleComponent>;
    let i18nServiceSpy: jasmine.SpyObj<I18nService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('I18nService', ['translate']);

        await TestBed.configureTestingModule({
            imports: [
                PriceToggleComponent,
                MatSlideToggleModule,
                MatIconModule,
                MatTooltipModule,
                NoopAnimationsModule
            ],
            providers: [
                { provide: I18nService, useValue: spy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PriceToggleComponent);
        component = fixture.componentInstance;
        i18nServiceSpy = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;

        // Setup default translations
        i18nServiceSpy.translate.and.callFake((key: string) => {
            const translations: { [key: string]: string } = {
                'currency.expand': 'Show detailed breakdown',
                'currency.collapse': 'Hide detailed breakdown'
            };
            return translations[key] || key;
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        fixture.detectChanges();

        expect(component.showDetailedPrices).toBe(false);
        expect(component.disabled).toBe(false);
        expect(component.isDetailed()).toBe(false);
    });

    it('should initialize with provided input values', () => {
        component.showDetailedPrices = true;
        component.disabled = true;

        component.ngOnInit();
        fixture.detectChanges();

        expect(component.isDetailed()).toBe(true);
        expect(component.disabled).toBe(true);
    });

    it('should display correct label when not detailed', () => {
        component.isDetailed.set(false);
        fixture.detectChanges();

        const label = component.getToggleLabel();
        expect(label).toBe('Show detailed breakdown');
        expect(i18nServiceSpy.translate).toHaveBeenCalledWith('currency.expand');
    });

    it('should display correct label when detailed', () => {
        component.showDetailedPrices = true;
        component.ngOnInit();
        fixture.detectChanges();

        const label = component.getToggleLabel();
        expect(label).toBe('Hide detailed breakdown');
        expect(i18nServiceSpy.translate).toHaveBeenCalledWith('currency.collapse');
    });

    it('should display correct icon when not detailed', () => {
        component.isDetailed.set(false);
        fixture.detectChanges();

        const icon = component.getToggleIcon();
        expect(icon).toBe('expand_more');
    });

    it('should display correct icon when detailed', () => {
        component.showDetailedPrices = true;
        component.ngOnInit();
        fixture.detectChanges();

        const icon = component.getToggleIcon();
        expect(icon).toBe('expand_less');
    });

    it('should return correct tooltip text when not detailed', () => {
        component.isDetailed.set(false);
        fixture.detectChanges();

        const tooltip = component.getTooltipText();
        expect(tooltip).toBe('Show detailed breakdown');
        expect(i18nServiceSpy.translate).toHaveBeenCalledWith('currency.expand');
    });

    it('should return correct tooltip text when detailed', () => {
        component.showDetailedPrices = true;
        component.ngOnInit();
        fixture.detectChanges();

        const tooltip = component.getTooltipText();
        expect(tooltip).toBe('Hide detailed breakdown');
        expect(i18nServiceSpy.translate).toHaveBeenCalledWith('currency.collapse');
    });

    it('should emit showDetailedPricesChange when toggle is changed', () => {
        spyOn(component.showDetailedPricesChange, 'emit');

        component.onToggleChange(true);

        expect(component.isDetailed()).toBe(true);
        expect(component.showDetailedPricesChange.emit).toHaveBeenCalledWith(true);
    });

    it('should emit showDetailedPricesChange when toggle is changed to false', () => {
        spyOn(component.showDetailedPricesChange, 'emit');

        component.onToggleChange(false);

        expect(component.isDetailed()).toBe(false);
        expect(component.showDetailedPricesChange.emit).toHaveBeenCalledWith(false);
    });

    it('should render slide toggle in template', () => {
        fixture.detectChanges();

        const slideToggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
        expect(slideToggle).toBeTruthy();
    });

    it('should render icon in template', () => {
        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.css('mat-icon'));
        expect(icon).toBeTruthy();
    });

    it('should render label in template', () => {
        fixture.detectChanges();

        const label = fixture.debugElement.query(By.css('.toggle-label'));
        expect(label).toBeTruthy();
    });

    it('should pass disabled property to slide toggle', () => {
        component.disabled = true;
        fixture.detectChanges();

        const slideToggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
        expect(slideToggle.componentInstance.disabled).toBe(true);
    });

    it('should not disable slide toggle when disabled input is false', () => {
        component.disabled = false;
        fixture.detectChanges();

        const slideToggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
        expect(slideToggle.componentInstance.disabled).toBe(false);
    });

    it('should toggle state when slide toggle is clicked', async () => {
        spyOn(component.showDetailedPricesChange, 'emit');

        fixture.detectChanges();

        const slideToggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
        const initialState = component.isDetailed();

        // Simulate click on slide toggle
        slideToggle.triggerEventHandler('change', { checked: !initialState });

        expect(component.isDetailed()).toBe(!initialState);
        expect(component.showDetailedPricesChange.emit).toHaveBeenCalledWith(!initialState);
    });

    it('should have primary color for slide toggle', () => {
        fixture.detectChanges();

        const slideToggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
        expect(slideToggle.nativeElement.getAttribute('color')).toBe('primary');
    });

    it('should have tooltip positioned above', () => {
        fixture.detectChanges();

        const slideToggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
        expect(slideToggle.nativeElement.getAttribute('matTooltipPosition')).toBe('above');
    });

    it('should update icon when state changes', () => {
        component.showDetailedPrices = false;
        component.ngOnInit();
        fixture.detectChanges();

        let iconElement = fixture.debugElement.query(By.css('.toggle-icon'));
        expect(iconElement.nativeElement.textContent.trim()).toBe('expand_more');

        component.showDetailedPrices = true;
        component.ngOnInit();
        fixture.detectChanges();

        iconElement = fixture.debugElement.query(By.css('.toggle-icon'));
        expect(iconElement.nativeElement.textContent.trim()).toBe('expand_less');
    });

    it('should update label when state changes', () => {
        component.showDetailedPrices = false;
        component.ngOnInit();
        fixture.detectChanges();

        let labelElement = fixture.debugElement.query(By.css('.toggle-label'));
        expect(labelElement.nativeElement.textContent.trim()).toBe('Show detailed breakdown');

        component.showDetailedPrices = true;
        component.ngOnInit();
        fixture.detectChanges();

        labelElement = fixture.debugElement.query(By.css('.toggle-label'));
        expect(labelElement.nativeElement.textContent.trim()).toBe('Hide detailed breakdown');
    });

    it('should call i18n service translate method with correct keys', () => {
        component.showDetailedPrices = false;
        component.ngOnInit();
        component.getToggleLabel();
        component.getTooltipText();

        expect(i18nServiceSpy.translate).toHaveBeenCalledWith('currency.expand');

        i18nServiceSpy.translate.calls.reset();

        component.showDetailedPrices = true;
        component.ngOnInit();
        component.getToggleLabel();
        component.getTooltipText();

        expect(i18nServiceSpy.translate).toHaveBeenCalledWith('currency.collapse');
    });
});