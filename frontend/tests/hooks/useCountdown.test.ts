/**
 * Unit tests for useCountdown hook
 */

import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '../../src/hooks/useCountdown';

describe('useCountdown', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    describe('initialization', () => {
        it('should initialize with null target date', () => {
            const { result } = renderHook(() => useCountdown({ targetDate: null }));

            expect(result.current.remainingSeconds).toBe(0);
            expect(result.current.isActive).toBe(false);
            expect(result.current.isCompleted).toBe(true);
            expect(result.current.formattedTime).toBe('0s');
        });

        it('should initialize with future target date', () => {
            const futureDate = new Date('2023-01-01T12:01:00Z'); // 60 seconds from now
            const { result } = renderHook(() => useCountdown({ targetDate: futureDate }));

            expect(result.current.remainingSeconds).toBe(60);
            expect(result.current.isActive).toBe(true); // autoStart is true by default
            expect(result.current.isCompleted).toBe(false);
            expect(result.current.formattedTime).toBe('1m');
        });

        it('should initialize with past target date', () => {
            const pastDate = new Date('2023-01-01T11:59:00Z'); // 60 seconds ago
            const { result } = renderHook(() => useCountdown({ targetDate: pastDate }));

            expect(result.current.remainingSeconds).toBe(0);
            expect(result.current.isActive).toBe(false);
            expect(result.current.isCompleted).toBe(true);
            expect(result.current.formattedTime).toBe('0s');
        });

        it('should auto-start when configured', () => {
            const futureDate = new Date('2023-01-01T12:00:30Z'); // 30 seconds from now
            const { result } = renderHook(() =>
                useCountdown({ targetDate: futureDate, autoStart: true })
            );

            expect(result.current.isActive).toBe(true);
        });

        it('should not auto-start when disabled', () => {
            const futureDate = new Date('2023-01-01T12:00:30Z'); // 30 seconds from now
            const { result } = renderHook(() =>
                useCountdown({ targetDate: futureDate, autoStart: false })
            );

            expect(result.current.isActive).toBe(false);
        });
    });

    describe('countdown logic', () => {
        it('should count down correctly', () => {
            const futureDate = new Date('2023-01-01T12:00:05Z'); // 5 seconds from now
            const { result } = renderHook(() =>
                useCountdown({ targetDate: futureDate, autoStart: true })
            );

            expect(result.current.remainingSeconds).toBe(5);

            // Advance timer by 2 seconds
            act(() => {
                jest.advanceTimersByTime(2000);
            });

            expect(result.current.remainingSeconds).toBe(3);

            // Advance timer by 3 more seconds
            act(() => {
                jest.advanceTimersByTime(3000);
            });

            expect(result.current.remainingSeconds).toBe(0);
            expect(result.current.isCompleted).toBe(true);
            expect(result.current.isActive).toBe(false);
        });

        it('should call onComplete when countdown reaches zero', () => {
            const onComplete = jest.fn();
            const futureDate = new Date('2023-01-01T12:00:02Z'); // 2 seconds from now

            const { result } = renderHook(() =>
                useCountdown({
                    targetDate: futureDate,
                    autoStart: true,
                    onComplete
                })
            );

            // Should not be called initially
            expect(onComplete).not.toHaveBeenCalled();
            expect(result.current.remainingSeconds).toBe(2);

            act(() => {
                jest.advanceTimersByTime(2000);
            });

            expect(onComplete).toHaveBeenCalledTimes(1);
        });

        it('should not call onComplete multiple times', () => {
            const onComplete = jest.fn();
            const futureDate = new Date('2023-01-01T12:00:01Z'); // 1 second from now

            renderHook(() =>
                useCountdown({
                    targetDate: futureDate,
                    autoStart: true,
                    onComplete
                })
            );

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(onComplete).toHaveBeenCalledTimes(1);

            // Advance more time
            act(() => {
                jest.advanceTimersByTime(2000);
            });

            expect(onComplete).toHaveBeenCalledTimes(1); // Should still be 1
        });

        it('should use custom interval', () => {
            const futureDate = new Date('2023-01-01T12:00:05Z'); // 5 seconds from now
            const { result } = renderHook(() =>
                useCountdown({
                    targetDate: futureDate,
                    autoStart: true,
                    interval: 500 // 500ms interval
                })
            );

            expect(result.current.remainingSeconds).toBe(5);

            // Advance by 500ms
            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(result.current.remainingSeconds).toBe(4); // Should update every 500ms
        });
    });

    describe('controls', () => {
        it('should start and stop countdown', () => {
            const futureDate = new Date('2023-01-01T12:00:05Z'); // 5 seconds from now
            const { result } = renderHook(() => useCountdown({ targetDate: futureDate, autoStart: false }));

            expect(result.current.isActive).toBe(false);

            act(() => {
                result.current.start();
            });

            expect(result.current.isActive).toBe(true);

            act(() => {
                result.current.stop();
            });

            expect(result.current.isActive).toBe(false);
        });

        it('should reset countdown', () => {
            const futureDate = new Date('2023-01-01T12:00:05Z'); // 5 seconds from now
            const { result } = renderHook(() => useCountdown({ targetDate: futureDate, autoStart: true }));

            expect(result.current.remainingSeconds).toBe(5);

            // Let some time pass - advance the fake system time
            act(() => {
                jest.advanceTimersByTime(2000);
                jest.setSystemTime(new Date('2023-01-01T12:00:02Z')); // Advance system time by 2 seconds
            });

            expect(result.current.remainingSeconds).toBe(3);

            // Reset should recalculate from current time to target
            act(() => {
                result.current.reset();
            });

            expect(result.current.remainingSeconds).toBe(3); // Still 3 seconds from current time
            expect(result.current.isActive).toBe(true); // Should auto-start after reset
        });

        it('should set new target date', () => {
            const { result } = renderHook(() => useCountdown({ targetDate: null }));

            expect(result.current.remainingSeconds).toBe(0);

            const newDate = new Date('2023-01-01T12:00:10Z'); // 10 seconds from now
            act(() => {
                result.current.setTargetDate(newDate);
            });

            expect(result.current.remainingSeconds).toBe(10);
        });
    });

    describe('time formatting', () => {
        it('should format seconds only', () => {
            const futureDate = new Date('2023-01-01T12:00:30Z'); // 30 seconds from now
            const { result } = renderHook(() => useCountdown({ targetDate: futureDate, autoStart: false }));

            expect(result.current.formattedTime).toBe('30s');
        });

        it('should format minutes and seconds', () => {
            const futureDate = new Date('2023-01-01T12:02:30Z'); // 2 minutes 30 seconds from now
            const { result } = renderHook(() => useCountdown({ targetDate: futureDate, autoStart: false }));

            expect(result.current.formattedTime).toBe('2m 30s');
        });

        it('should format hours, minutes, and seconds', () => {
            const futureDate = new Date('2023-01-01T14:02:30Z'); // 2 hours 2 minutes 30 seconds from now
            const { result } = renderHook(() => useCountdown({ targetDate: futureDate, autoStart: false }));

            expect(result.current.formattedTime).toBe('2h 2m 30s');
        });

        it('should format exact minutes', () => {
            const futureDate = new Date('2023-01-01T12:02:00Z'); // Exactly 2 minutes from now
            const { result } = renderHook(() => useCountdown({ targetDate: futureDate, autoStart: false }));

            expect(result.current.formattedTime).toBe('2m');
        });

        it('should show 0s when expired', () => {
            const pastDate = new Date('2023-01-01T11:59:00Z'); // Past date
            const { result } = renderHook(() => useCountdown({ targetDate: pastDate }));

            expect(result.current.formattedTime).toBe('0s');
        });
    });

    describe('edge cases', () => {
        it('should handle string target dates', () => {
            const { result } = renderHook(() =>
                useCountdown({ targetDate: '2023-01-01T12:00:30Z', autoStart: false })
            );

            expect(result.current.remainingSeconds).toBe(30);
        });

        it('should handle invalid string dates', () => {
            const { result } = renderHook(() =>
                useCountdown({ targetDate: 'invalid-date' })
            );

            expect(result.current.remainingSeconds).toBe(0);
            expect(result.current.isCompleted).toBe(true);
        });

        it('should cleanup interval on unmount', () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            const futureDate = new Date('2023-01-01T12:00:30Z');

            const { unmount } = renderHook(() =>
                useCountdown({ targetDate: futureDate, autoStart: true })
            );

            unmount();

            expect(clearIntervalSpy).toHaveBeenCalled();
            clearIntervalSpy.mockRestore();
        });

        it('should stop countdown when target becomes null', () => {
            const futureDate = new Date('2023-01-01T12:00:30Z');
            const { result, rerender } = renderHook(
                ({ targetDate }: { targetDate: Date | string | null }) => useCountdown({ targetDate, autoStart: true }),
                { initialProps: { targetDate: futureDate as Date | string | null } }
            );

            expect(result.current.isActive).toBe(true);

            rerender({ targetDate: null });

            expect(result.current.isActive).toBe(false);
            expect(result.current.remainingSeconds).toBe(0);
        });
    });
});