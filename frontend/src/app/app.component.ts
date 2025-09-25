import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { LootGeneratorComponent } from './components/loot-generator/loot-generator.component';
import { TranslatePipe } from './pipes/translate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LanguageSelectorComponent,
    LootGeneratorComponent,
    TranslatePipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AI Loot Generator';
}
