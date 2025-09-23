/**
 * Mock i18n setup for tests
 * Provides a simplified i18n configuration for testing
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple mock translations for tests
const mockTranslations = {
    en: {
        // Common translations
        language: 'Language',
        english: 'English',
        polish: 'Polski',

        // Labels
        labels: {
            wealthLevel: 'Wealth Level',
            location: 'Location',
        },

        // Placeholders
        placeholders: {
            location: 'Enter location description...',
        },

        // Hints
        hints: {
            location: 'Describe where the loot was found',
        },

        // Buttons
        buttons: {
            generate: 'Generate Loot',
            generating: 'Generating...',
        },

        // Prices
        prices: {
            label: 'Item Prices',
            show: 'Show Prices',
            hide: 'Hide Prices',
            showTooltip: 'Display item values in Warhammer Fantasy currency',
            hideTooltip: 'Hide item values for immersion',
        },

        // No items message
        noItems: 'No loot items generated yet',

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

        // Form namespace for components that use useTranslation("form")
        form: {
            labels: {
                wealthLevel: 'Wealth Level',
                location: 'Location',
            },
        },

        // Direct wealth level translations for components that use t() instead of tLoot()
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
    // Support namespace access
    defaultNS: false,
    ns: ['loot', 'form'],
    fallbackNS: false,
});

export default i18n;