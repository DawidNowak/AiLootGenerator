import { Component, Input, computed, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'app-cooldown-timer',
    standalone: true,
    imports: [
        CommonModule,
        MatProgressBarModule,
        MatIconModule,
        MatCardModule,
        TranslatePipe
    ],
    templateUrl: './cooldown-timer.component.html',
    styleUrl: './cooldown-timer.component.scss'
})
export class CooldownTimerComponent implements OnDestroy {
    @Input() set remainingTime(value: number) {
        this.remainingTimeSignal.set(value);
    }

    @Input() totalTime = 30000; // 30 seconds default
    @Input() showProgress = true;
    @Input() showIcon = true;
    @Input() compact = false;

    private remainingTimeSignal = signal<number>(0);
    private intervalId: number | null = null;

    constructor(private i18nService: I18nService) {
        // Set up interval when remaining time changes
        effect(() => {
            const remaining = this.remainingTimeSignal();
            this.setupInterval(remaining);
        });
    }

    ngOnDestroy(): void {
        this.clearInterval();
    }

    // Methods for reactive display (instead of computed for test compatibility)
    remainingSeconds(): number {
        return Math.ceil(this.remainingTimeSignal() / 1000);
    }

    remainingMinutes(): number {
        return Math.floor(this.remainingSeconds() / 60);
    }

    remainingSecondsInMinute(): number {
        return this.remainingSeconds() % 60;
    }

    progressPercentage(): number {
        const remaining = this.remainingTimeSignal();
        if (this.totalTime <= 0) return 0;
        return Math.max(0, Math.min(100, ((this.totalTime - remaining) / this.totalTime) * 100));
    }

    isActive(): boolean {
        return this.remainingTimeSignal() > 0;
    }

    displayText(): string {
        const minutes = this.remainingMinutes();
        const seconds = this.remainingSecondsInMinute();

        if (!this.isActive()) {
            return this.i18nService.translate('cooldown.ready');
        }

        if (minutes > 0) {
            return this.i18nService.translate('cooldown.minutes.seconds', {
                minutes: minutes.toString(),
                seconds: seconds.toString().padStart(2, '0')
            });
        }

        return this.i18nService.translate('cooldown.seconds', {
            seconds: seconds.toString()
        });
    }

    statusIcon(): string {
        return this.isActive() ? 'timer' : 'check_circle';
    }

    statusClass(): string {
        if (!this.isActive()) return 'ready';
        const seconds = this.remainingSeconds();
        if (seconds <= 5) return 'urgent';
        if (seconds <= 15) return 'warning';
        return 'active';
    }

    private setupInterval(remainingTime: number): void {
        this.clearInterval();

        if (remainingTime > 0) {
            this.intervalId = window.setInterval(() => {
                const current = this.remainingTimeSignal();
                if (current <= 0) {
                    this.clearInterval();
                    return;
                }

                const next = Math.max(0, current - 100); // Update every 100ms
                this.remainingTimeSignal.set(next);
            }, 100);
        }
    }

    private clearInterval(): void {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}