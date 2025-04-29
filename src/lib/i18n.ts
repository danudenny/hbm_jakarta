import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { supabase } from './supabase';

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

// Custom backend for Supabase
class SupabaseBackend {
  constructor(services, options = {}) {
    this.init(services, options);
  }

  init(services, options = {}) {
    this.services = services;
    this.options = options;
    this.translations = {};
  }

  async loadTranslations() {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*');
      
      if (error) throw error;
      
      // Group translations by language and namespace
      const translations = {};
      
      data.forEach(item => {
        if (!translations[item.language]) {
          translations[item.language] = {};
        }
        
        if (!translations[item.language][item.namespace]) {
          translations[item.language][item.namespace] = {};
        }
        
        translations[item.language][item.namespace][item.key] = item.value;
      });
      
      this.translations = translations;
      return translations;
    } catch (error) {
      console.error('Error loading translations from Supabase:', error);
      return {};
    }
  }

  async read(language, namespace, callback) {
    try {
      // If translations are already loaded, use them
      if (Object.keys(this.translations).length > 0) {
        const translations = this.translations[language]?.[namespace] || {};
        return callback(null, translations);
      }
      
      // Otherwise load them first
      const translations = await this.loadTranslations();
      const result = translations[language]?.[namespace] || {};
      
      callback(null, result);
    } catch (error) {
      console.error('Error reading translations:', error);
      callback(error, null);
    }
  }
}

// Initialize i18next
i18n
    // Use language detector
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        fallbackLng: 'id', // Default to Indonesian
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

// Create and initialize the Supabase backend
const supabaseBackend = new SupabaseBackend();

// Load translations immediately
supabaseBackend.loadTranslations().then(translations => {
  // Add resources to i18next
  Object.keys(translations).forEach(language => {
    Object.keys(translations[language]).forEach(namespace => {
      i18n.addResourceBundle(
        language,
        namespace,
        translations[language][namespace],
        true,
        true
      );
    });
  });
});

// Function to reload translations from Supabase
export const reloadTranslations = async () => {
  const translations = await supabaseBackend.loadTranslations();
  
  // Clear existing resources and add new ones
  Object.keys(translations).forEach(language => {
    Object.keys(translations[language]).forEach(namespace => {
      i18n.addResourceBundle(
        language,
        namespace,
        translations[language][namespace],
        true,
        true
      );
    });
  });
  
  return translations;
};

// Function to get available languages
export const getAvailableLanguages = () => {
    return Object.keys(LANGUAGES);
};

// Function to get default language
export const getDefaultLanguage = () => {
    return 'id'; // Default to Indonesian
};

export default i18n;
