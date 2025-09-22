/**
 * Core TypeScript types for the Warhammer Fantasy Loot Generator frontend
 * Task: T015 - Frontend Foundation & Types
 */

/**
 * Supported languages for both UI and content generation
 * Matches backend language validation and i18next configuration
 */
export type Language = 'en' | 'pl';

/**
 * Wealth levels for loot generation
 * Matches WealthLevel enum from backend Models/WealthLevel.cs
 * Determines the quality and value range of generated items
 */
export enum WealthLevel {
    Rubbish = 'Rubbish',
    Poor = 'Poor',
    Common = 'Common',
    Wealthy = 'Wealthy',
    Noble = 'Noble'
}