import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'app-generate-button',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatIconModule,
        TranslatePipe
    ],
    templateUrl: './generate-button.component.html',
    styleUrl: './generate-button.component.scss'
})
export class GenerateButtonComponent {
    @Input() isLoading = false;
    @Input() isDisabled = false;
    @Input() cooldownRemaining = 0;
    @Output() generateClick = new EventEmitter<void>();

    constructor(private i18nService: I18nService) { }

    // Methods for reactive behavior (not computed for test compatibility)
    buttonText(): string {
        if (this.cooldownRemaining > 0) {
            const seconds = Math.ceil(this.cooldownRemaining / 1000);
            return this.i18nService.translate('common.cooldown', { seconds: seconds.toString() });
        }

        if (this.isLoading) {
            return this.i18nService.translate('common.generating');
        }

        return this.i18nService.translate('common.generate');
    }

    buttonIcon(): string {
        if (this.cooldownRemaining > 0) {
            return 'timer';
        }

        if (this.isLoading) {
            return 'refresh';
        }

        return 'casino'; // dice/treasure icon
    }

    isButtonDisabled(): boolean {
        return this.isDisabled || this.isLoading || this.cooldownRemaining > 0;
    }

    onGenerateClick(): void {
        if (!this.isButtonDisabled()) {
            this.generateClick.emit();
        }
    }
}