import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CooldownTimerComponent } from './cooldown-timer.component';
import { I18nService } from '../../services/i18n.service';
import { signal } from '@angular/core';

describe('CooldownTimerComponent', () => {
    let component: CooldownTimerComponent;
    let fixture: ComponentFixture<CooldownTimerComponent>;
    let mockI18nService: jasmine.SpyObj<I18nService>;

    beforeEach(async () => {
        const i18nServiceSpy = jasmine.createSpyObj('I18nService', ['translate'], {
            currentLanguage: signal('en')
        });

        await TestBed.configureTestingModule({
            imports: [
                CooldownTimerComponent,
                NoopAnimationsModule
            ],
            providers: [
                { provide: I18nService, useValue: i18nServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CooldownTimerComponent);
        component = fixture.componentInstance;
        mockI18nService = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;

        // Mock translation returns
        mockI18nService.translate.and.callFake((key: string, params?: Record<string, string>) => {
            const translations: Record<string, string> = {
                'cooldown.title': 'Generation Cooldown',
                'cooldown.subtitle': 'Please wait before generating again',
                'cooldown.ready': 'Ready',
                'cooldown.seconds': `${params?.['seconds'] || '0'}s`,
                'cooldown.minutes.seconds': `${params?.['minutes'] || '0'}:${params?.['seconds'] || '00'}`
            };
            return translations[key] || key;
        });

        fixture.detectChanges();
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display ready state when no remaining time', () => {
        component.remainingTime = 0;
        fixture.detectChanges();

        expect(component.isActive()).toBe(false);
        expect(component.displayText()).toBe('Ready');
        expect(component.statusIcon()).toBe('check_circle');
        expect(component.statusClass()).toBe('ready');
    });

    it('should display active state with remaining time', () => {
        component.remainingTime = 20000; // 20 seconds (should be active, not warning)
        fixture.detectChanges();

        expect(component.isActive()).toBe(true);
        expect(component.remainingSeconds()).toBe(20);
        expect(component.displayText()).toBe('20s');
        expect(component.statusIcon()).toBe('timer');
        expect(component.statusClass()).toBe('active');
    });

    it('should calculate minutes and seconds correctly', () => {
        component.remainingTime = 125000; // 125 seconds = 2 minutes 5 seconds
        fixture.detectChanges();

        expect(component.remainingMinutes()).toBe(2);
        expect(component.remainingSecondsInMinute()).toBe(5);
        expect(component.displayText()).toBe('2:05');
    });

    it('should show warning status for 15 seconds or less', () => {
        component.remainingTime = 12000; // 12 seconds
        fixture.detectChanges();

        expect(component.statusClass()).toBe('warning');
    });

    it('should show urgent status for 5 seconds or less', () => {
        component.remainingTime = 3000; // 3 seconds
        fixture.detectChanges();

        expect(component.statusClass()).toBe('urgent');
    });

    it('should calculate progress percentage correctly', () => {
        component.totalTime = 30000;
        component.remainingTime = 15000; // Half way through
        fixture.detectChanges();

        expect(component.progressPercentage()).toBe(50);
    });

    it('should handle zero total time gracefully', () => {
        component.totalTime = 0;
        component.remainingTime = 5000;
        fixture.detectChanges();

        expect(component.progressPercentage()).toBe(0);
    });

    it('should round up seconds correctly', () => {
        component.remainingTime = 3100; // 3.1 seconds
        fixture.detectChanges();

        expect(component.remainingSeconds()).toBe(4); // Should round up
    });

    it('should handle negative remaining time', () => {
        component.totalTime = 30000;
        component.remainingTime = -1000; // Negative time
        fixture.detectChanges();

        expect(component.progressPercentage()).toBe(100);
        expect(component.isActive()).toBe(false);
    });

    it('should show full card when not in compact mode and active', () => {
        component.compact = false;
        component.remainingTime = 10000;
        fixture.detectChanges();

        const cardElement = fixture.nativeElement.querySelector('.cooldown-card');
        const compactElement = fixture.nativeElement.querySelector('.cooldown-compact');

        expect(cardElement).toBeTruthy();
        expect(compactElement).toBeFalsy();
    });

    it('should show compact display when in compact mode and active', () => {
        component.compact = true;
        component.remainingTime = 10000;
        fixture.detectChanges();

        const cardElement = fixture.nativeElement.querySelector('.cooldown-card');
        const compactElement = fixture.nativeElement.querySelector('.cooldown-compact');

        expect(cardElement).toBeFalsy();
        expect(compactElement).toBeTruthy();
    });

    it('should show ready state for both compact and full modes when inactive', () => {
        component.remainingTime = 0;

        // Test full mode
        component.compact = false;
        fixture.detectChanges();
        let readyElement = fixture.nativeElement.querySelector('.cooldown-ready');
        expect(readyElement).toBeTruthy();
        expect(readyElement.classList.contains('compact')).toBe(false);

        // Test compact mode
        component.compact = true;
        fixture.detectChanges();
        readyElement = fixture.nativeElement.querySelector('.cooldown-ready');
        expect(readyElement).toBeTruthy();
        expect(readyElement.classList.contains('compact')).toBe(true);
    });

    it('should hide progress when showProgress is false', () => {
        component.showProgress = false;
        component.compact = false;
        component.remainingTime = 10000;
        fixture.detectChanges();

        const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
        expect(progressBar).toBeFalsy();
    });

    it('should hide icons when showIcon is false', () => {
        component.showIcon = false;
        component.remainingTime = 10000;
        fixture.detectChanges();

        const icon = fixture.nativeElement.querySelector('mat-icon');
        expect(icon).toBeFalsy();
    });

    it('should format display text with proper translation keys', () => {
        // Test seconds only
        component.remainingTime = 45000; // 45 seconds
        fixture.detectChanges();
        expect(mockI18nService.translate).toHaveBeenCalledWith('cooldown.seconds', { seconds: '45' });

        // Test minutes and seconds
        component.remainingTime = 125000; // 2 minutes 5 seconds
        fixture.detectChanges();
        expect(mockI18nService.translate).toHaveBeenCalledWith('cooldown.minutes.seconds', {
            minutes: '2',
            seconds: '05'
        });
    });

    it('should pad seconds with zero when displaying minutes:seconds format', () => {
        component.remainingTime = 65000; // 1 minute 5 seconds
        fixture.detectChanges();

        expect(mockI18nService.translate).toHaveBeenCalledWith('cooldown.minutes.seconds', {
            minutes: '1',
            seconds: '05'
        });
    });

    // Note: Testing the actual interval behavior would require more complex setup
    // For now, we test the logic and computed values
    it('should have timer interval setup logic', () => {
        expect(component['setupInterval']).toBeDefined();
        expect(component['clearInterval']).toBeDefined();
    });

    it('should clean up interval on destroy', () => {
        spyOn(component as any, 'clearInterval');
        component.ngOnDestroy();
        expect(component['clearInterval']).toHaveBeenCalled();
    });

    describe('UI Simplification Requirements', () => {
        it('should use mat-progress-bar instead of custom display', () => {
            component.remainingTime = 15000;
            component.totalTime = 30000;
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const progressBar = compiled.querySelector('mat-progress-bar');
            expect(progressBar).toBeTruthy();

            // Should not have complex custom timer display
            const customTimer = compiled.querySelector('.complex-custom-timer');
            expect(customTimer).toBeFalsy();
        });

        it('should show simple text display with progress bar', () => {
            component.remainingTime = 15000;
            component.totalTime = 30000;
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const textDisplay = compiled.querySelector('.time-value, .compact-text, .ready-text');
            const progressBar = compiled.querySelector('mat-progress-bar, .compact-progress');

            expect(textDisplay).toBeTruthy();
            expect(progressBar).toBeTruthy();
        });

        it('should have simplified styling without decorative elements', () => {
            component.remainingTime = 10000;
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;

            // Should not have decorative icons or complex cards
            const decorativeIcons = compiled.querySelectorAll('mat-icon:not(.status-icon)');
            const complexCard = compiled.querySelector('mat-card.complex-timer-card');

            expect(decorativeIcons.length).toBe(0);
            expect(complexCard).toBeFalsy();
        });
    });
});