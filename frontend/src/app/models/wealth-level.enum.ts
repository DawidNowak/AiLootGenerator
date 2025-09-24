/**
 * Defines the five-tier wealth system for loot quality.
 * Corresponds to the backend WealthLevel enum with numeric values.
 */
export enum WealthLevel {
    /**
     * Junk items, lowest tier (1-12 pennies).
     * Broken tools, scraps, worthless junk.
     */
    Rubbish = 1,

    /**
     * Peasant scraps, basic items (13-60 pennies).
     * Basic peasant gear, simple items.
     */
    Poor = 2,

    /**
     * Everyday goods, standard quality (61-240 pennies).
     * Everyday merchant goods, standard quality.
     */
    Common = 3,

    /**
     * Merchant spoils, valuable items (241-1200 pennies).
     * Quality craftwork, rare materials.
     */
    Wealthy = 4,

    /**
     * Opulent treasures, rare magic items (1201+ pennies).
     * Luxury goods, art, magical artifacts.
     */
    Noble = 5
}