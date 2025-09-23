/**
 * Mock i18n setup for tests
 * Provides a simplified i18n configuration for testing
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple mock translations for tests
const mockTranslations = {
    en: {
        loot: {
            title: 'Loot Items',
            wealthLevels: {
                Rubbish: 'Rubbish',
                Poor: 'Poor',
                Common: 'Common',
                Wealthy: 'Wealthy',
                Noble: 'Noble',
            },
            wealthLevelDescriptions: {
                Rubbish: 'Junk items, lowest tier (1-12 pennies)',
                Poor: 'Peasant scraps, basic items (13-60 pennies)',
                Common: 'Everyday goods, standard quality (61-240 pennies)',
                Wealthy: 'Merchant spoils, valuable items (241-1200 pennies)',
                Noble: 'Opulent treasures, rare magic items (1201+ pennies)',
            },
            currencyUnits: {
                penny: 'penny',
                pennies: 'pennies',
                shilling: 'shilling',
                shillings: 'shillings',
                gold: 'gold crown',
                golds: 'gold crowns',
            },
            valueInPennies: '{{value}} pennies',
        },
        common: {
            language: 'Language',
            english: 'English',
            polish: 'Polski',
        },
        form: {
            wealthLevel: 'Wealth Level',
            location: 'Location',
            generate: 'Generate Loot',
        },
    },
};

// Initialize i18n for tests
i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: mockTranslations,
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
});

export default i18n;