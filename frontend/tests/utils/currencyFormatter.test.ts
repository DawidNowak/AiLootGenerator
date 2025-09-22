/**
 * Unit tests for Currency Formatter utilities with i18n support
 * Tests Warhammer Fantasy Roleplay currency conversion and formatting
 */

/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// Mock the i18n import with a default export
jest.mock('../../src/localization/i18n', () => ({
    __esModule: true,
    default: {
        language: 'en',
        t: jest.fn((key: string, options?: { lng?: string }) => {
            const lng = options?.lng || 'en';

            // Mock translation keys for currency units
            const translations: Record<string, Record<string, string>> = {
                en: {
                    'loot:currencyUnits.penny': 'penny',
                    'loot:currencyUnits.pennies': 'pennies',
                    'loot:currencyUnits.shilling': 'shilling',
                    'loot:currencyUnits.shillings': 'shillings',
                    'loot:currencyUnits.gold': 'gold crown',
                    'loot:currencyUnits.golds': 'gold crowns',
                },
                pl: {
                    'loot:currencyUnits.penny': 'pens',
                    'loot:currencyUnits.pennies': 'pensów',
                    'loot:currencyUnits.shilling': 'szyling',
                    'loot:currencyUnits.shillings': 'szylingów',
                    'loot:currencyUnits.gold': 'złota korona',
                    'loot:currencyUnits.golds': 'złote korony',
                },
            };

            return translations[lng]?.[key] || key;
        }),
        changeLanguage: jest.fn(() => {
            return Promise.resolve();
        }),
    },
}));

import {
    CURRENCY_CONVERSION,
    CURRENCY_ABBREVIATIONS,
    breakdownCurrency,
    formatCurrency,
    formatCurrencyAbbreviated,
    formatCurrencyFull,
    formatCurrencyWithZeros,
} from '../../src/utils/currencyFormatter';

describe('Currency Conversion Constants', () => {
    test('should have correct conversion rates', () => {
        expect(CURRENCY_CONVERSION.PENNIES_PER_SHILLING).toBe(12);
        expect(CURRENCY_CONVERSION.SHILLINGS_PER_CROWN).toBe(20);
        expect(CURRENCY_CONVERSION.PENNIES_PER_CROWN).toBe(240);
    });

    test('should calculate correct total pennies per crown', () => {
        const calculatedTotal = CURRENCY_CONVERSION.PENNIES_PER_SHILLING * CURRENCY_CONVERSION.SHILLINGS_PER_CROWN;
        expect(CURRENCY_CONVERSION.PENNIES_PER_CROWN).toBe(calculatedTotal);
    });
});

describe('Currency Abbreviations', () => {
    test('should have correct abbreviations', () => {
        expect(CURRENCY_ABBREVIATIONS.PENNY).toBe('p');
        expect(CURRENCY_ABBREVIATIONS.SHILLING).toBe('s');
        expect(CURRENCY_ABBREVIATIONS.CROWN).toBe('gc');
    });
});

