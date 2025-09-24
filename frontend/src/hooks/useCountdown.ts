/**
 * Countdown Timer Hook for Warhammer Fantasy Loot Generator
 * Task: T042 - Create countdown timer hook
 * 
 * Provides a reusable countdown timer with automatic updates.
 * Used for displaying cooldown periods and other time-based functionality.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Countdown hook options
 */
export interface UseCountdownOptions {
    /** Target date/time to count down to */
    targetDate: Date | string | null;
    /** Update interval in milliseconds (default: 1000ms) */
    interval?: number;
    /** Callback when countdown reaches zero */
    onComplete?: () => void;
    /** Whether to automatically start the countdown */
    autoStart?: boolean;
}

/**
 * Countdown hook return value
 */
export interface CountdownResult {
    /** Remaining time in seconds (0 if expired) */
    remainingSeconds: number;
    /** Whether the countdown is currently active */
    isActive: boolean;
    /** Whether the countdown has completed (reached zero) */
    isCompleted: boolean;
    /** Formatted time display (e.g., "2m 30s") */
    formattedTime: string;
    /** Start or restart the countdown */
    start: () => void;
    /** Stop the countdown */
    stop: () => void;
    /** Reset countdown to original target */
    reset: () => void;
    /** Update target date */
    setTargetDate: (date: Date | string | null) => void;
}

/**
 * Format seconds into human-readable time string
 */
function formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) {
        return '0s';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours}h`);
    }
    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }
    if (remainingSeconds > 0 || parts.length === 0) {
        parts.push(`${remainingSeconds}s`);
    }

    return parts.join(' ');
}

/**
 * Calculate remaining seconds until target date
 */
function calculateRemainingSeconds(targetDate: Date | string | null): number {
    if (!targetDate) {
        return 0;
    }

    const target = new Date(targetDate);

    // Check if the date is invalid
    if (isNaN(target.getTime())) {
        return 0;
    }

    const now = new Date();
    const diffMs = target.getTime() - now.getTime();

    return Math.max(0, Math.floor(diffMs / 1000));
}

/**
 * Countdown timer hook
 * 
 * @param options - Countdown configuration
 * @returns Countdown state and controls
 * 
 * @example
 * ```typescript
 * const cooldownExpiry = new Date(Date.now() + 30000); // 30 seconds from now
 * const countdown = useCountdown({
 *   targetDate: cooldownExpiry,
 *   onComplete: () => console.log('Cooldown finished!'),
 *   autoStart: true
 * });
 * 
 * return (
 *   <div>
 *     {countdown.isActive ? (
 *       <span>Next generation in: {countdown.formattedTime}</span>
 *     ) : (
 *       <span>Ready to generate!</span>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useCountdown(options: UseCountdownOptions): CountdownResult {
    const {
        targetDate,
        interval = 1000,
        onComplete,
        autoStart = true
    } = options;

    // State
    const [remainingSeconds, setRemainingSeconds] = useState(() =>
        calculateRemainingSeconds(targetDate)
    );
    const [isActive, setIsActive] = useState(() => {
        const initial = calculateRemainingSeconds(targetDate);
        return autoStart && initial > 0;
    });
    const [currentTargetDate, setCurrentTargetDate] = useState(targetDate);

    // Refs for stable references
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const onCompleteRef = useRef(onComplete);

    // Update callback ref when it changes
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Derived state
    const isCompleted = remainingSeconds === 0;
    const formattedTime = formatTimeRemaining(remainingSeconds);

    // Update countdown function
    const updateCountdown = useCallback(() => {
        const newRemainingSeconds = calculateRemainingSeconds(currentTargetDate);
        setRemainingSeconds(newRemainingSeconds);

        if (newRemainingSeconds === 0) {
            setIsActive(false);
            onCompleteRef.current?.();
        }
    }, [currentTargetDate]);

    // Interval effect
    useEffect(() => {
        if (!isActive || !currentTargetDate) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Initial update
        updateCountdown();

        // Set up interval
        intervalRef.current = setInterval(updateCountdown, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive, currentTargetDate, interval, updateCountdown]);

    // Control functions
    const start = useCallback(() => {
        setIsActive(true);
    }, []);

    const stop = useCallback(() => {
        setIsActive(false);
    }, []);

    const reset = useCallback(() => {
        const newRemainingSeconds = calculateRemainingSeconds(currentTargetDate);
        setRemainingSeconds(newRemainingSeconds);
        setIsActive(autoStart && newRemainingSeconds > 0);
    }, [currentTargetDate, autoStart]);

    const setTargetDate = useCallback((date: Date | string | null) => {
        setCurrentTargetDate(date);
        const newRemainingSeconds = calculateRemainingSeconds(date);
        setRemainingSeconds(newRemainingSeconds);

        if (date && autoStart && newRemainingSeconds > 0) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [autoStart]);

    // Update when target date prop changes
    useEffect(() => {
        setTargetDate(targetDate);
    }, [targetDate, setTargetDate]);

    return {
        remainingSeconds,
        isActive,
        isCompleted,
        formattedTime,
        start,
        stop,
        reset,
        setTargetDate
    };
}

export default useCountdown;