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
                'wealth.label': 'Wealth Level',
                'wealth.rubbish': 'Rubbish',
                'wealth.poor': 'Poor',
                'wealth.common': 'Common',
                'wealth.wealthy': 'Wealthy',
                'wealth.noble': 'Noble',
                'wealth.treasure': 'Treasure',
                'wealth.rubbish.description': '1-12 pennies - Basic scraps and trinkets',
                'wealth.poor.description': '13-60 pennies - Simple items and tools',
                'wealth.common.description': '61-240 pennies - Standard equipment and goods',
                'wealth.wealthy.description': '241-1200 pennies - Quality items and luxuries',
                'wealth.noble.description': '1201-3600 pennies - Rare treasures and artifacts',
                'wealth.treasure.description': '3601+ pennies - Legendary artifacts and ultimate treasures',
                'location.label': 'Location',
                'location.placeholder': 'Enter location (e.g., "Ubersreik barracks", "Altdorf marketplace")',
                'location.validation.required': 'Location is required',
                'location.validation.minLength': 'Location must be at least 1 character',
                'location.validation.maxLength': 'Location must not exceed 200 characters',
                'location.hint': 'Describe where the loot is found to enhance the generation',
                'common.clear': 'Clear',
                'common.generate': 'Generate Loot',
                'common.generating': 'Generating...',
                'common.cooldown.wait': 'Wait',
                'loading.default': 'Loading...',
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
                'error.network.failed': 'Network request failed',
                'error.validation.required': 'This field is required',
                'form.title': 'Loot Generation Form',
                'form.description': 'Configure your loot generation parameters using the components below',
                'form.location.title': 'Location',
                'loot.generation.title': 'Generate Loot',
                'loot.generation.description': 'Create thematic treasures for your Warhammer Fantasy adventures',
                'loot.generation.subtitle': 'AI-Powered Loot Generation',
                'loot.generated.title': 'Generated Treasures',
                'item.legendary': 'Legendary Item',
                'item.legendary.description': 'Sample legendary treasure with golden accents and mystical properties.',
                'item.rare': 'Rare Artifact',
                'item.rare.description': 'A silver-touched item with moderate magical enchantments.',
                'item.common': 'Common Treasure',
                'item.common.description': 'Bronze-quality item suitable for beginning adventurers.',
                'item.placeholder': 'No item selected',
                'item.value': 'Value',
                'currency.expand': 'Show detailed breakdown',
                'currency.collapse': 'Hide detailed breakdown',
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
                'wealth.label': 'Poziom Bogactwa',
                'wealth.rubbish': 'Śmieci',
                'wealth.poor': 'Biedny',
                'wealth.common': 'Zwyczajny',
                'wealth.wealthy': 'Bogaty',
                'wealth.noble': 'Szlachecki',
                'wealth.treasure': 'Skarb',
                'wealth.rubbish.description': '1-12 pensów - Podstawowe śmieci i drobiazgi',
                'wealth.poor.description': '13-60 pensów - Proste przedmioty i narzędzia',
                'wealth.common.description': '61-240 pensów - Standardowe wyposażenie i towary',
                'wealth.wealthy.description': '241-1200 pensów - Jakościowe przedmioty i luksusy',
                'wealth.noble.description': '1201-3600 pensów - Rzadkie skarby i artefakty',
                'wealth.treasure.description': '3601+ pensów - Legendarne artefakty i najcenniejsze skarby',
                'location.label': 'Lokalizacja',
                'location.placeholder': 'Wprowadź lokalizację (np. "koszary Ubersreiku", "rynek Altdorfu")',
                'location.validation.required': 'Lokalizacja jest wymagana',
                'location.validation.minLength': 'Lokalizacja musi mieć co najmniej 1 znak',
                'location.validation.maxLength': 'Lokalizacja nie może przekroczyć 200 znaków',
                'location.hint': 'Opisz gdzie skarb zostanie znaleziony aby wzbogacić generowanie',
                'common.clear': 'Wyczyść',
                'common.generate': 'Generuj Skarby',
                'common.generating': 'Generowanie...',
                'common.cooldown.wait': 'Czekaj',
                'loading.default': 'Ładowanie...',
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
                'error.network.failed': 'Żądanie sieciowe nie powiodło się',
                'error.validation.required': 'To pole jest wymagane',
                'form.title': 'Formularz Generowania Skarbów',
                'form.description': 'Skonfiguruj parametry generowania skarbów używając poniższych komponentów',
                'form.location.title': 'Lokalizacja',
                'loot.generation.title': 'Generuj Skarby',
                'loot.generation.description': 'Twórz tematyczne skarby dla twoich przygód w Warhammer Fantasy',
                'loot.generation.subtitle': 'Generowanie Skarbów Napędzane AI',
                'loot.generated.title': 'Wygenerowane Skarby',
                'item.legendary': 'Legendarny Przedmiot',
                'item.legendary.description': 'Przykładowy legendarny skarb ze złotymi akcentami i mistycznymi właściwościami.',
                'item.rare': 'Rzadki Artefakt',
                'item.rare.description': 'Przedmiot dotknięty srebrem z umiarkowanymi magicznymi zaklęciami.',
                'item.common': 'Pospolity Skarb',
                'item.common.description': 'Przedmiot jakości brązowej odpowiedni dla początkujących poszukiwaczy przygód.',
                'item.placeholder': 'Nie wybrano przedmiotu',
                'item.value': 'Wartość',
                'currency.expand': 'Pokaż szczegółowy podział',
                'currency.collapse': 'Ukryj szczegółowy podział',
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