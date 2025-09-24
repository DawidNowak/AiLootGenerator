import { Component, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { I18nService, LanguageDefinition } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'app-language-selector',
    standalone: true,
    imports: [
        CommonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        TranslatePipe
    ],
    templateUrl: './language-selector.component.html',
    styleUrl: './language-selector.component.scss'
})
export class LanguageSelectorComponent implements OnInit {
    languages: LanguageDefinition[] = [];
    currentLanguage = computed(() => this.i18nService.currentLanguage());

    constructor(private i18nService: I18nService) {
        // React to language changes
        effect(() => {
            const currentLang = this.currentLanguage();
        });
    }

    ngOnInit(): void {
        this.languages = this.i18nService.getAvailableLanguages();
    }

    onLanguageChange(newLanguageCode: string): void {
        this.i18nService.switchLanguage(newLanguageCode);
    }

    getCurrentLanguageLabel(): string {
        const current = this.i18nService.getCurrentLanguageInfo();
        return current ? current.label : 'Language';
    }
}