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
                'app.title': 'Loot Generator',
                'language.selector.label': 'Language',
                'wealth.label': 'Wealth Level',
                'wealth.rubbish': 'Rubbish',
                'wealth.poor': 'Poor',
                'wealth.common': 'Common',
                'wealth.wealthy': 'Wealthy',
                'wealth.noble': 'Noble',
                'wealth.treasure': 'Treasure',
                'wealth.rubbish.description': '< 1 shilling - Scraps and trinkets',
                'wealth.poor.description': '1-5 shillings - Simple items and tools',
                'wealth.common.description': '5-20 shillings - Standard equipment and goods',
                'wealth.wealthy.description': '1-5 crowns - Valuable items',
                'wealth.noble.description': '5-15 crowns - Luxury goods and commodities',
                'wealth.treasure.description': '> 15 crowns - The most precious treasures',
                'location.label': 'Location',
                'location.placeholder': 'Enter location (e.g., "Ubersreik barracks", "Altdorf marketplace")',
                'validation.location.required': 'Location is required',
                'validation.location.tooLong': 'Location must not exceed 200 characters',
                'button.generate.description': 'Generate thematic loot for your location',
                'common.generate': 'Generate Loot',
                'common.generating': 'Generating...',
                'common.cooldown.wait': 'Wait',
                'cooldown.title': 'Generation Cooldown',
                'cooldown.subtitle': 'Please wait before generating again',
                'cooldown.ready': 'Ready',
                'cooldown.seconds': '{{seconds}}s',
                'cooldown.minutes.seconds': '{{minutes}}:{{seconds}}',
                'cooldown.remaining': 'Cooldown remaining',
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
                'errors.serverError': 'Server encountered an error. Please try again later.',
                'form.location.title': 'Location',
                'loot.generation.title': 'Generate Loot',
                'loot.generation.subtitle': 'Provide where your party found the loot and press Generate',
                'item.value': 'Value',
                'loot.list.title': 'Generated Loot',
                'loot.list.loading': 'Generating loot items...',
                'loot.list.empty': 'No loot items generated yet',
                'loot.list.emptyHint': 'Click the "Generate Loot" button to create thematic items for your location',
                'loot.empty.title': 'Ready to Generate Loot',
                'loot.empty.description': 'Enter a location and select a wealth level to generate thematic treasures for your Warhammer Fantasy adventure',
                'loot.prices.toggle': 'Show Prices',
            }
        },
        {
            code: 'pl',
            label: 'Polski',
            translations: {
                'app.title': 'Generator Skarbów AI',
                'language.selector.label': 'Język',
                'wealth.label': 'Poziom Bogactwa',
                'wealth.rubbish': 'Śmieci',
                'wealth.poor': 'Biedny',
                'wealth.common': 'Zwyczajny',
                'wealth.wealthy': 'Bogaty',
                'wealth.noble': 'Szlachecki',
                'wealth.treasure': 'Skarb',
                'wealth.rubbish.description': '< 1 szyling - Śmieci i drobiazgi',
                'wealth.poor.description': '1-5 szylingów - Proste przedmioty i narzędzia',
                'wealth.common.description': '5-20 szylingów - Standardowe wyposażenie i towary',
                'wealth.wealthy.description': '1-5 koron - Wartościowe przedmioty',
                'wealth.noble.description': '5-15 koron - Luksusowe dobra i towary',
                'wealth.treasure.description': '> 15 koron - Najcenniejsze skarby',
                'location.label': 'Lokalizacja',
                'location.placeholder': 'Wprowadź lokalizację (np. "koszary Ubersreiku", "rynek Altdorfu")',
                'validation.location.required': 'Lokalizacja jest wymagana',
                'validation.location.tooLong': 'Lokalizacja nie może przekroczyć 200 znaków',
                'button.generate.description': 'Generuj tematyczne skarby dla twojej lokalizacji',
                'common.generate': 'Generuj Skarby',
                'common.generating': 'Generowanie...',
                'common.cooldown.wait': 'Czekaj',
                'cooldown.title': 'Czas Odnowienia Generowania',
                'cooldown.subtitle': 'Poczekaj przed ponownym generowaniem',
                'cooldown.ready': 'Gotowy',
                'cooldown.seconds': '{{seconds}}s',
                'cooldown.minutes.seconds': '{{minutes}}:{{seconds}}',
                'cooldown.remaining': 'Pozostały czas odnowienia',
                'error.title.error': 'Błąd',
                'error.title.warning': 'Ostrzeżenie',
                'error.title.info': 'Informacja',
                'error.code': 'Kod',
                'error.details.label': 'Szczegóły',
                'error.details.show': 'Pokaż Szczegóły',
                'error.details.hide': 'Ukryj Szczegóły',
                'error.occurred.at': 'Wystąpił o',
                'error.action.retry': 'Spróbuj Ponownie',
                'error.action.dismiss': 'Zamknij',
                'errors.serverError': 'Błąd serwera. Proszę spróbować ponownie później.',
                'form.location.title': 'Lokalizacja',
                'loot.generation.title': 'Generuj Skarby',
                'loot.generation.subtitle': 'Wpisz gdzie Twoja drużyna znalazła skarb i naciśnij Generuj',
                'item.value': 'Wartość',
                'loot.list.title': 'Wygenerowane Skarby',
                'loot.list.loading': 'Generowanie przedmiotów...',
                'loot.list.empty': 'Nie wygenerowano jeszcze żadnych skarbów',
                'loot.list.emptyHint': 'Kliknij przycisk "Generuj Skarby" aby stworzyć tematyczne przedmioty dla twojej lokalizacji',
                'loot.empty.title': 'Gotowy do Generowania Skarbów',
                'loot.empty.description': 'Wprowadź lokalizację i wybierz poziom bogactwa aby wygenerować tematyczne skarby dla twojej przygody w Warhammer Fantasy',
                'loot.prices.toggle': 'Pokaż ceny',
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