describe('breakdownCurrency', () => {
    test('should handle zero pennies', () => {
        const result = breakdownCurrency(0);
        expect(result).toEqual({
            crowns: 0,
            shillings: 0,
            pennies: 0,
            totalPennies: 0,
        });
    });

    test('should handle small amounts (pennies only)', () => {
        const result = breakdownCurrency(5);
        expect(result).toEqual({
            crowns: 0,
            shillings: 0,
            pennies: 5,
            totalPennies: 5,
        });
    });

    test('should handle exact shilling amounts', () => {
        const result = breakdownCurrency(24); // 2 shillings
        expect(result).toEqual({
            crowns: 0,
            shillings: 2,
            pennies: 0,
            totalPennies: 24,
        });
    });

    test('should handle shillings with remaining pennies', () => {
        const result = breakdownCurrency(27); // 2 shillings 3 pennies
        expect(result).toEqual({
            crowns: 0,
            shillings: 2,
            pennies: 3,
            totalPennies: 27,
        });
    });

    test('should handle exact crown amounts', () => {
        const result = breakdownCurrency(240); // 1 crown
        expect(result).toEqual({
            crowns: 1,
            shillings: 0,
            pennies: 0,
            totalPennies: 240,
        });
    });

    test('should handle complex amounts with all components', () => {
        const result = breakdownCurrency(567); // 2 crowns 7 shillings 3 pennies
        expect(result).toEqual({
            crowns: 2,
            shillings: 7,
            pennies: 3,
            totalPennies: 567,
        });
    });

    test('should handle large amounts', () => {
        const result = breakdownCurrency(2400); // 10 crowns
        expect(result).toEqual({
            crowns: 10,
            shillings: 0,
            pennies: 0,
            totalPennies: 2400,
        });
    });

    test('should throw error for negative amounts', () => {
        expect(() => breakdownCurrency(-1)).toThrow('Currency amount cannot be negative');
        expect(() => breakdownCurrency(-100)).toThrow('Currency amount cannot be negative');
    });
});

describe('formatCurrency', () => {
    test('should format zero pennies', () => {
        expect(formatCurrency(0)).toBe('0 pennies');
        expect(formatCurrency(0, { abbreviated: true })).toBe('0p');
    });

    test('should format single penny', () => {
        expect(formatCurrency(1)).toBe('1 penny');
        expect(formatCurrency(1, { abbreviated: true })).toBe('1p');
    });

    test('should format multiple pennies', () => {
        expect(formatCurrency(5)).toBe('5 pennies');
        expect(formatCurrency(5, { abbreviated: true })).toBe('5p');
    });

    test('should format single shilling', () => {
        expect(formatCurrency(12)).toBe('1 shilling');
        expect(formatCurrency(12, { abbreviated: true })).toBe('1s');
    });

    test('should format multiple shillings', () => {
        expect(formatCurrency(24)).toBe('2 shillings');
        expect(formatCurrency(24, { abbreviated: true })).toBe('2s');
    });

    test('should format shillings with pennies', () => {
        expect(formatCurrency(27)).toBe('2 shillings 3 pennies');
        expect(formatCurrency(27, { abbreviated: true })).toBe('2s 3p');
    });

    test('should format single crown', () => {
        expect(formatCurrency(240)).toBe('1 gold crown');
        expect(formatCurrency(240, { abbreviated: true })).toBe('1gc');
    });

    test('should format multiple crowns', () => {
        expect(formatCurrency(480)).toBe('2 gold crowns');
        expect(formatCurrency(480, { abbreviated: true })).toBe('2gc');
    });

    test('should format complex amounts', () => {
        expect(formatCurrency(567)).toBe('2 gold crowns 7 shillings 3 pennies');
        expect(formatCurrency(567, { abbreviated: true })).toBe('2gc 7s 3p');
    });

    test('should handle amounts with missing middle components', () => {
        expect(formatCurrency(247)).toBe('1 gold crown 7 pennies'); // No shillings
        expect(formatCurrency(247, { abbreviated: true })).toBe('1gc 7p');
    });

    test('should include zeros when requested', () => {
        expect(formatCurrency(240, { includeZeros: true })).toBe('1 gold crown 0 shillings 0 pennies');
        expect(formatCurrency(247, { includeZeros: true })).toBe('1 gold crown 0 shillings 7 pennies');
        expect(formatCurrency(27, { includeZeros: true })).toBe('2 shillings 3 pennies'); // No crowns to show zeros for
    });
});

describe('formatCurrencyAbbreviated', () => {
    test('should format using abbreviated forms', () => {
        expect(formatCurrencyAbbreviated(0)).toBe('0p');
        expect(formatCurrencyAbbreviated(5)).toBe('5p');
        expect(formatCurrencyAbbreviated(12)).toBe('1s');
        expect(formatCurrencyAbbreviated(27)).toBe('2s 3p');
        expect(formatCurrencyAbbreviated(240)).toBe('1gc');
        expect(formatCurrencyAbbreviated(567)).toBe('2gc 7s 3p');
    });
});

