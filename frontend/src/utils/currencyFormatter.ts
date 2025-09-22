/**
 * Warhammer Fantasy Roleplay Currency Formatter
 * Handles conversion and display of WFRP currency system with i18n support
 */

import i18n from '../localization/i18n';

// Warhammer Fantasy Roleplay Currency System Constants
export const CURRENCY_CONVERSION = {
    /** Number of pennies in one shilling */
    PENNIES_PER_SHILLING: 12,
    /** Number of shillings in one gold crown */
    SHILLINGS_PER_CROWN: 20,
    /** Total pennies in one gold crown (12 * 20 = 240) */
    PENNIES_PER_CROWN: 240,
} as const;

// Currency abbreviations for compact display
export const CURRENCY_ABBREVIATIONS = {
    PENNY: 'p',
    SHILLING: 's',
    CROWN: 'gc',
} as const;

/**
 * Breakdown of pennies into crown/shilling/penny components
 */
export interface CurrencyBreakdown {
    crowns: number;
    shillings: number;
    pennies: number;
    totalPennies: number;
}

/**
 * Options for currency formatting
 */
export interface CurrencyFormatOptions {
    /** Use abbreviated forms (gc, s, p) instead of full names */
    abbreviated?: boolean;
    /** Include zero-value components in output */
    includeZeros?: boolean;
}

/**
 * Breaks down a penny amount into crowns, shillings, and pennies
 * @param totalPennies - Total amount in pennies
 * @returns CurrencyBreakdown object with component amounts
 */
export function breakdownCurrency(totalPennies: number): CurrencyBreakdown {
    if (Number.isNaN(totalPennies)) {
        throw new Error('Currency amount cannot be NaN');
    }

    if (!Number.isFinite(totalPennies)) {
        throw new Error('Currency amount must be a finite number');
    }

    if (totalPennies < 0) {
        throw new Error('Currency amount cannot be negative');
    }

    // Ensure integer amount
    totalPennies = Math.floor(totalPennies);

    const crowns = Math.floor(totalPennies / CURRENCY_CONVERSION.PENNIES_PER_CROWN);
    const remainingAfterCrowns = totalPennies % CURRENCY_CONVERSION.PENNIES_PER_CROWN;

    const shillings = Math.floor(remainingAfterCrowns / CURRENCY_CONVERSION.PENNIES_PER_SHILLING);
    const pennies = remainingAfterCrowns % CURRENCY_CONVERSION.PENNIES_PER_SHILLING;

    return {
        crowns,
        shillings,
        pennies,
        totalPennies,
    };
}

/**
 * Gets the appropriate currency unit name from i18n translations
 * @param unitType - Type of currency unit ('penny', 'shilling', 'gold')
 * @param amount - Amount to determine singular/plural form
 * @param language - Optional language code, defaults to current i18n language
 * @returns Translated currency unit name
 */
function getCurrencyUnitName(
    unitType: 'penny' | 'shilling' | 'gold',
    amount: number,
    language?: string
): string {
    const lng = language || i18n.language;

    // Use singular or plural form based on amount
    let key: string;
    if (amount === 1) {
        key = unitType;
    } else {
        // Handle plural forms correctly
        switch (unitType) {
            case 'penny':
                key = 'pennies';
                break;
            case 'shilling':
                key = 'shillings';
                break;
            case 'gold':
                key = 'golds';
                break;
        }
    }

    return i18n.t(`loot:currencyUnits.${key}`, { lng });
}

/**
 * Formats a single currency component with proper singular/plural form using i18n
 * @param amount - The amount of the currency unit
 * @param unitType - The type of currency unit
 * @param abbreviated - Whether to use abbreviated form
 * @param language - Optional language code
 * @returns Formatted string for the currency component
 */
