import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// Define supported languages
export const LANGUAGES = {
    id: { nativeName: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩' }, // Indonesian as default
    en: { nativeName: 'English', dir: 'ltr', flag: '🇺🇸' },
    de: { nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
    ja: { nativeName: '日本語', dir: 'ltr', flag: '🇯🇵' },
    ko: { nativeName: '한국어', dir: 'ltr', flag: '🇰🇷' },
    zh: { nativeName: '中文', dir: 'ltr', flag: '🇨🇳' },
    ar: { nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
};

// Initialize i18next
i18n
    // Load translations from HTTP backend (local JSON files)
    .use(Backend)
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        fallbackLng: 'id', // Changed default to Indonesian
        supportedLngs: Object.keys(LANGUAGES),
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        react: {
            useSuspense: false, // We don't want to use Suspense for loading translations
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
        backend: {
            // Path to load local translation files from public folder
            loadPath: '/locales/{{lng}}/{{ns}}.json',
            // No need for crossDomain for local files
            crossDomain: false,
        },
        // Force reload when language changes
        load: 'currentOnly',
        // Make sure to retry loading translations if they fail
        retry: true,
        // Ensure namespaces are preloaded
        preload: Object.keys(LANGUAGES),
        // Default namespaces to load
        ns: [
            'common',
            'section.about',
            'section.contact',
            'section.faq',
            'section.hero',
            'section.process',
            'section.services',
            'section.testimonials',
            'section.trustedby',
        ],
        defaultNS: 'common',
    });

// Function to get available languages
export const getAvailableLanguages = () => {
    return Object.keys(LANGUAGES);
};

// Function to get default language
export const getDefaultLanguage = () => {
    return 'id'; // Default to Indonesian
};

export default i18n;
