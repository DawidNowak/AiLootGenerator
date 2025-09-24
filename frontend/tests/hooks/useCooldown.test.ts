/**
 * Unit tests for useCooldown hook
 */

import { renderHook, act } from '@testing-library/react';
import { useCooldown } from '../../src/hooks/useCooldown';

// Mock localStorage
const mockLocalStorage = (() => {
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
        _store: store
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
});

// Mock useCountdown
const mockCountdown = {
    remainingSeconds: 0,
    isActive: false,
    isCompleted: true,
    formattedTime: '0s',
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
    setTargetDate: jest.fn()
};

jest.mock('../../src/hooks/useCountdown', () => ({
    useCountdown: jest.fn(() => mockCountdown)
}));

// Mock timers
jest.useFakeTimers();

describe('useCooldown', () => {
    const mockSessionId = 'test-session-123';
    const mockOnCooldownEnd = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
        mockLocalStorage.clear();

        // Reset countdown mock
        mockCountdown.remainingSeconds = 0;
        mockCountdown.isActive = false;
        mockCountdown.isCompleted = true;
        mockCountdown.formattedTime = '0s';
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('initialization', () => {
        it('should initialize with no cooldown', () => {
            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            expect(result.current.isInCooldown).toBe(false);
            expect(result.current.expiresAt).toBeNull();
            expect(result.current.remainingSeconds).toBe(0);
            expect(result.current.formattedTime).toBe('0s');
            expect(result.current.isLoading).toBe(false);
        });

        it('should load cooldown from localStorage', () => {
            const futureDate = new Date('2023-01-01T12:00:30Z');
            mockLocalStorage.setItem('warhammer-loot-cooldown', JSON.stringify({
                sessionId: mockSessionId,
                expiresAt: futureDate.toISOString(),
                timestamp: Date.now()
            }));

            mockCountdown.remainingSeconds = 30;
            mockCountdown.formattedTime = '30s';
            mockCountdown.isCompleted = false;

            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            expect(result.current.isInCooldown).toBe(true);
            expect(result.current.expiresAt).toEqual(futureDate);
            expect(result.current.remainingSeconds).toBe(30);
            expect(result.current.formattedTime).toBe('30s');
        });

        it('should ignore cooldown for different session ID', () => {
            const futureDate = new Date('2023-01-01T12:00:30Z');
            mockLocalStorage.setItem('warhammer-loot-cooldown', JSON.stringify({
                sessionId: 'different-session',
                expiresAt: futureDate.toISOString(),
                timestamp: Date.now()
            }));

            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            expect(result.current.isInCooldown).toBe(false);
        });

        it('should ignore expired cooldown from localStorage', () => {
            const pastDate = new Date('2023-01-01T11:59:00Z'); // 1 minute ago
            mockLocalStorage.setItem('warhammer-loot-cooldown', JSON.stringify({
                sessionId: mockSessionId,
                expiresAt: pastDate.toISOString(),
                timestamp: Date.now()
            }));

            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            expect(result.current.isInCooldown).toBe(false);
            expect(result.current.expiresAt).toBeNull();
        });

        it('should handle invalid localStorage data', () => {
            mockLocalStorage.setItem('warhammer-loot-cooldown', 'invalid-json');

            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            expect(result.current.isInCooldown).toBe(false);
        });

        it('should auto-start countdown when configured', () => {
            const futureDate = new Date('2023-01-01T12:00:30Z');
            mockLocalStorage.setItem('warhammer-loot-cooldown', JSON.stringify({
                sessionId: mockSessionId,
                expiresAt: futureDate.toISOString(),
                timestamp: Date.now()
            }));

            renderHook(() =>
                useCooldown({
                    sessionId: mockSessionId,
                    autoStart: true
                })
            );

            expect(mockCountdown.start).toHaveBeenCalled();
        });
    });

    describe('setCooldown', () => {
        it('should set a new cooldown', () => {
            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            const futureDate = new Date('2023-01-01T12:00:30Z');

            act(() => {
                result.current.setCooldown(futureDate);
            });

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'warhammer-loot-cooldown',
                expect.stringContaining(futureDate.toISOString())
            );

            expect(mockCountdown.setTargetDate).toHaveBeenCalledWith(futureDate);
            expect(result.current.isInCooldown).toBe(true);
            expect(result.current.expiresAt).toEqual(futureDate);
        });

        it('should accept string date', () => {
            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            const dateString = '2023-01-01T12:00:30Z';
            const expectedDate = new Date(dateString);

            act(() => {
                result.current.setCooldown(dateString);
            });

            expect(result.current.expiresAt).toEqual(expectedDate);
        });

        it('should handle localStorage errors gracefully', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Storage full');
            });

            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            const futureDate = new Date('2023-01-01T12:00:30Z');

            act(() => {
                result.current.setCooldown(futureDate);
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Failed to save cooldown to localStorage:',
                expect.any(Error)
            );

            // Should still set the cooldown state even if localStorage fails
            expect(result.current.isInCooldown).toBe(true);

            consoleWarnSpy.mockRestore();
        });
    });

    describe('clearCooldown', () => {
        it('should clear existing cooldown', () => {
            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            // Set a cooldown first
            const futureDate = new Date('2023-01-01T12:00:30Z');
            act(() => {
                result.current.setCooldown(futureDate);
            });

            expect(result.current.isInCooldown).toBe(true);

            // Clear the cooldown
            act(() => {
                result.current.clearCooldown();
            });

            expect(result.current.isInCooldown).toBe(false);
            expect(result.current.expiresAt).toBeNull();
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('warhammer-loot-cooldown');
            expect(mockCountdown.stop).toHaveBeenCalled();
            expect(mockCountdown.setTargetDate).toHaveBeenCalledWith(null);
        });
    });

    describe('countdown integration', () => {
        it('should end cooldown when countdown completes', () => {
            const { result } = renderHook(() =>
                useCooldown({
                    sessionId: mockSessionId,
                    onCooldownEnd: mockOnCooldownEnd
                })
            );

            // Set a cooldown
            const futureDate = new Date('2023-01-01T12:00:30Z');
            act(() => {
                result.current.setCooldown(futureDate);
            });

            expect(result.current.isInCooldown).toBe(true);

            // Simulate countdown completion
            mockCountdown.isCompleted = true;
            mockCountdown.remainingSeconds = 0;
            mockCountdown.formattedTime = '0s';

            // Trigger a re-render to check countdown completion
            act(() => {
                // This simulates the useEffect that checks for countdown completion
                result.current.refreshCooldown();
            });

            expect(result.current.isInCooldown).toBe(false);
            expect(mockOnCooldownEnd).toHaveBeenCalled();
        });

        it('should update state from countdown', () => {
            mockCountdown.remainingSeconds = 25;
            mockCountdown.formattedTime = '25s';
            mockCountdown.isCompleted = false;

            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            expect(result.current.remainingSeconds).toBe(25);
            expect(result.current.formattedTime).toBe('25s');
        });
    });

    describe('controls', () => {
        it('should start countdown', () => {
            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            act(() => {
                result.current.startCountdown();
            });

            expect(mockCountdown.start).toHaveBeenCalled();
        });

        it('should stop countdown', () => {
            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            act(() => {
                result.current.stopCountdown();
            });

            expect(mockCountdown.stop).toHaveBeenCalled();
        });

        it('should refresh cooldown state', () => {
            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            act(() => {
                result.current.refreshCooldown();
            });

            // Should trigger a state update
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle missing sessionId', () => {
            const { result } = renderHook(() => useCooldown({}));

            expect(result.current.isInCooldown).toBe(false);
        });

        it('should handle localStorage access errors', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('Storage access denied');
            });

            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Failed to load cooldown from localStorage:',
                expect.any(Error)
            );

            expect(result.current.isInCooldown).toBe(false);
            consoleWarnSpy.mockRestore();
        });

        it('should handle invalid dates in setCooldown', () => {
            const { result } = renderHook(() =>
                useCooldown({ sessionId: mockSessionId })
            );

            act(() => {
                result.current.setCooldown('invalid-date');
            });

            // Should not set cooldown with invalid date
            expect(result.current.isInCooldown).toBe(false);
        });
    });
});