function formatCurrencyComponent(
    amount: number,
    unitType: 'penny' | 'shilling' | 'gold',
    abbreviated: boolean = false,
    language?: string
): string {
    if (amount === 0) return '';

    // Use abbreviated form if specified
    if (abbreviated) {
        const abbrev = unitType === 'penny' ? CURRENCY_ABBREVIATIONS.PENNY :
            unitType === 'shilling' ? CURRENCY_ABBREVIATIONS.SHILLING :
                CURRENCY_ABBREVIATIONS.CROWN;
        return `${amount}${abbrev}`;
    }

    // Use i18n translated unit name with proper singular/plural form
    const unitName = getCurrencyUnitName(unitType, amount, language);
    return `${amount} ${unitName}`;
}

/**
 * Formats pennies into a readable currency display string with i18n support
 * @param totalPennies - Total amount in pennies
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "2 gold crowns 5 shillings 3 pennies")
 */
export function formatCurrency(
    totalPennies: number,
    options: CurrencyFormatOptions = {}
): string {
    const {
        abbreviated = false,
        includeZeros = false,
    } = options;

    if (totalPennies === 0) {
        return abbreviated ? '0p' : `0 ${getCurrencyUnitName('penny', 0)}`;
    }

    const breakdown = breakdownCurrency(totalPennies);
    const parts: string[] = [];

    // Determine if we have any crowns or shillings to decide when to show zeros
    const hasCrowns = breakdown.crowns > 0;
    const hasShillings = breakdown.shillings > 0;

    // Format crowns
    if (breakdown.crowns > 0) {
        const crownText = formatCurrencyComponent(breakdown.crowns, 'gold', abbreviated);
        parts.push(crownText);
    }

    // Format shillings (show zeros only if we have crowns and includeZeros is true)
    if (breakdown.shillings > 0 || (includeZeros && hasCrowns)) {
        const shillingText = formatCurrencyComponent(breakdown.shillings, 'shilling', abbreviated);
        if (shillingText || (includeZeros && hasCrowns)) {
            parts.push(shillingText || (abbreviated ? '0s' : `0 ${getCurrencyUnitName('shilling', 0)}`));
        }
    }

    // Format pennies (show zeros only if we have higher denominations and includeZeros is true)
    if (breakdown.pennies > 0 || (includeZeros && (hasCrowns || hasShillings)) || parts.length === 0) {
        const pennyText = formatCurrencyComponent(breakdown.pennies, 'penny', abbreviated);
        if (pennyText || (includeZeros && (hasCrowns || hasShillings)) || parts.length === 0) {
            parts.push(pennyText || (abbreviated ? '0p' : `0 ${getCurrencyUnitName('penny', 0)}`));
        }
    }

    return parts.join(' ');
}

/**
 * Formats currency in a compact abbreviated form (e.g., "1gc 5s 3p")
 * @param totalPennies - Total amount in pennies
 * @returns Abbreviated currency string
 */
export function formatCurrencyAbbreviated(totalPennies: number): string {
    return formatCurrency(totalPennies, { abbreviated: true });
}

/**
 * Formats currency in full descriptive form (e.g., "1 gold crown 5 shillings 3 pennies")
 * @param totalPennies - Total amount in pennies
 * @returns Full currency string with proper pluralization
 */
export function formatCurrencyFull(totalPennies: number): string {
    return formatCurrency(totalPennies, { abbreviated: false });
}

/**
 * Formats currency with all components shown, including zeros (e.g., "0 gold crowns 0 shillings 5 pennies")
 * @param totalPennies - Total amount in pennies
 * @returns Full currency string with all components
 */
export function formatCurrencyWithZeros(totalPennies: number): string {
    return formatCurrency(totalPennies, { abbreviated: false, includeZeros: true });
}

/**
 * Formats currency with language-specific formatting
 * @param totalPennies - Total amount in pennies
 * @param language - Language code ('en', 'pl', etc.)
 * @param options - Formatting options
 * @returns Formatted currency string in the specified language
 */
export function formatCurrencyWithLanguage(
    totalPennies: number,
    language: string,
    options: CurrencyFormatOptions = {}
): string {
    const currentLang = i18n.language;

    // Temporarily change language for formatting if different
    if (language !== currentLang) {
        const originalLang = currentLang;
        i18n.changeLanguage(language);
        const result = formatCurrency(totalPennies, options);
        i18n.changeLanguage(originalLang);
        return result;
    }

    return formatCurrency(totalPennies, options);
}