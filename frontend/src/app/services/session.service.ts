import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { map, distinctUntilChanged, takeWhile } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Interface for session data stored in localStorage.
 */
export interface SessionData {
    sessionId: string;
    cooldownExpiresAt: Date;
    createdAt: Date;
    lastUsedAt: Date;
    generationCount: number;
}

/**
 * Interface for cooldown status information.
 */
export interface CooldownStatus {
    isActive: boolean;
    remainingMs: number;
    remainingSeconds: number;
    expiresAt: Date | null;
}

/**
 * Service for managing user sessions and cooldown timers.
 * Handles GUID generation, session persistence, and cooldown tracking.
 */
@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private readonly SESSION_STORAGE_KEY = 'warhammer-loot-session';
    private readonly COOLDOWN_CHECK_INTERVAL = 1000; // Check every second

    private sessionData: SessionData | null = null;
    private cooldownStatus$ = new BehaviorSubject<CooldownStatus>({
        isActive: false,
        remainingMs: 0,
        remainingSeconds: 0,
        expiresAt: null
    });

    constructor() {
        this.initializeSession();
        this.startCooldownTimer();
    }

    /**
     * Gets the current session ID, generating a new one if needed.
     * @returns The current session GUID
     */
    getSessionId(): string {
        if (!this.sessionData) {
            this.createNewSession();
        }
        return this.sessionData!.sessionId;
    }

    /**
     * Gets the current session data.
     * @returns The session data or null if no session exists
     */
    getSessionData(): SessionData | null {
        return this.sessionData;
    }

    /**
     * Creates a new session with a fresh GUID.
     * @returns The new session data
     */
    createNewSession(): SessionData {
        const now = new Date();
        const sessionData: SessionData = {
            sessionId: this.generateGuid(),
            cooldownExpiresAt: new Date(0), // No cooldown initially
            createdAt: now,
            lastUsedAt: now,
            generationCount: 0
        };

        this.sessionData = sessionData;
        this.saveSessionToStorage();
        this.updateCooldownStatus();

        return sessionData;
    }

    /**
     * Updates the session after a successful loot generation.
     * @param cooldownExpiresAt - When the cooldown expires (from API response)
     */
    updateSessionAfterGeneration(cooldownExpiresAt: string | Date): void {
        if (!this.sessionData) {
            this.createNewSession();
        }

        const expiresAt = typeof cooldownExpiresAt === 'string'
            ? new Date(cooldownExpiresAt)
            : cooldownExpiresAt;

        this.sessionData!.cooldownExpiresAt = expiresAt;
        this.sessionData!.lastUsedAt = new Date();
        this.sessionData!.generationCount += 1;

        this.saveSessionToStorage();
        this.updateCooldownStatus();
    }

    /**
     * Gets an observable that emits the current cooldown status.
     * @returns Observable of cooldown status that updates in real-time
     */
    getCooldownStatus(): Observable<CooldownStatus> {
        return this.cooldownStatus$.asObservable().pipe(
            distinctUntilChanged((a, b) =>
                a.isActive === b.isActive &&
                Math.floor(a.remainingSeconds) === Math.floor(b.remainingSeconds)
            )
        );
    }

    /**
     * Checks if the session is currently in cooldown.
     * @returns True if cooldown is active, false otherwise
     */
    isCooldownActive(): boolean {
        return this.cooldownStatus$.value.isActive;
    }

    /**
     * Gets the remaining cooldown time in milliseconds.
     * @returns Remaining cooldown time in ms, 0 if no cooldown
     */
    getRemainingCooldownMs(): number {
        return this.cooldownStatus$.value.remainingMs;
    }

    /**
     * Gets the remaining cooldown time in seconds.
     * @returns Remaining cooldown time in seconds, 0 if no cooldown
     */
    getRemainingCooldownSeconds(): number {
        return this.cooldownStatus$.value.remainingSeconds;
    }

    /**
     * Manually clears the cooldown (for testing purposes).
     */
    clearCooldown(): void {
        if (this.sessionData) {
            this.sessionData.cooldownExpiresAt = new Date(0);
            this.saveSessionToStorage();
            this.updateCooldownStatus();
        }
    }

    /**
     * Resets the entire session, generating a new GUID.
     */
    resetSession(): void {
        this.sessionData = null;
        this.clearSessionFromStorage();
        this.createNewSession();
    }

    /**
     * Gets session statistics for display purposes.
     * @returns Object with session statistics
     */
    getSessionStats(): {
        sessionAge: number;
        generationCount: number;
        lastUsed: Date | null;
    } {
        if (!this.sessionData) {
            return {
                sessionAge: 0,
                generationCount: 0,
                lastUsed: null
            };
        }

        const sessionAge = Date.now() - this.sessionData.createdAt.getTime();

        return {
            sessionAge: Math.floor(sessionAge / 1000 / 60), // Age in minutes
            generationCount: this.sessionData.generationCount,
            lastUsed: this.sessionData.lastUsedAt
        };
    }

    /**
     * Initializes the session from localStorage or creates a new one.
     */
    private initializeSession(): void {
        try {
            const storedData = localStorage.getItem(this.SESSION_STORAGE_KEY);
            if (storedData) {
                const parsed = JSON.parse(storedData);
                this.sessionData = {
                    ...parsed,
                    cooldownExpiresAt: new Date(parsed.cooldownExpiresAt),
                    createdAt: new Date(parsed.createdAt),
                    lastUsedAt: new Date(parsed.lastUsedAt)
                };

                // Validate session data
                if (!this.isValidSessionData(this.sessionData)) {
                    this.createNewSession();
                }
            } else {
                this.createNewSession();
            }
        } catch (error) {
            console.warn('Failed to load session from storage, creating new session:', error);
            this.createNewSession();
        }

        this.updateCooldownStatus();
    }

    /**
     * Validates session data structure.
     * @param data - The session data to validate
     * @returns True if valid, false otherwise
     */
    private isValidSessionData(data: any): boolean {
        return data &&
            typeof data.sessionId === 'string' &&
            data.sessionId.length > 0 &&
            data.cooldownExpiresAt instanceof Date &&
            data.createdAt instanceof Date &&
            data.lastUsedAt instanceof Date &&
            typeof data.generationCount === 'number';
    }

    /**
     * Saves the current session to localStorage.
     */
    private saveSessionToStorage(): void {
        if (this.sessionData) {
            try {
                localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(this.sessionData));
            } catch (error) {
                console.warn('Failed to save session to storage:', error);
            }
        }
    }

    /**
     * Removes session data from localStorage.
     */
    private clearSessionFromStorage(): void {
        try {
            localStorage.removeItem(this.SESSION_STORAGE_KEY);
        } catch (error) {
            console.warn('Failed to clear session from storage:', error);
        }
    }

    /**
     * Generates a new GUID/UUID v4.
     * @returns A new GUID string
     */
    private generateGuid(): string {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            // Use modern crypto.randomUUID() if available
            return crypto.randomUUID();
        } else {
            // Fallback to manual generation
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }

    /**
     * Starts the cooldown timer that updates status every second.
     */
    private startCooldownTimer(): void {
        interval(this.COOLDOWN_CHECK_INTERVAL).subscribe(() => {
            this.updateCooldownStatus();
        });
    }

    /**
     * Updates the current cooldown status based on session data.
     */
    private updateCooldownStatus(): void {
        if (!this.sessionData) {
            this.cooldownStatus$.next({
                isActive: false,
                remainingMs: 0,
                remainingSeconds: 0,
                expiresAt: null
            });
            return;
        }

        const now = new Date();
        const expiresAt = this.sessionData.cooldownExpiresAt;
        const remainingMs = Math.max(0, expiresAt.getTime() - now.getTime());
        const isActive = remainingMs > 0;

        const status: CooldownStatus = {
            isActive,
            remainingMs,
            remainingSeconds: remainingMs / 1000,
            expiresAt: isActive ? expiresAt : null
        };

        this.cooldownStatus$.next(status);
    }
}