describe('formatCurrencyFull', () => {
    test('should format using full descriptive forms', () => {
        expect(formatCurrencyFull(0)).toBe('0 pennies');
        expect(formatCurrencyFull(1)).toBe('1 penny');
        expect(formatCurrencyFull(5)).toBe('5 pennies');
        expect(formatCurrencyFull(12)).toBe('1 shilling');
        expect(formatCurrencyFull(24)).toBe('2 shillings');
        expect(formatCurrencyFull(27)).toBe('2 shillings 3 pennies');
        expect(formatCurrencyFull(240)).toBe('1 gold crown');
        expect(formatCurrencyFull(480)).toBe('2 gold crowns');
        expect(formatCurrencyFull(567)).toBe('2 gold crowns 7 shillings 3 pennies');
    });
});

describe('formatCurrencyWithZeros', () => {
    test('should include zero components', () => {
        expect(formatCurrencyWithZeros(240)).toBe('1 gold crown 0 shillings 0 pennies');
        expect(formatCurrencyWithZeros(247)).toBe('1 gold crown 0 shillings 7 pennies');
        expect(formatCurrencyWithZeros(252)).toBe('1 gold crown 1 shilling 0 pennies');
        expect(formatCurrencyWithZeros(27)).toBe('2 shillings 3 pennies'); // No crowns
        expect(formatCurrencyWithZeros(5)).toBe('5 pennies'); // No higher denominations
    });
});

describe('Edge Cases and Error Handling', () => {
    test('should handle very large amounts', () => {
        const largeAmount = 999999; // 4166 crowns 13 shillings 3 pennies
        const result = breakdownCurrency(largeAmount);
        expect(result.crowns).toBe(4166);
        expect(result.shillings).toBe(13);
        expect(result.pennies).toBe(3);
        expect(result.totalPennies).toBe(largeAmount);
    });

    test('should handle maximum safe integer', () => {
        const maxSafe = Number.MAX_SAFE_INTEGER;
        expect(() => breakdownCurrency(maxSafe)).not.toThrow();
    });

    test('should validate input types', () => {
        // TypeScript should catch these at compile time, but testing runtime behavior
        expect(() => breakdownCurrency(NaN)).toThrow('Currency amount cannot be NaN');
        expect(() => breakdownCurrency(Infinity)).toThrow('Currency amount must be a finite number');
        expect(() => breakdownCurrency(-Infinity)).toThrow('Currency amount must be a finite number');
    });
});

describe('Real-world Warhammer Examples', () => {
    test('should format common item values correctly', () => {
        // Common WFRP item values from the game
        expect(formatCurrencyFull(1)).toBe('1 penny'); // Candle
        expect(formatCurrencyFull(6)).toBe('6 pennies'); // Loaf of bread
        expect(formatCurrencyFull(12)).toBe('1 shilling'); // Mug of ale
        expect(formatCurrencyFull(240)).toBe('1 gold crown'); // Simple weapon
        expect(formatCurrencyFull(480)).toBe('2 gold crowns'); // Mail shirt
        expect(formatCurrencyFull(2400)).toBe('10 gold crowns'); // Plate armor
    });

    test('should handle wealth level examples', () => {
        // Typical wealth level ranges
        expect(formatCurrencyFull(5)).toBe('5 pennies'); // Brass tier - very poor
        expect(formatCurrencyFull(36)).toBe('3 shillings'); // Brass tier - poor
        expect(formatCurrencyFull(120)).toBe('10 shillings'); // Silver tier - common
        expect(formatCurrencyFull(600)).toBe('2 gold crowns 10 shillings'); // Gold tier - wealthy
        expect(formatCurrencyFull(4800)).toBe('20 gold crowns'); // Gold tier - very wealthy
    });
});