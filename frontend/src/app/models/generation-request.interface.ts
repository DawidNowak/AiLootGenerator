import { WealthLevel } from "./wealth-level.enum";

/**
 * Captures user input and context for loot generation session.
 * Corresponds to the backend GenerationRequest model.
 */
export interface GenerationRequest {
    /**
     * User-provided location description.
     * Must be between 1 and 200 characters.
     */
    location: string;

    /**
     * Selected wealth tier for generation.
     */
    wealthLevel: WealthLevel;

    /**
     * Target language for generation.
     * Must be 'en' or 'pl'.
     */
    language: string;

    /**
     * Session tracking for cooldowns.
     * Generated GUID for session identification.
     */
    sessionId: string;
}