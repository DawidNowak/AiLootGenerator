import { Injectable } from '@angular/core';

/**
 * Interface representing Warhammer Fantasy currency breakdown.
 */
export interface CurrencyBreakdown {
    goldCrowns: number;
    silverShillings: number;
    brassPennies: number;
    totalPennies: number;
}

/**
 * Interface for currency display options.
 */
export interface CurrencyDisplayOptions {
    showFullBreakdown?: boolean;
    showSymbols?: boolean;
    showZeroValues?: boolean;
    abbreviate?: boolean;
    language?: 'en' | 'pl';
}

/**
 * Service for formatting Warhammer Fantasy currency values.
 * Handles conversion between pennies and the WFRP currency system:
 * - 12 pennies = 1 shilling
 * - 20 shillings = 1 gold crown
 * - 240 pennies = 1 gold crown
 */
@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    private readonly PENNIES_PER_SHILLING = 12;
    private readonly SHILLINGS_PER_CROWN = 20;
    private readonly PENNIES_PER_CROWN = this.PENNIES_PER_SHILLING * this.SHILLINGS_PER_CROWN; // 240

    // Currency symbols and abbreviations
    private readonly SYMBOLS = {
        goldCrown: { symbol: 'GC', name: 'Gold Crown', namePlural: 'Gold Crowns' },
        silverShilling: { symbol: 's', name: 'Shilling', namePlural: 'Shillings' },
        brassPenny: { symbol: 'p', name: 'Penny', namePlural: 'Pennies' }
    };

    private readonly SYMBOLS_PL = {
        goldCrown: { symbol: 'ZK', name: 'Złota Korona', namePlural: 'Złote Korony' },
        silverShilling: { symbol: 's', name: 'Szyling', namePlural: 'Szylingi' },
        brassPenny: { symbol: 'p', name: 'Pens', namePlural: 'Pensy' }
    };

    constructor() { }

    /**
     * Converts pennies to the full currency breakdown.
     * @param pennies - Total value in pennies
     * @returns Currency breakdown object
     */
    convertPenniesToCurrency(pennies: number): CurrencyBreakdown {
        if (pennies < 0) {
            throw new Error('Currency value cannot be negative');
        }

        if (!Number.isInteger(pennies)) {
            pennies = Math.floor(pennies);
        }

        const goldCrowns = Math.floor(pennies / this.PENNIES_PER_CROWN);
        const remainingAfterGold = pennies % this.PENNIES_PER_CROWN;

        const silverShillings = Math.floor(remainingAfterGold / this.PENNIES_PER_SHILLING);
        const brassPennies = remainingAfterGold % this.PENNIES_PER_SHILLING;

        return {
            goldCrowns,
            silverShillings,
            brassPennies,
            totalPennies: pennies
        };
    }

    /**
     * Converts currency breakdown back to total pennies.
     * @param breakdown - Currency breakdown object
     * @returns Total value in pennies
     */
    convertCurrencyToPennies(breakdown: Partial<CurrencyBreakdown>): number {
        const goldCrowns = breakdown.goldCrowns || 0;
        const silverShillings = breakdown.silverShillings || 0;
        const brassPennies = breakdown.brassPennies || 0;

        return (goldCrowns * this.PENNIES_PER_CROWN) +
            (silverShillings * this.PENNIES_PER_SHILLING) +
            brassPennies;
    }

    /**
     * Formats pennies as a readable currency string.
     * @param pennies - Total value in pennies
     * @param options - Display formatting options
     * @returns Formatted currency string
     */
    formatCurrency(pennies: number, options: CurrencyDisplayOptions = {}): string {
        const {
            showFullBreakdown = true,
            showSymbols = true,
            showZeroValues = false,
            abbreviate = false,
            language = 'en'
        } = options;

        if (pennies === 0) {
            return this.formatZeroValue(language, showSymbols, abbreviate);
        }

        const breakdown = this.convertPenniesToCurrency(pennies);
        const symbols = language === 'pl' ? this.SYMBOLS_PL : this.SYMBOLS;

        if (!showFullBreakdown) {
            // Show only the most significant denomination
            if (breakdown.goldCrowns > 0) {
                const value = breakdown.totalPennies / this.PENNIES_PER_CROWN;
                return this.formatSingleDenomination(value, symbols.goldCrown, language, showSymbols, abbreviate);
            } else if (breakdown.silverShillings > 0) {
                const value = breakdown.totalPennies / this.PENNIES_PER_SHILLING;
                return this.formatSingleDenomination(value, symbols.silverShilling, language, showSymbols, abbreviate);
            } else {
                return this.formatSingleDenomination(breakdown.brassPennies, symbols.brassPenny, language, showSymbols, abbreviate);
            }
        }

        // Full breakdown format
        const parts: string[] = [];

        if (breakdown.goldCrowns > 0 || showZeroValues) {
            parts.push(this.formatDenomination(breakdown.goldCrowns, symbols.goldCrown, language, showSymbols, abbreviate));
        }

        if (breakdown.silverShillings > 0 || (showZeroValues && breakdown.goldCrowns > 0)) {
            parts.push(this.formatDenomination(breakdown.silverShillings, symbols.silverShilling, language, showSymbols, abbreviate));
        }

        if (breakdown.brassPennies > 0 || showZeroValues || parts.length === 0) {
            parts.push(this.formatDenomination(breakdown.brassPennies, symbols.brassPenny, language, showSymbols, abbreviate));
        }

        return parts.join(', ');
    }

    /**
     * Formats currency with automatic smart formatting based on value.
     * @param pennies - Total value in pennies
     * @param language - Display language
     * @returns Formatted currency string with smart formatting
     */
    formatCurrencySmart(pennies: number, language: 'en' | 'pl' = 'en'): string {
        if (pennies === 0) {
            return this.formatZeroValue(language, true, false);
        }

        const breakdown = this.convertPenniesToCurrency(pennies);

        // For very high values, show as decimal gold crowns
        if (breakdown.goldCrowns >= 10) {
            const totalGold = pennies / this.PENNIES_PER_CROWN;
            return this.formatSingleDenomination(
                totalGold,
                language === 'pl' ? this.SYMBOLS_PL.goldCrown : this.SYMBOLS.goldCrown,
                language,
                true,
                false
            );
        }

        // For medium values, show gold + remainder
        if (breakdown.goldCrowns > 0) {
            return this.formatCurrency(pennies, {
                showFullBreakdown: true,
                showSymbols: true,
                showZeroValues: false,
                language
            });
        }

        // For small values, show shillings + pennies or just pennies
        if (breakdown.silverShillings > 0) {
            return this.formatCurrency(pennies, {
                showFullBreakdown: true,
                showSymbols: true,
                showZeroValues: false,
                language
            });
        }

        // Just pennies
        return this.formatSingleDenomination(
            breakdown.brassPennies,
            language === 'pl' ? this.SYMBOLS_PL.brassPenny : this.SYMBOLS.brassPenny,
            language,
            true,
            false
        );
    }

    /**
     * Gets a human-readable description of a value range.
     * @param minPennies - Minimum value in pennies
     * @param maxPennies - Maximum value in pennies
     * @param language - Display language
     * @returns Formatted range string
     */
    formatValueRange(minPennies: number, maxPennies: number, language: 'en' | 'pl' = 'en'): string {
        const minFormatted = this.formatCurrencySmart(minPennies, language);
        const maxFormatted = this.formatCurrencySmart(maxPennies, language);

        const separator = language === 'pl' ? ' do ' : ' to ';
        return `${minFormatted}${separator}${maxFormatted}`;
    }

    /**
     * Compares two penny values and returns a comparison description.
     * @param pennies1 - First value in pennies
     * @param pennies2 - Second value in pennies
     * @param language - Display language
     * @returns Comparison description
     */
    compareValues(pennies1: number, pennies2: number, language: 'en' | 'pl' = 'en'): string {
        const difference = Math.abs(pennies1 - pennies2);
        const diffFormatted = this.formatCurrencySmart(difference, language);

        if (pennies1 > pennies2) {
            return language === 'pl'
                ? `${diffFormatted} więcej`
                : `${diffFormatted} more`;
        } else if (pennies1 < pennies2) {
            return language === 'pl'
                ? `${diffFormatted} mniej`
                : `${diffFormatted} less`;
        } else {
            return language === 'pl' ? 'równe' : 'equal';
        }
    }

    /**
     * Gets currency conversion rates for reference.
     * @returns Object with conversion rates
     */
    getConversionRates(): {
        penniesPerShilling: number;
        shillingsPerCrown: number;
        penniesPerCrown: number;
    } {
        return {
            penniesPerShilling: this.PENNIES_PER_SHILLING,
            shillingsPerCrown: this.SHILLINGS_PER_CROWN,
            penniesPerCrown: this.PENNIES_PER_CROWN
        };
    }

    /**
     * Formats a single denomination value.
     */
    private formatSingleDenomination(
        value: number,
        denomination: { symbol: string; name: string; namePlural: string },
        language: 'en' | 'pl',
        showSymbol: boolean,
        abbreviate: boolean
    ): string {
        const roundedValue = Math.round(value * 100) / 100; // Round to 2 decimal places
        const isPlural = roundedValue !== 1;

        if (showSymbol) {
            return `${roundedValue}${denomination.symbol}`;
        }

        if (abbreviate) {
            return `${roundedValue} ${denomination.symbol}`;
        }

        const name = isPlural ? denomination.namePlural : denomination.name;
        return `${roundedValue} ${name}`;
    }

    /**
     * Formats a single denomination (integer values only).
     */
    private formatDenomination(
        value: number,
        denomination: { symbol: string; name: string; namePlural: string },
        language: 'en' | 'pl',
        showSymbol: boolean,
        abbreviate: boolean
    ): string {
        if (showSymbol) {
            return `${value}${denomination.symbol}`;
        }

        if (abbreviate) {
            return `${value} ${denomination.symbol}`;
        }

        const isPlural = value !== 1;
        const name = isPlural ? denomination.namePlural : denomination.name;
        return `${value} ${name}`;
    }

    /**
     * Formats zero value appropriately.
     */
    private formatZeroValue(language: 'en' | 'pl', showSymbol: boolean, abbreviate: boolean): string {
        const symbols = language === 'pl' ? this.SYMBOLS_PL : this.SYMBOLS;

        if (showSymbol) {
            return `0${symbols.brassPenny.symbol}`;
        }

        return language === 'pl' ? 'Brak wartości' : 'No value';
    }
}