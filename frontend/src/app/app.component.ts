import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { WealthSelectorComponent } from './components/wealth-selector/wealth-selector.component';
import { LocationInputComponent } from './components/location-input/location-input.component';
import { GenerateButtonComponent } from './components/generate-button/generate-button.component';
import { CooldownTimerComponent } from './components/cooldown-timer/cooldown-timer.component';
import { ErrorMessageComponent, ErrorInfo } from './components/error-message/error-message.component';
import { TranslatePipe } from './pipes/translate.pipe';
import { WealthLevel } from './models/wealth-level.enum';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LanguageSelectorComponent,
    WealthSelectorComponent,
    LocationInputComponent,
    GenerateButtonComponent,
    CooldownTimerComponent,
    ErrorMessageComponent,
    TranslatePipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy {
  title = 'AI Loot Generator';

  // Component state for demonstration
  selectedWealthLevel = signal<WealthLevel>(WealthLevel.Common);
  locationValue = signal<string>('');
  locationValid = signal<boolean>(false);

  // Generation state
  isGenerating = signal<boolean>(false);
  cooldownRemaining = signal<number>(0);
  currentError = signal<ErrorInfo | null>(null);

  private cooldownTimer: number | null = null;

  onWealthLevelChange(wealthLevel: WealthLevel): void {
    this.selectedWealthLevel.set(wealthLevel);
    console.log('Wealth level changed to:', wealthLevel);
  }

  onLocationChange(location: string): void {
    this.locationValue.set(location);
    console.log('Location changed to:', location);
  }

  onLocationValidationChange(isValid: boolean): void {
    this.locationValid.set(isValid);
    console.log('Location valid:', isValid);
  }

  onGenerateClick(): void {
    // Clear any existing error
    this.currentError.set(null);

    // Check if we're in cooldown
    if (this.cooldownRemaining() > 0) {
      console.log('Still in cooldown, cannot generate');
      return;
    }

    // Check if form is valid
    if (!this.locationValid()) {
      this.currentError.set({
        message: 'validation.required',
        type: 'warning',
        code: 'FORM_INVALID',
        retryable: false
      });
      return;
    }

    // Start generation process
    this.isGenerating.set(true);
    console.log('Starting loot generation with:', {
      wealthLevel: this.selectedWealthLevel(),
      location: this.locationValue()
    });

    // Simulate generation process
    setTimeout(() => {
      this.isGenerating.set(false);

      // Simulate random success/failure for demo
      const success = Math.random() > 0.3; // 70% success rate

      if (success) {
        console.log('Generation successful!');
        this.startCooldown();
      } else {
        this.currentError.set({
          message: 'network.failed',
          type: 'error',
          code: 'GEN_001',
          details: 'Failed to connect to the loot generation service. Please check your internet connection and try again.',
          timestamp: new Date(),
          retryable: true
        });
      }
    }, 2000 + Math.random() * 3000); // 2-5 seconds
  }

  onErrorDismiss(): void {
    this.currentError.set(null);
  }

  onErrorRetry(): void {
    this.currentError.set(null);
    this.onGenerateClick();
  }

  private startCooldown(): void {
    const cooldownTime = 30000; // 30 seconds
    this.cooldownRemaining.set(cooldownTime);

    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }

    this.cooldownTimer = window.setInterval(() => {
      const remaining = this.cooldownRemaining();
      if (remaining <= 0) {
        if (this.cooldownTimer) {
          clearInterval(this.cooldownTimer);
          this.cooldownTimer = null;
        }
        return;
      }

      this.cooldownRemaining.set(Math.max(0, remaining - 100));
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }
}
