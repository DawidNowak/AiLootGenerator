import { Injectable, signal, computed } from '@angular/core';

export interface Translation {
    [key: string]: string | Translation;
}

export interface LanguageDefinition {
    code: string;
    label: string;
    translations: Translation;
}

@Injectable({
    providedIn: 'root'
})
export class I18nService {
    private currentLanguageSignal = signal<string>('en');
    private translationsSignal = signal<Map<string, Translation>>(new Map());

    currentLanguage = this.currentLanguageSignal.asReadonly();

    private languages: LanguageDefinition[] = [
        {
            code: 'en',
            label: 'English',
            translations: {
                'app.title': 'AI Loot Generator',
                'app.subtitle': 'Warhammer Fantasy Edition',
                'app.description': 'Generate legendary treasures and magical artifacts for your Warhammer Fantasy adventures',
                'language.selector.label': 'Language',
                'color.gold': 'Gold',
                'color.silver': 'Silver',
                'color.bronze': 'Bronze',
                'color.accent': 'Accent',
                'color.copper': 'Copper',
                'color.iron': 'Iron',
                'color.steel': 'Steel',
                'color.emerald': 'Emerald',
                'color.sapphire': 'Sapphire',
                'color.ruby': 'Ruby',
                'color.diamond': 'Diamond',
                'color.obsidian': 'Obsidian',
                'color.crystal': 'Crystal',
                'theme.warhammer': 'Warhammer Fantasy',
                'theme.description': 'Dark fantasy theme with rich gold and bronze accents',
                'button.settings': 'Settings',
                'item.legendary': 'Legendary Item',
                'item.legendary.description': 'Sample legendary treasure with golden accents and mystical properties.',
                'item.rare': 'Rare Artifact',
                'item.rare.description': 'A silver-touched item with moderate magical enchantments.',
                'item.common': 'Common Treasure',
                'item.common.description': 'Bronze-quality item suitable for beginning adventurers.'
            }
        },
        {
            code: 'pl',
            label: 'Polski',
            translations: {
                'app.title': 'Generator Skarbów AI',
                'app.subtitle': 'Edycja Warhammer Fantasy',
                'app.description': 'Generuj legendarny skarby i magiczne artefakty do twoich przygód w Warhammer Fantasy',
                'language.selector.label': 'Język',
                'color.gold': 'Złoty',
                'color.silver': 'Srebrny',
                'color.bronze': 'Brązowy',
                'color.accent': 'Akcent',
                'color.copper': 'Miedziany',
                'color.iron': 'Żelazo',
                'color.steel': 'Stal',
                'color.emerald': 'Szmaragd',
                'color.sapphire': 'Szafir',
                'color.ruby': 'Rubin',
                'color.diamond': 'Diament',
                'color.obsidian': 'Obsydian',
                'color.crystal': 'Kryształ',
                'theme.warhammer': 'Warhammer Fantasy',
                'theme.description': 'Ciemny motyw fantasy z bogatymi akcentami złota i brązu',
                'button.settings': 'Ustawienia',
                'item.legendary': 'Legendarny Przedmiot',
                'item.legendary.description': 'Przykładowy legendarny skarb ze złotymi akcentami i mistycznymi właściwościami.',
                'item.rare': 'Rzadki Artefakt',
                'item.rare.description': 'Przedmiot dotknięty srebrem z umiarkowanymi magicznymi zaklęciami.',
                'item.common': 'Pospolity Skarb',
                'item.common.description': 'Przedmiot jakości brązowej odpowiedni dla początkujących poszukiwaczy przygód.'
            }
        }
    ];

    constructor() {
        this.initializeTranslations();
        this.loadSavedLanguage();
    }

    private initializeTranslations(): void {
        const translationsMap = new Map<string, Translation>();
        this.languages.forEach(lang => {
            translationsMap.set(lang.code, lang.translations);
        });
        this.translationsSignal.set(translationsMap);
    }

    private loadSavedLanguage(): void {
        const savedLanguage = localStorage.getItem('app-language');
        if (savedLanguage && this.isValidLanguage(savedLanguage)) {
            this.currentLanguageSignal.set(savedLanguage);
        }
    }

    private isValidLanguage(code: string): boolean {
        return this.languages.some(lang => lang.code === code);
    }

    getAvailableLanguages(): LanguageDefinition[] {
        return [...this.languages];
    }

    getCurrentLanguageInfo(): LanguageDefinition | undefined {
        return this.languages.find(lang => lang.code === this.currentLanguageSignal());
    }

    switchLanguage(languageCode: string): void {
        if (this.isValidLanguage(languageCode) && languageCode !== this.currentLanguageSignal()) {
            this.currentLanguageSignal.set(languageCode);
            localStorage.setItem('app-language', languageCode);
        }
    }

    translate(key: string, params?: Record<string, string>): string {
        const currentLang = this.currentLanguageSignal();
        const translations = this.translationsSignal().get(currentLang);

        if (!translations) {
            console.warn(`No translations found for language: ${currentLang}`);
            return key;
        }

        const translation = this.getNestedTranslation(translations, key);

        if (typeof translation !== 'string') {
            console.warn(`Translation not found for key: ${key} in language: ${currentLang}`);
            return key;
        }

        return params ? this.interpolateParams(translation, params) : translation;
    }

    private getNestedTranslation(translations: Translation, key: string): string | Translation {
        // First try direct key lookup (for flat structure like 'app.title')
        if (key in translations) {
            return translations[key];
        }

        // If not found, try nested lookup (for future nested structure support)
        const keys = key.split('.');
        let current: string | Translation = translations;

        for (const k of keys) {
            if (typeof current === 'object' && current !== null && k in current) {
                current = current[k];
            } else {
                return key; // Return the key if translation not found
            }
        }

        return current;
    }

    private interpolateParams(text: string, params: Record<string, string>): string {
        return Object.keys(params).reduce((result, key) => {
            const placeholder = `{{${key}}}`;
            return result.replace(new RegExp(placeholder, 'g'), params[key]);
        }, text);
    }

    // Computed signal for reactive translations
    createTranslation(key: string) {
        return computed(() => this.translate(key));
    }
}