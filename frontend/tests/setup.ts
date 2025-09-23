/**
 * Jest setup for i18next mocking
 */

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            // Simple key-based translation mock
            const translations: Record<string, string> = {
                'loot:wealthLevels.Rubbish': 'Rubbish',
                'loot:wealthLevels.Poor': 'Poor',
                'loot:wealthLevels.Common': 'Common',
                'loot:wealthLevels.Wealthy': 'Wealthy',
                'loot:wealthLevels.Noble': 'Noble',
                'loot:wealthLevelDescriptions.Rubbish': 'Junk items, lowest tier (1-12 pennies)',
                'loot:wealthLevelDescriptions.Poor': 'Peasant scraps, basic items (13-60 pennies)',
                'loot:wealthLevelDescriptions.Common': 'Everyday goods, standard quality (61-240 pennies)',
                'loot:wealthLevelDescriptions.Wealthy': 'Merchant spoils, valuable items (241-1200 pennies)',
                'loot:wealthLevelDescriptions.Noble': 'Opulent treasures, rare magic items (1201+ pennies)',
                'loot:currencyUnits.penny': 'penny',
                'loot:currencyUnits.pennies': 'pennies',
                'loot:currencyUnits.shilling': 'shilling',
                'loot:currencyUnits.shillings': 'shillings',
                'loot:currencyUnits.gold': 'gold crown',
                'loot:currencyUnits.golds': 'gold crowns',
                'loot:valueInPennies': `${options?.value || 0} pennies`,
                'common:language': 'Language',
                'common:english': 'English',
                'common:polish': 'Polski',
                'form:wealthLevel': 'Wealth Level',
                'form:location': 'Location',
                'form:generate': 'Generate Loot',
            };

            return translations[key] || key;
        },
        i18n: {
            language: 'en',
            changeLanguage: jest.fn(),
        },
    }),
    I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
}));

// Mock i18next module
jest.mock('i18next', () => ({
    default: {
        use: jest.fn().mockReturnThis(),
        init: jest.fn(),
        t: jest.fn((key: string) => key),
        language: 'en',
        changeLanguage: jest.fn(),
    },
    use: jest.fn().mockReturnThis(),
    init: jest.fn(),
    t: jest.fn((key: string) => key),
    language: 'en',
    changeLanguage: jest.fn(),
}));