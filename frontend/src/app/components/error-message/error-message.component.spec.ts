import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorMessageComponent, ErrorInfo } from './error-message.component';
import { I18nService } from '../../services/i18n.service';
import { signal } from '@angular/core';

describe('ErrorMessageComponent', () => {
    let component: ErrorMessageComponent;
    let fixture: ComponentFixture<ErrorMessageComponent>;
    let mockI18nService: jasmine.SpyObj<I18nService>;

    beforeEach(async () => {
        const i18nServiceSpy = jasmine.createSpyObj('I18nService', ['translate'], {
            currentLanguage: signal('en')
        });

        await TestBed.configureTestingModule({
            imports: [
                ErrorMessageComponent,
                NoopAnimationsModule
            ],
            providers: [
                { provide: I18nService, useValue: i18nServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorMessageComponent);
        component = fixture.componentInstance;
        mockI18nService = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;

        // Mock translation returns
        mockI18nService.translate.and.callFake((key: string) => {
            const translations: Record<string, string> = {
                'error.title.error': 'Error',
                'error.title.warning': 'Warning',
                'error.title.info': 'Information',
                'error.code': 'Code',
                'error.details.label': 'Details',
                'error.details.show': 'Show Details',
                'error.details.hide': 'Hide Details',
                'error.occurred.at': 'Occurred at',
                'error.action.retry': 'Retry',
                'error.action.dismiss': 'Dismiss',
                'error.network.failed': 'Network request failed',
                'error.validation.required': 'This field is required'
            };
            return translations[key] || key;
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not be visible when no error', () => {
        component.error = null;
        fixture.detectChanges();

        expect(component.isVisible()).toBe(false);
    });

    it('should be visible when error is provided', () => {
        const error: ErrorInfo = {
            message: 'Test error',
            type: 'error'
        };
        component.error = error;
        fixture.detectChanges();

        expect(component.isVisible()).toBe(true);
    });

    it('should display correct icon for error type', () => {
        const errorTypes: Array<{ type: ErrorInfo['type'], expectedIcon: string }> = [
            { type: 'error', expectedIcon: 'error' },
            { type: 'warning', expectedIcon: 'warning' },
            { type: 'info', expectedIcon: 'info' }
        ];

        errorTypes.forEach(({ type, expectedIcon }) => {
            component.error = { message: 'Test', type };
            fixture.detectChanges(); // Trigger change detection
            expect(component.errorIcon()).toBe(expectedIcon);
        });
    });

    it('should display correct title for error type', () => {
        const error: ErrorInfo = { message: 'Test', type: 'error' };
        component.error = error;
        fixture.detectChanges();

        expect(component.displayTitle()).toBe('Error');
        expect(mockI18nService.translate).toHaveBeenCalledWith('error.title.error');
    });

    it('should translate known error messages', () => {
        const error: ErrorInfo = {
            message: 'network.failed',
            type: 'error'
        };
        component.error = error;
        fixture.detectChanges();

        expect(component.displayMessage()).toBe('Network request failed');
        expect(mockI18nService.translate).toHaveBeenCalledWith('error.network.failed');
    });

    it('should use original message for unknown error keys', () => {
        const error: ErrorInfo = {
            message: 'Custom error message',
            type: 'error'
        };
        component.error = error;
        fixture.detectChanges();

        expect(component.displayMessage()).toBe('Custom error message');
    });

    it('should format timestamp correctly', () => {
        const testDate = new Date('2023-01-01T12:30:45');
        const error: ErrorInfo = {
            message: 'Test error',
            type: 'error',
            timestamp: testDate
        };
        component.error = error;
        fixture.detectChanges();

        const formatted = component.formattedTimestamp();
        expect(formatted).toBe(testDate.toLocaleTimeString());
    });

    it('should show retry button only when retryable', () => {
        // Not retryable
        component.error = { message: 'Test', type: 'error', retryable: false };
        component.allowRetry = true;
        fixture.detectChanges(); // Trigger change detection
        expect(component.showRetryButton()).toBe(false);

        // Retryable
        component.error = { message: 'Test', type: 'error', retryable: true };
        component.allowRetry = true;
        fixture.detectChanges(); // Trigger change detection
        expect(component.showRetryButton()).toBe(true);

        // allowRetry disabled
        component.allowRetry = false;
        fixture.detectChanges(); // Trigger change detection
        expect(component.showRetryButton()).toBe(false);
    });

    it('should emit dismiss event when dismiss is clicked', () => {
        spyOn(component.dismiss, 'emit');
        component.allowDismiss = true;

        component.onDismissClick();

        expect(component.dismiss.emit).toHaveBeenCalled();
    });

    it('should not emit dismiss when allowDismiss is false', () => {
        spyOn(component.dismiss, 'emit');
        component.allowDismiss = false;

        component.onDismissClick();

        expect(component.dismiss.emit).not.toHaveBeenCalled();
    });

    it('should emit retry event when retry is clicked', () => {
        spyOn(component.retry, 'emit');
        component.error = { message: 'Test', type: 'error', retryable: true };
        component.allowRetry = true;

        component.onRetryClick();

        expect(component.retry.emit).toHaveBeenCalled();
    });

    it('should not emit retry when not retryable', () => {
        spyOn(component.retry, 'emit');
        component.error = { message: 'Test', type: 'error', retryable: false };
        component.allowRetry = true;

        component.onRetryClick();

        expect(component.retry.emit).not.toHaveBeenCalled();
    });

    it('should emit toggle details event', () => {
        spyOn(component.toggleDetails, 'emit');
        component.showDetails = false;

        component.onToggleDetails();

        expect(component.toggleDetails.emit).toHaveBeenCalledWith(true);
    });

    it('should show card display when not inline', () => {
        component.inline = false;
        component.error = { message: 'Test', type: 'error' };
        fixture.detectChanges();

        const cardElement = fixture.nativeElement.querySelector('.error-card');
        const inlineElement = fixture.nativeElement.querySelector('.error-inline');

        expect(cardElement).toBeTruthy();
        expect(inlineElement).toBeFalsy();
    });

    it('should show inline display when inline', () => {
        component.inline = true;
        component.error = { message: 'Test', type: 'error' };
        fixture.detectChanges();

        const cardElement = fixture.nativeElement.querySelector('.error-card');
        const inlineElement = fixture.nativeElement.querySelector('.error-inline');

        expect(cardElement).toBeFalsy();
        expect(inlineElement).toBeTruthy();
    });

    it('should show error code when provided', () => {
        component.error = {
            message: 'Test error',
            type: 'error',
            code: 'ERR_001'
        };
        fixture.detectChanges();

        const codeElement = fixture.nativeElement.querySelector('.error-code, .inline-code');
        expect(codeElement).toBeTruthy();
        expect(codeElement.textContent).toContain('ERR_001');
    });

    it('should show details when showDetails is true', () => {
        component.error = {
            message: 'Test error',
            type: 'error',
            details: 'Detailed error information'
        };
        component.showDetails = true;
        fixture.detectChanges();

        const detailsElement = fixture.nativeElement.querySelector('.error-details');
        expect(detailsElement).toBeTruthy();
        expect(detailsElement.textContent).toContain('Detailed error information');
    });

    it('should not show details when showDetails is false', () => {
        component.error = {
            message: 'Test error',
            type: 'error',
            details: 'Detailed error information'
        };
        component.showDetails = false;
        fixture.detectChanges();

        const detailsElement = fixture.nativeElement.querySelector('.error-details');
        expect(detailsElement).toBeFalsy();
    });

    it('should show timestamp when provided', () => {
        const testDate = new Date('2023-01-01T12:30:45');
        component.error = {
            message: 'Test error',
            type: 'error',
            timestamp: testDate
        };
        fixture.detectChanges();

        const timestampElement = fixture.nativeElement.querySelector('.error-timestamp');
        expect(timestampElement).toBeTruthy();
        expect(timestampElement.textContent).toContain(testDate.toLocaleTimeString());
    });

    it('should apply correct CSS classes for error types', () => {
        const types: ErrorInfo['type'][] = ['error', 'warning', 'info'];

        types.forEach(type => {
            component.error = { message: 'Test', type };
            fixture.detectChanges(); // Trigger change detection

            const errorElement = fixture.nativeElement.querySelector('.error-message');
            expect(errorElement.classList).toContain(`type-${type}`);
        });
    });
});