import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface ErrorInfo {
    message: string;
    type: 'error' | 'warning' | 'info';
    code?: string;
    details?: string;
    timestamp?: Date;
    retryable?: boolean;
}

@Component({
    selector: 'app-error-message',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        TranslatePipe
    ],
    templateUrl: './error-message.component.html',
    styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
    @Input() error: ErrorInfo | null = null;
    @Input() showDetails = false;
    @Input() allowDismiss = true;
    @Input() allowRetry = true;
    @Input() inline = false; // true for inline display, false for card/toast style

    @Output() dismiss = new EventEmitter<void>();
    @Output() retry = new EventEmitter<void>();
    @Output() toggleDetails = new EventEmitter<boolean>();

    constructor(private i18nService: I18nService) { }

    // Methods for reactive behavior (instead of computed for test compatibility)
    isVisible(): boolean {
        return this.error !== null;
    }

    errorIcon(): string {
        if (!this.error) return 'info';

        switch (this.error.type) {
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            default:
                return 'error';
        }
    }

    errorClass(): string {
        if (!this.error) return 'error';
        return this.error.type;
    }

    displayMessage(): string {
        if (!this.error) return '';

        // Try to translate the error message if it's a known error key
        const translated = this.i18nService.translate(`error.${this.error.message}`);

        // If translation returns the same key (not found), use original message
        if (translated === `error.${this.error.message}`) {
            return this.error.message;
        }

        return translated;
    }

    displayTitle(): string {
        if (!this.error) return '';

        switch (this.error.type) {
            case 'error':
                return this.i18nService.translate('error.title.error');
            case 'warning':
                return this.i18nService.translate('error.title.warning');
            case 'info':
                return this.i18nService.translate('error.title.info');
            default:
                return this.i18nService.translate('error.title.error');
        }
    }

    formattedTimestamp(): string {
        if (!this.error?.timestamp) return '';

        return this.error.timestamp.toLocaleTimeString();
    }

    showRetryButton(): boolean {
        return this.allowRetry && this.error?.retryable === true;
    }

    onDismissClick(): void {
        if (this.allowDismiss) {
            this.dismiss.emit();
        }
    }

    onRetryClick(): void {
        if (this.allowRetry && this.error?.retryable) {
            this.retry.emit();
        }
    }

    onToggleDetails(): void {
        const newState = !this.showDetails;
        this.toggleDetails.emit(newState);
    }
}