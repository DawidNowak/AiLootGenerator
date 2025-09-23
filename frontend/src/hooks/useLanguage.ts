/**
 * Language Switching Hook for Warhammer Fantasy Loot Generator
 * Task: T047 - Create language switching hook
 * 
 * Manages language state and switching for both UI and content generation.
 * Integrates with React i18next for UI translations.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '../types/index';

/**
 * Language state information
 */
export interface LanguageState {
    /** Currently selected language */
    currentLanguage: Language;
    /** Available languages */
    availableLanguages: Language[];
    /** Whether language is being switched */
    isChanging: boolean;
    /** Whether language data is loading */
    isLoading: boolean;
}

/**
 * Language hook options
 */
export interface UseLanguageOptions {
    /** Default language if none is stored */
    defaultLanguage?: Language;
    /** Whether to persist language choice in localStorage */
    persist?: boolean;
    /** Callback when language changes */
    onChange?: (language: Language) => void;
    /** Whether to automatically detect browser language */
    autoDetect?: boolean;
}

/**
 * Language hook return value
 */
export interface LanguageResult extends LanguageState {
    /** Change to a specific language */
    changeLanguage: (language: Language) => Promise<void>;
    /** Toggle between available languages */
    toggleLanguage: () => Promise<void>;
    /** Reset to default language */
    reset: () => Promise<void>;
    /** Check if a language is supported */
    isSupported: (language: string) => language is Language;
    /** Get display name for a language */
    getLanguageDisplayName: (language: Language) => string;
    /** Get native name for a language */
    getLanguageNativeName: (language: Language) => string;
}

/**
 * Local storage key for language persistence
 */
const LANGUAGE_STORAGE_KEY = 'warhammer-loot-language';

/**
 * Supported languages configuration
 */
const SUPPORTED_LANGUAGES: Language[] = ['en', 'pl'];

/**
 * Language display names (in English)
 */
const LANGUAGE_DISPLAY_NAMES: Record<Language, string> = {
    en: 'English',
    pl: 'Polish'
};

/**
 * Language native names
 */
const LANGUAGE_NATIVE_NAMES: Record<Language, string> = {
    en: 'English',
    pl: 'Polski'
};

/**
 * Detect browser language and return supported language or default
 */
function detectBrowserLanguage(fallback: Language = 'pl'): Language {
    try {
        // Get browser language preference
        const browserLang = navigator.language || (navigator as any).userLanguage;

        if (!browserLang) {
            return fallback;
        }

        // Extract language code (e.g., 'en-US' -> 'en')
        const langCode = browserLang.split('-')[0].toLowerCase();

        // Check if it's supported
        if (SUPPORTED_LANGUAGES.includes(langCode as Language)) {
            return langCode as Language;
        }

        return fallback;
    } catch (error) {
        console.warn('Failed to detect browser language:', error);
        return fallback;
    }
}

/**
 * Load language from localStorage
 */
function loadLanguageFromStorage(): Language | null {
    try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
            return stored as Language;
        }
        return null;
    } catch (error) {
        console.warn('Failed to load language from localStorage:', error);
        return null;
    }
}

/**
 * Save language to localStorage
 */
function saveLanguageToStorage(language: Language): void {
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
        console.warn('Failed to save language to localStorage:', error);
    }
}

/**
 * Language management hook
 * 
 * @param options - Language configuration
 * @returns Language state and controls
 * 
 * @example
 * ```typescript
 * const language = useLanguage({
 *   defaultLanguage: 'en',
 *   persist: true,
 *   autoDetect: true,
 *   onChange: (lang) => console.log('Language changed to:', lang)
 * });
 * 
 * const handleLanguageChange = async (newLang: Language) => {
 *   await language.changeLanguage(newLang);
 * };
 * 
 * return (
 *   <div>
 *     <button onClick={() => handleLanguageChange('en')}>
 *       {language.getLanguageDisplayName('en')}
 *     </button>
 *     <button onClick={() => handleLanguageChange('pl')}>
 *       {language.getLanguageDisplayName('pl')}
 *     </button>
 *     <button onClick={language.toggleLanguage}>
 *       Toggle Language
 *     </button>
 *     
 *     <p>Current: {language.getLanguageNativeName(language.currentLanguage)}</p>
 *   </div>
 * );
 * ```
 */
