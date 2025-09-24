/**
 * Unit tests for useLanguage hook
 */

import { renderHook, act } from '@testing-library/react';
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
        mockChangeLanguage.mockRejectedValue(new Error('Failed to load language'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const { result } = renderHook(() => useLanguage());

        await act(async () => {
            await result.current.changeLanguage('pl');
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to change language:',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it('should provide available languages', () => {
        const { result } = renderHook(() => useLanguage());

        expect(result.current.availableLanguages).toEqual([
            { code: 'en', name: expect.any(String) },
            { code: 'pl', name: expect.any(String) },
        ]);
    });
});