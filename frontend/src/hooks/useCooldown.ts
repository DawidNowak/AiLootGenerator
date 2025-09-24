/**
 * Cooldown State Hook for Warhammer Fantasy Loot Generator
 * Task: T043 - Create cooldown state hook
 * 
 * Manages user cooldown state for loot generation.
 * Integrates with session management and countdown functionality.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCountdown } from './useCountdown';

/**
 * Cooldown state information
 */
export interface CooldownState {
    /** Whether user is currently in cooldown period */
    isInCooldown: boolean;
    /** Cooldown expiry date (null if no cooldown) */
    expiresAt: Date | null;
    /** Remaining cooldown time in seconds */
    remainingSeconds: number;
    /** Formatted countdown display */
    formattedTime: string;
    /** Whether cooldown data is being loaded */
    isLoading: boolean;
}

/**
 * Cooldown hook options
 */
export interface UseCooldownOptions {
    /** Session ID for tracking user cooldowns */
    sessionId?: string;
    /** Callback when cooldown period ends */
    onCooldownEnd?: () => void;
    /** Auto-refresh interval for server sync (ms, default: 10000) */
    refreshInterval?: number;
    /** Whether to automatically start countdown */
    autoStart?: boolean;
}

/**
 * Cooldown hook return value
 */
export interface CooldownResult extends CooldownState {
    /** Set a new cooldown period */
    setCooldown: (expiresAt: Date | string) => void;
    /** Clear current cooldown */
    clearCooldown: () => void;
    /** Manually refresh cooldown state */
    refreshCooldown: () => void;
    /** Start countdown timer */
    startCountdown: () => void;
    /** Stop countdown timer */
    stopCountdown: () => void;
}

/**
 * Local storage key for cooldown persistence
 */
const COOLDOWN_STORAGE_KEY = 'warhammer-loot-cooldown';

/**
 * Cooldown data structure for persistence
 */
interface StoredCooldownData {
    sessionId: string;
    expiresAt: string;
    timestamp: number;
}

/**
 * Save cooldown to local storage
 */
function saveCooldownToStorage(sessionId: string, expiresAt: Date): void {
    try {
        const data: StoredCooldownData = {
            sessionId,
            expiresAt: expiresAt.toISOString(),
            timestamp: Date.now()
        };
        localStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to save cooldown to localStorage:', error);
    }
}

/**
 * Load cooldown from local storage
 */
function loadCooldownFromStorage(sessionId: string): Date | null {
    try {
        const stored = localStorage.getItem(COOLDOWN_STORAGE_KEY);
        if (!stored) {
            return null;
        }

        const data: StoredCooldownData = JSON.parse(stored);

        // Verify session ID matches
        if (data.sessionId !== sessionId) {
            localStorage.removeItem(COOLDOWN_STORAGE_KEY);
            return null;
        }

        const expiresAt = new Date(data.expiresAt);

        // Check if cooldown has expired
        if (expiresAt <= new Date()) {
            localStorage.removeItem(COOLDOWN_STORAGE_KEY);
            return null;
        }

        return expiresAt;
    } catch (error) {
        console.warn('Failed to load cooldown from localStorage:', error);
        localStorage.removeItem(COOLDOWN_STORAGE_KEY);
        return null;
    }
}

/**
 * Clear cooldown from local storage
 */
function clearCooldownFromStorage(): void {
    try {
        localStorage.removeItem(COOLDOWN_STORAGE_KEY);
    } catch (error) {
        console.warn('Failed to clear cooldown from localStorage:', error);
    }
}

