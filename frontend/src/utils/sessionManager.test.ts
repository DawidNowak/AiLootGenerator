/**
 * Unit tests for session manager utilities
 */

import {
    generateSessionId,
    getCurrentSessionId,
    clearStoredSessionId,
    regenerateSessionId
} from './sessionManager';

// Mock sessionStorage
const mockSessionStorage = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        key: jest.fn(),
        length: 0,
        _store: store // Internal access for testing
    };
})();

// Mock crypto.randomUUID
const mockCrypto = {
    randomUUID: jest.fn(() => '550e8400-e29b-41d4-a716-446655440000')
};

// Mock console.warn to capture warnings during tests
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => { });

describe('sessionManager', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        mockConsoleWarn.mockClear();

        // Reset mockCrypto to default value
        mockCrypto.randomUUID.mockReturnValue('550e8400-e29b-41d4-a716-446655440000');

        // Reset the sessionStorage store
        (mockSessionStorage as any)._store = {};

        // Setup sessionStorage mock behavior
        (mockSessionStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            return (mockSessionStorage as any)._store[key] || null;
        });
        (mockSessionStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
            (mockSessionStorage as any)._store[key] = value;
        });
        (mockSessionStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
            delete (mockSessionStorage as any)._store[key];
        });

        // Mock global sessionStorage
        Object.defineProperty(window, 'sessionStorage', {
            value: mockSessionStorage,
            writable: true,
            configurable: true
        });

        // Mock global crypto
        Object.defineProperty(global, 'crypto', {
            value: mockCrypto,
            writable: true,
            configurable: true
        });
    });

    afterAll(() => {
        mockConsoleWarn.mockRestore();
    });

    describe('generateSessionId', () => {
        it('should use crypto.randomUUID when available', () => {
            const sessionId = generateSessionId();

            expect(mockCrypto.randomUUID).toHaveBeenCalledTimes(1);
            expect(sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
        });

        it('should fall back to custom implementation when crypto.randomUUID is not available', () => {
            // Remove crypto.randomUUID
            delete (global as any).crypto;

            const sessionId = generateSessionId();

            expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        });

        it('should fall back when crypto is undefined', () => {
            // Set crypto to undefined
            Object.defineProperty(global, 'crypto', {
                value: undefined,
                writable: true,
                configurable: true
            });

            const sessionId = generateSessionId();

            expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        });

        it('should generate different UUIDs on subsequent calls (fallback)', () => {
            // Remove crypto to test fallback
            delete (global as any).crypto;

            const sessionId1 = generateSessionId();
            const sessionId2 = generateSessionId();

            expect(sessionId1).not.toBe(sessionId2);
            expect(sessionId1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(sessionId2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        });
    });

    describe('getCurrentSessionId', () => {
        it('should return existing session ID when one is stored', () => {
            const existingId = 'existing-session-id';
            (mockSessionStorage as any)._store['warhammer-loot-session-id'] = existingId;

            const sessionId = getCurrentSessionId();

            expect(sessionId).toBe(existingId);
            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('warhammer-loot-session-id');
        });

        it('should generate and store new session ID when none exists', () => {
            const sessionId = getCurrentSessionId();

            expect(mockCrypto.randomUUID).toHaveBeenCalledTimes(1);
            expect(sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('warhammer-loot-session-id', sessionId);
        });

        it('should generate new session ID when stored value is null', () => {
            (mockSessionStorage.getItem as jest.Mock).mockReturnValue(null);

            const sessionId = getCurrentSessionId();

            expect(sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('warhammer-loot-session-id', sessionId);
        });

        it('should generate new session ID when sessionStorage throws error', () => {
            (mockSessionStorage.getItem as jest.Mock).mockImplementation(() => {
                throw new Error('SessionStorage not available');
            });

            const sessionId = getCurrentSessionId();

            expect(sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(mockConsoleWarn).toHaveBeenCalledWith('SessionStorage not available:', expect.any(Error));
        });
    });

    describe('clearStoredSessionId', () => {
        it('should remove session ID from sessionStorage', () => {
            (mockSessionStorage as any)._store['warhammer-loot-session-id'] = 'test-session';

            clearStoredSessionId();

            expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('warhammer-loot-session-id');
        });

        it('should handle sessionStorage errors gracefully', () => {
            (mockSessionStorage.removeItem as jest.Mock).mockImplementation(() => {
                throw new Error('SessionStorage error');
            });

            expect(() => clearStoredSessionId()).not.toThrow();
            expect(mockConsoleWarn).toHaveBeenCalledWith('Failed to clear session ID:', expect.any(Error));
        });
    });

    describe('regenerateSessionId', () => {
        it('should generate new session ID and store it', () => {
            const newSessionId = regenerateSessionId();

            expect(newSessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(mockCrypto.randomUUID).toHaveBeenCalledTimes(1);
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('warhammer-loot-session-id', newSessionId);
        });

        it('should replace existing session ID', () => {
            (mockSessionStorage as any)._store['warhammer-loot-session-id'] = 'old-session';

            const newSessionId = regenerateSessionId();

            expect(newSessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('warhammer-loot-session-id', newSessionId);
        });

        it('should handle sessionStorage errors gracefully', () => {
            (mockSessionStorage.setItem as jest.Mock).mockImplementation(() => {
                throw new Error('SessionStorage quota exceeded');
            });

            const newSessionId = regenerateSessionId();

            expect(newSessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(mockConsoleWarn).toHaveBeenCalledWith('Failed to store session ID:', expect.any(Error));
        });
    });

    describe('sessionStorage integration', () => {
        it('should persist session ID across getCurrentSessionId calls', () => {
            const firstCall = getCurrentSessionId();
            const secondCall = getCurrentSessionId();

            expect(firstCall).toBe(secondCall);
            expect(mockCrypto.randomUUID).toHaveBeenCalledTimes(1); // Only called once
        });

        it('should use different session ID after regeneration', () => {
            const originalId = getCurrentSessionId();

            // Mock a different UUID for regeneration
            mockCrypto.randomUUID.mockReturnValue('new-uuid-after-regeneration');

            const newId = regenerateSessionId();
            const retrievedId = getCurrentSessionId();

            expect(originalId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(newId).toBe('new-uuid-after-regeneration');
            expect(retrievedId).toBe('new-uuid-after-regeneration');
        });

        it('should start fresh after clearing session ID', () => {
            // Ensure we start with a known state
            mockCrypto.randomUUID.mockReturnValue('550e8400-e29b-41d4-a716-446655440000');
            const originalId = getCurrentSessionId();

            clearStoredSessionId();

            // Mock a different UUID for the new session
            mockCrypto.randomUUID.mockReturnValue('fresh-session-id');

            const newId = getCurrentSessionId();

            expect(originalId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(newId).toBe('fresh-session-id');
        });
    });

    describe('edge cases', () => {
        it('should handle missing sessionStorage gracefully', () => {
            // Ensure proper mock setup
            mockCrypto.randomUUID.mockReturnValue('550e8400-e29b-41d4-a716-446655440000');

            // Remove sessionStorage entirely
            Object.defineProperty(window, 'sessionStorage', {
                value: undefined,
                writable: true,
                configurable: true
            });

            const sessionId = getCurrentSessionId();

            expect(sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(mockConsoleWarn).toHaveBeenCalledWith('SessionStorage not available:', expect.any(Error));
        });

        it('should handle sessionStorage quota exceeded gracefully', () => {
            // Ensure proper mock setup
            mockCrypto.randomUUID.mockReturnValue('550e8400-e29b-41d4-a716-446655440000');

            (mockSessionStorage.setItem as jest.Mock).mockImplementation(() => {
                throw new DOMException('QuotaExceededError');
            });

            const sessionId = getCurrentSessionId();

            expect(sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(mockConsoleWarn).toHaveBeenCalledWith('Failed to store session ID:', expect.any(DOMException));
        });
    });
});