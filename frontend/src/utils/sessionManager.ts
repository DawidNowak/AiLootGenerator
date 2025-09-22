/**
 * Session Management Utilities
 * 
 * Handles session UUID generation and persistence for the Warhammer Fantasy Loot Generator.
 * Sessions are used for cooldown tracking and maintaining user state across page reloads.
 */

/**
 * Generates a random UUID v4 string
 * @returns A UUID v4 string in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateSessionId(): string {
    // Using crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback implementation for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Gets the current session ID or generates a new one if none exists
 * @returns The current session ID
 */
export function getCurrentSessionId(): string {
    const existing = getStoredSessionId();
    if (existing) {
        return existing;
    }

    const newSessionId = generateSessionId();
    storeSessionId(newSessionId);
    return newSessionId;
}

/**
 * SessionStorage key for storing the session ID
 */
const SESSION_ID_KEY = 'warhammer-loot-session-id';

/**
 * Retrieves the stored session ID from sessionStorage
 * @returns The stored session ID or null if not found
 */
function getStoredSessionId(): string | null {
    try {
        return sessionStorage.getItem(SESSION_ID_KEY);
    } catch (error) {
        // SessionStorage might not be available (e.g., in Node.js environments)
        console.warn('SessionStorage not available:', error);
        return null;
    }
}

/**
 * Stores the session ID in sessionStorage
 * @param sessionId The session ID to store
 */
function storeSessionId(sessionId: string): void {
    try {
        sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    } catch (error) {
        // SessionStorage might not be available or quota exceeded
        console.warn('Failed to store session ID:', error);
    }
}

/**
 * Clears the stored session ID from sessionStorage
 * Useful for testing or manual session reset
 */
export function clearStoredSessionId(): void {
    try {
        sessionStorage.removeItem(SESSION_ID_KEY);
    } catch (error) {
        console.warn('Failed to clear session ID:', error);
    }
}

/**
 * Regenerates the session ID and stores the new one
 * @returns The new session ID
 */
export function regenerateSessionId(): string {
    const newSessionId = generateSessionId();
    storeSessionId(newSessionId);
    return newSessionId;
}