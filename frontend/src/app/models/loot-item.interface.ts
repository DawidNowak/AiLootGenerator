import { WealthLevel } from "./wealth-level.enum";

/**
 * Represents a generated treasure item with Warhammer Fantasy context.
 * Corresponds to the backend LootItem model.
 */
export interface LootItem {
    /**
     * Thematic item name (e.g., "Jungfreud Tabard in Ubersreik colors").
     * Must be between 3 and 100 characters.
     */
    name: string;

    /**
     * Detailed item description for immersion.
     */
    description: string;

    /**
     * Estimated value in pennies (smallest WFRP denomination).
     * Must be a positive integer.
     */
    valueInPennies: number;

    /**
     * Item's wealth classification.
     */
    wealthLevel: WealthLevel;
}