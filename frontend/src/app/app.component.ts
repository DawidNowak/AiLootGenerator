import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { WealthSelectorComponent } from './components/wealth-selector/wealth-selector.component';
import { LocationInputComponent } from './components/location-input/location-input.component';
import { TranslatePipe } from './pipes/translate.pipe';
import { WealthLevel } from './models/wealth-level.enum';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LanguageSelectorComponent, WealthSelectorComponent, LocationInputComponent, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AI Loot Generator';

  // Component state for demonstration
  selectedWealthLevel = signal<WealthLevel>(WealthLevel.Common);
  locationValue = signal<string>('');
  locationValid = signal<boolean>(false);

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
}
