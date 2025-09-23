import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './en/common.json';
import enLoot from './en/loot.json';
import enForm from './en/form.json';
import enErrors from './en/errors.json';
import enWarhammer from './en/warhammer.json';

import plCommon from './pl/common.json';
import plLoot from './pl/loot.json';
import plForm from './pl/form.json';
import plErrors from './pl/errors.json';
import plWarhammer from './pl/warhammer.json';

// Translation resources
const resources = {
    en: {
        common: enCommon,
        loot: enLoot,
        form: enForm,
        errors: enErrors,
        warhammer: enWarhammer,
    },
    pl: {
        common: plCommon,
        loot: plLoot,
        form: plForm,
        errors: plErrors,
        warhammer: plWarhammer,
    },
};

i18n
    .use(LanguageDetector) // Automatically detect user language
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources,
        lng: 'pl', // Default language
        fallbackLng: 'pl', // Fallback language if translation is missing

        // Language detection options
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage'],
        },

        // Namespace configuration
        defaultNS: 'common',
        ns: ['common', 'loot', 'form', 'errors', 'warhammer'],

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        // Debug configuration
        debug: process.env.NODE_ENV === 'development',

        // React specific options
        react: {
            useSuspense: false, // Disable suspense to avoid loading state issues
        },
    });

export default i18n;