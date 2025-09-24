/**
 * Unit tests for useLootGeneration hook
 */

import { renderHook, act } from '@testing-library/react';
import { useLootGeneration } from '../../src/hooks/useLootGeneration';
import { WealthLevel } from '../../src/types';

// Mock loot service
jest.mock('../../src/services/lootService', () => ({
    generateLoot: jest.fn(),
}));

// Import the mocked function after mocking
import { generateLoot } from '../../src/services/lootService';
const mockGenerateLoot = generateLoot as jest.MockedFunction<typeof generateLoot>;

// Mock cooldown hook
jest.mock('../../src/hooks/useCooldown');
import { useCooldown } from '../../src/hooks/useCooldown';
const mockUseCooldown = useCooldown as jest.MockedFunction<typeof useCooldown>;

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: jest.fn((key: string) => key),
    }),
}));

describe('useLootGeneration', () => {
    const mockSessionId = 'test-session-123';

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock successful cooldown state
        mockUseCooldown.mockReturnValue({
            isInCooldown: false,
            remainingSeconds: 0,
            formattedTime: '0s',
            expiresAt: null,
            isLoading: false,
            setCooldown: jest.fn(),
            clearCooldown: jest.fn(),
            refreshCooldown: jest.fn(),
            startCountdown: jest.fn(),
            stopCountdown: jest.fn(),
        });

        // Mock successful generation
        mockGenerateLoot.mockResolvedValue({
            success: true,
            data: {
                items: [],
                generatedAt: new Date().toISOString(),
                cooldownExpiresAt: new Date(Date.now() + 30000).toISOString(),
            },
            responseTime: 1000,
        });
    });

    it('should initialize with idle state', () => {
        const { result } = renderHook(() =>
            useLootGeneration({ sessionId: mockSessionId })
        );

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(false);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.attemptCount).toBe(0);
    });

    it('should generate loot successfully', async () => {
        const { result } = renderHook(() =>
            useLootGeneration({ sessionId: mockSessionId })
        );

        let success: boolean = false;
        await act(async () => {
            success = await result.current.generate({
                location: 'Test Location',
                wealthLevel: WealthLevel.Common,
                language: 'en',
            });
        });

        expect(success).toBe(true);
        expect(mockGenerateLoot).toHaveBeenCalledWith(
            expect.objectContaining({
                location: 'Test Location',
                wealthLevel: WealthLevel.Common,
                language: 'en',
                sessionId: mockSessionId,
            })
        ); expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
        expect(result.current.data).toBeDefined();
    });

    it('should handle generation errors', async () => {
        mockGenerateLoot.mockResolvedValue({
            success: false,
            error: {
                type: 'validation',
                message: 'Invalid location',
            },
            responseTime: 500,
        });

        const { result } = renderHook(() =>
            useLootGeneration({ sessionId: mockSessionId })
        );

        let success: boolean = false;
        await act(async () => {
            success = await result.current.generate({
                location: '',
                wealthLevel: WealthLevel.Common,
                language: 'en',
            });
        });

        expect(success).toBe(false);
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual({
            type: 'validation',
            message: 'Invalid location',
        });
    });

    it('should reset state', () => {
        const { result } = renderHook(() =>
            useLootGeneration({ sessionId: mockSessionId })
        );

        act(() => {
            result.current.reset();
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(false);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.attemptCount).toBe(0);
    });

    it('should clear error state', async () => {
        mockGenerateLoot.mockResolvedValue({
            success: false,
            error: { type: 'server', message: 'Server error' },
            responseTime: 500,
        });

        const { result } = renderHook(() =>
            useLootGeneration({ sessionId: mockSessionId })
        );

        // Generate error
        await act(async () => {
            await result.current.generate({
                location: 'Test',
                wealthLevel: WealthLevel.Common,
                language: 'en',
            });
        });

        expect(result.current.isError).toBe(true);

        // Clear error
        act(() => {
            result.current.clearError();
        });

        expect(result.current.isError).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle cooldown state', () => {
        mockUseCooldown.mockReturnValue({
            isInCooldown: true,
            remainingSeconds: 30,
            formattedTime: '30s',
            expiresAt: new Date(),
            isLoading: false,
            setCooldown: jest.fn(),
            clearCooldown: jest.fn(),
            refreshCooldown: jest.fn(),
            startCountdown: jest.fn(),
            stopCountdown: jest.fn(),
        });

        const { result } = renderHook(() =>
            useLootGeneration({ sessionId: mockSessionId, manageCooldown: true })
        );

        expect(result.current.cooldown.isInCooldown).toBe(true);
        expect(result.current.cooldown.remainingSeconds).toBe(30);
        expect(result.current.cooldown.formattedTime).toBe('30s');
    });
});