export function useLanguage(options: UseLanguageOptions = {}): LanguageResult {
    const {
        defaultLanguage = 'pl',
        persist = true,
        onChange,
        autoDetect = true
    } = options;

    const { i18n } = useTranslation();

    // Determine initial language
    const getInitialLanguage = useCallback((): Language => {
        // 1. Try stored language (if persistence enabled)
        if (persist) {
            const stored = loadLanguageFromStorage();
            if (stored) {
                return stored;
            }
        }

        // 2. Try auto-detection (if enabled)
        if (autoDetect) {
            return detectBrowserLanguage(defaultLanguage);
        }

        // 3. Use default
        return defaultLanguage;
    }, [persist, autoDetect, defaultLanguage]);

    // State
    const [state, setState] = useState<LanguageState>(() => ({
        currentLanguage: getInitialLanguage(),
        availableLanguages: SUPPORTED_LANGUAGES,
        isChanging: false,
        isLoading: false
    }));

    // Callback ref for stable reference
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Initialize i18n language on mount
    useEffect(() => {
        if (state.currentLanguage !== i18n.language) {
            setState(prev => ({ ...prev, isLoading: true }));

            i18n.changeLanguage(state.currentLanguage)
                .then(() => {
                    setState(prev => ({ ...prev, isLoading: false }));
                })
                .catch((error) => {
                    console.error('Failed to initialize i18n language:', error);
                    setState(prev => ({ ...prev, isLoading: false }));
                });
        }
    }, []); // Only run on mount

    // Change to specific language
    const changeLanguage = useCallback(async (language: Language): Promise<void> => {
        if (language === state.currentLanguage) {
            return; // No change needed
        }

        if (!SUPPORTED_LANGUAGES.includes(language)) {
            console.warn(`Unsupported language: ${language}`);
            return;
        }

        setState(prev => ({ ...prev, isChanging: true }));

        try {
            // Change i18n language
            await i18n.changeLanguage(language);

            // Update state
            setState(prev => ({
                ...prev,
                currentLanguage: language,
                isChanging: false
            }));

            // Persist if enabled
            if (persist) {
                saveLanguageToStorage(language);
            }

            // Call change callback
            onChangeRef.current?.(language);
        } catch (error) {
            console.error('Failed to change language:', error);
            setState(prev => ({ ...prev, isChanging: false }));
            throw error;
        }
    }, [state.currentLanguage, i18n, persist]);

    // Toggle between available languages
    const toggleLanguage = useCallback(async (): Promise<void> => {
        const currentIndex = SUPPORTED_LANGUAGES.indexOf(state.currentLanguage);
        const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
        const nextLanguage = SUPPORTED_LANGUAGES[nextIndex];

        await changeLanguage(nextLanguage);
    }, [state.currentLanguage, changeLanguage]);

    // Reset to default language
    const reset = useCallback(async (): Promise<void> => {
        await changeLanguage(defaultLanguage);
    }, [defaultLanguage, changeLanguage]);

    // Check if language is supported
    const isSupported = useCallback((language: string): language is Language => {
        return SUPPORTED_LANGUAGES.includes(language as Language);
    }, []);

    // Get display name for language
    const getLanguageDisplayName = useCallback((language: Language): string => {
        return LANGUAGE_DISPLAY_NAMES[language] || language;
    }, []);

    // Get native name for language
    const getLanguageNativeName = useCallback((language: Language): string => {
        return LANGUAGE_NATIVE_NAMES[language] || language;
    }, []);

    return {
        ...state,
        changeLanguage,
        toggleLanguage,
        reset,
        isSupported,
        getLanguageDisplayName,
        getLanguageNativeName
    };
}

export default useLanguage;