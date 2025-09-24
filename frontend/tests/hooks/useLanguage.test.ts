/**
 * Unit tests for useLanguage hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useLanguage } from '../../src/hooks/useLanguage';

// Mock react-i18next
const mockChangeLanguage = jest.fn();
const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {
            language: 'en',
            changeLanguage: mockChangeLanguage,
        },
    }),
}));

describe('useLanguage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockChangeLanguage.mockResolvedValue(undefined);
    });

    it('should initialize with current language', () => {
        const { result } = renderHook(() => useLanguage());

        expect(result.current.currentLanguage).toBe('en');
        expect(result.current.isChanging).toBe(false);
    });

    it('should change language successfully', async () => {
        const { result } = renderHook(() => useLanguage());

        await act(async () => {
            await result.current.changeLanguage('pl');
        });

        expect(mockChangeLanguage).toHaveBeenCalledWith('pl');
        expect(result.current.isChanging).toBe(false);
    });

    it('should handle language change errors', async () => {
        const { result } = renderHook(() => useLanguage());

        // Wait for initialization to complete
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Mock console.error before setting up the rejection
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        // Clear all previous calls and set up rejection
        mockChangeLanguage.mockClear();
        mockChangeLanguage.mockRejectedValue(new Error('Failed to load language'));

        // The hook starts with 'pl' as default language, try changing to 'en'
        await act(async () => {
            try {
                await result.current.changeLanguage('en');
            } catch (error) {
                // Expected - the error should be caught and handled internally
            }
        });

        // Check if the mock was called
        expect(mockChangeLanguage).toHaveBeenCalledWith('en');

        // Check if console.error was called
        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to change language:',
            expect.any(Error)
        );

        expect(result.current.isChanging).toBe(false);

        consoleSpy.mockRestore();
    });

    it('should provide available languages', () => {
        const { result } = renderHook(() => useLanguage());

        expect(result.current.availableLanguages).toEqual([
            'en',
            'pl',
        ]);
    });
});