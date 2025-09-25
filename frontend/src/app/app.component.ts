import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { WealthSelectorComponent } from './components/wealth-selector/wealth-selector.component';
import { LocationInputComponent } from './components/location-input/location-input.component';
import { GenerateButtonComponent } from './components/generate-button/generate-button.component';
import { CooldownTimerComponent } from './components/cooldown-timer/cooldown-timer.component';
import { ErrorMessageComponent, ErrorInfo } from './components/error-message/error-message.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { LootItemComponent } from './components/loot-item/loot-item.component';
import { LootListComponent } from './components/loot-list/loot-list.component';
import { PriceToggleComponent } from './components/price-toggle/price-toggle.component';
import { TranslatePipe } from './pipes/translate.pipe';
import { WealthLevel } from './models/wealth-level.enum';
import { LootItem } from './models/loot-item.interface';

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
    LoadingSpinnerComponent,
    LootItemComponent,
    LootListComponent,
    PriceToggleComponent,
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

  // Sample loot items for demonstration
  sampleLootItems = signal<LootItem[]>([
    {
      name: 'Enchanted Sword of Ubersreik',
      description: 'A beautifully crafted longsword with intricate engravings depicting the coat of arms of Ubersreik. The blade gleams with a faint magical aura and seems to hum with power when drawn.',
      valueInPennies: 1440, // 6 gold crowns
      wealthLevel: WealthLevel.Wealthy
    },
    {
      name: 'Tattered Merchant\'s Purse',
      description: 'A worn leather purse containing a few copper coins and lint. Smells faintly of old cheese and disappointment.',
      valueInPennies: 8, // 8 pennies
      wealthLevel: WealthLevel.Rubbish
    },
    {
      name: 'Sigmarite Holy Symbol',
      description: 'A silver hammer pendant blessed by the priests of Altdorf. The twin-tailed comet gleams with divine light and provides comfort to the faithful.',
      valueInPennies: 120, // 10 shillings
      wealthLevel: WealthLevel.Common
    },
    {
      name: 'Crown of the Elector Count',
      description: 'An ornate golden crown adorned with precious gems and blessed by the most holy priests. This artifact once belonged to a noble ruler of the Empire and radiates power.',
      valueInPennies: 4800, // 20 gold crowns
      wealthLevel: WealthLevel.Noble
    }
  ]);

  showPriceDetails = signal<boolean>(true);

  // LootList demo state
  listDemoItems = signal<LootItem[]>([]);
  listDemoLoading = signal<boolean>(false);
  showListPrices = signal<boolean>(true);
  showListFullBreakdown = signal<boolean>(false);

  // Loading spinner demo state
  spinnerDemoLoading = signal<boolean>(false);
  spinnerDemoSize = signal<number>(50);
  spinnerDemoColor: 'primary' | 'accent' | 'warn' = 'primary';

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

  togglePriceDetails(): void {
    this.showPriceDetails.set(!this.showPriceDetails());
  }

  onPriceToggleChange(showDetailed: boolean): void {
    this.showPriceDetails.set(showDetailed);
    console.log('Price display mode changed to:', showDetailed ? 'detailed' : 'simple');
  }

  addRandomLootItem(): void {
    const randomItems: LootItem[] = [
      {
        name: 'Rusty Dagger of Middenheim',
        description: 'A simple iron dagger with a worn wooden handle. Shows signs of extensive use but still holds an edge.',
        valueInPennies: 36,
        wealthLevel: WealthLevel.Poor
      },
      {
        name: 'Wizard\'s Tome of Shadows',
        description: 'An ancient spellbook bound in dark leather and sealed with arcane sigils. The pages seem to whisper forbidden knowledge.',
        valueInPennies: 2880,
        wealthLevel: WealthLevel.Noble
      },
      {
        name: 'Merchant\'s Scales',
        description: 'A set of brass scales used by traders to weigh precious goods. Well-maintained and accurate.',
        valueInPennies: 180,
        wealthLevel: WealthLevel.Common
      },
      {
        name: 'Broken Wagon Wheel',
        description: 'A weathered wooden wheel from an old cart. One spoke is cracked and the iron rim is rusted.',
        valueInPennies: 4,
        wealthLevel: WealthLevel.Rubbish
      },
      {
        name: 'Noble\'s Silk Gloves',
        description: 'Exquisite white silk gloves embroidered with golden thread and tiny pearls. Made for the highest nobility.',
        valueInPennies: 960,
        wealthLevel: WealthLevel.Wealthy
      }
    ];

    const randomItem = randomItems[Math.floor(Math.random() * randomItems.length)];
    const currentItems = this.sampleLootItems();
    this.sampleLootItems.set([...currentItems, randomItem]);
  }

  clearLootItems(): void {
    this.sampleLootItems.set([]);
  }

  // LootList demo methods
  loadListDemo(): void {
    this.listDemoLoading.set(true);
    this.listDemoItems.set([]);

    // Simulate API call
    setTimeout(() => {
      const demoItems: LootItem[] = [
        {
          name: 'Reikland Infantry Sword',
          description: 'A standard-issue blade carried by soldiers of the Reikland state army. Well-balanced and functional.',
          valueInPennies: 240,
          wealthLevel: WealthLevel.Common
        },
        {
          name: 'Jade Wizard\'s Amulet',
          description: 'A small jade pendant carved with nature symbols. It feels warm to the touch and smells of fresh earth.',
          valueInPennies: 1200,
          wealthLevel: WealthLevel.Wealthy
        },
        {
          name: 'Peasant\'s Wooden Bowl',
          description: 'A simple carved wooden bowl used for eating gruel. Stained and worn from years of use.',
          valueInPennies: 2,
          wealthLevel: WealthLevel.Rubbish
        },
        {
          name: 'Emperor\'s Seal Ring',
          description: 'An ornate gold ring bearing the imperial seal. Only the highest nobles are permitted to wear such regalia.',
          valueInPennies: 6000,
          wealthLevel: WealthLevel.Noble
        }
      ];

      this.listDemoItems.set(demoItems);
      this.listDemoLoading.set(false);
    }, 1500);
  }

  clearListDemo(): void {
    this.listDemoItems.set([]);
  }

  toggleListPrices(): void {
    this.showListPrices.set(!this.showListPrices());
  }

  toggleListFullBreakdown(): void {
    this.showListFullBreakdown.set(!this.showListFullBreakdown());
  }

  // Loading spinner demo methods
  toggleSpinnerDemo(): void {
    if (this.spinnerDemoLoading()) {
      this.spinnerDemoLoading.set(false);
    } else {
      this.spinnerDemoLoading.set(true);
      // Auto-stop after 3 seconds for demo
      setTimeout(() => {
        this.spinnerDemoLoading.set(false);
      }, 3000);
    }
  }

  cycleSpinnerSize(): void {
    const sizes = [30, 50, 80, 120];
    const currentIndex = sizes.indexOf(this.spinnerDemoSize());
    const nextIndex = (currentIndex + 1) % sizes.length;
    this.spinnerDemoSize.set(sizes[nextIndex]);
  }

  cycleSpinnerColor(): void {
    const colors: Array<'primary' | 'accent' | 'warn'> = ['primary', 'accent', 'warn'];
    const currentIndex = colors.indexOf(this.spinnerDemoColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    this.spinnerDemoColor = colors[nextIndex];
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