/**
 * Cooldown management hook
 * 
 * @param options - Cooldown configuration
 * @returns Cooldown state and controls
 * 
 * @example
 * ```typescript
 * const sessionId = useSessionId();
 * const cooldown = useCooldown({
 *   sessionId,
 *   onCooldownEnd: () => console.log('Ready to generate!'),
 *   autoStart: true
 * });
 * 
 * // Set cooldown after API response
 * useEffect(() => {
 *   if (generationResponse?.cooldownExpiresAt) {
 *     cooldown.setCooldown(generationResponse.cooldownExpiresAt);
 *   }
 * }, [generationResponse]);
 * 
 * return (
 *   <div>
 *     {cooldown.isInCooldown ? (
 *       <span>Next generation in: {cooldown.formattedTime}</span>
 *     ) : (
 *       <button onClick={handleGenerate}>Generate Loot</button>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useCooldown(options: UseCooldownOptions = {}): CooldownResult {
    const {
        sessionId,
        onCooldownEnd,
        refreshInterval = 10000,
        autoStart = true
    } = options;

    // State
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Refs for stable references
    const onCooldownEndRef = useRef(onCooldownEnd);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Update callback ref when it changes
    useEffect(() => {
        onCooldownEndRef.current = onCooldownEnd;
    }, [onCooldownEnd]);

    // Countdown hook for timer display
    const countdown = useCountdown({
        targetDate: expiresAt,
        onComplete: () => {
            setExpiresAt(null);
            clearCooldownFromStorage();
            onCooldownEndRef.current?.();
        },
        autoStart
    });

    // Derived state
    const isInCooldown = expiresAt !== null && expiresAt > new Date();

    // Load initial cooldown state
    useEffect(() => {
        if (!sessionId) {
            setIsLoading(false);
            return;
        }

        const storedCooldown = loadCooldownFromStorage(sessionId);
        if (storedCooldown) {
            setExpiresAt(storedCooldown);
        }
        setIsLoading(false);
    }, [sessionId]);

    // Sync countdown target date when expiresAt changes
    useEffect(() => {
        countdown.setTargetDate(expiresAt);
        if (expiresAt && autoStart) {
            countdown.start();
        }
    }, [expiresAt, countdown, autoStart]);

    // Auto-refresh effect (optional periodic sync with server)
    useEffect(() => {
        if (!refreshInterval || refreshInterval <= 0) {
            return;
        }

        refreshIntervalRef.current = setInterval(() => {
            // This could be extended to periodically check server for cooldown updates
            // For now, we just verify local storage consistency
            if (sessionId && isInCooldown) {
                const storedCooldown = loadCooldownFromStorage(sessionId);
                if (!storedCooldown && expiresAt) {
                    // Local storage was cleared externally
                    setExpiresAt(null);
                }
            }
        }, refreshInterval);

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        };
    }, [refreshInterval, sessionId, isInCooldown, expiresAt]);

    // Control functions
    const setCooldown = useCallback((newExpiresAt: Date | string) => {
        const expiryDate = new Date(newExpiresAt);

        // Validate expiry date
        if (isNaN(expiryDate.getTime())) {
            console.warn('Invalid cooldown expiry date:', newExpiresAt);
            return;
        }

        // Only set if in the future
        if (expiryDate > new Date()) {
            setExpiresAt(expiryDate);
            if (sessionId) {
                saveCooldownToStorage(sessionId, expiryDate);
            }
        } else {
            // Expiry is in the past, clear cooldown
            setExpiresAt(null);
            clearCooldownFromStorage();
        }
    }, [sessionId]);

    const clearCooldown = useCallback(() => {
        setExpiresAt(null);
        clearCooldownFromStorage();
        countdown.stop();
    }, [countdown]);

    const refreshCooldown = useCallback(() => {
        if (!sessionId) {
            return;
        }

        const storedCooldown = loadCooldownFromStorage(sessionId);
        setExpiresAt(storedCooldown);
    }, [sessionId]);

    const startCountdown = useCallback(() => {
        countdown.start();
    }, [countdown]);

    const stopCountdown = useCallback(() => {
        countdown.stop();
    }, [countdown]);

    return {
        isInCooldown,
        expiresAt,
        remainingSeconds: countdown.remainingSeconds,
        formattedTime: countdown.formattedTime,
        isLoading,
        setCooldown,
        clearCooldown,
        refreshCooldown,
        startCountdown,
        stopCountdown
    };
}

export default useCooldown;