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

// Define the module type for i18next
interface BackendModule {
  type: 'backend';
  init(services: any, options?: any): void;
  read(language: string, namespace: string, callback: (error: any, data?: any) => void): void;
  create?(language: string, namespace: string, key: string, fallbackValue: string, callback: (error: any, data?: any) => void): void;
  save?(language: string, namespace: string, data: any, callback: (error: any, data?: any) => void): void;
}

// Custom backend for Supabase
class SupabaseBackend implements BackendModule {
  // Define the type property as 'backend' for i18next
  static type: 'backend' = 'backend';
  type: 'backend' = 'backend';
  
  services: any;
  options: any;
  translations: Record<string, Record<string, Record<string, string>>>;
  
  constructor(services?: any, options: any = {}) {
    this.init(services, options);
  }

  init(services?: any, options: any = {}) {
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
      const translations: Record<string, Record<string, Record<string, string>>> = {};
      
      if (data) {
        data.forEach(item => {
          if (!translations[item.language]) {
            translations[item.language] = {};
          }
          
          if (!translations[item.language][item.namespace]) {
            translations[item.language][item.namespace] = {};
          }
          
          translations[item.language][item.namespace][item.key] = item.value;
        });
      }
      
      this.translations = translations;
      return translations;
    } catch (error) {
      console.error('Error loading translations from Supabase:', error);
      return {};
    }
  }

  read(language: string, namespace: string, callback: (error: any, data?: any) => void) {
    // Use a Promise to handle the async operation
    this.readAsync(language, namespace)
      .then(result => callback(null, result))
      .catch(error => callback(error));
  }

  private async readAsync(language: string, namespace: string): Promise<Record<string, string>> {
    try {
      // If translations are already loaded, use them
      if (Object.keys(this.translations).length > 0) {
        return this.translations[language]?.[namespace] || {};
      }
      
      // Otherwise load them first
      const translations = await this.loadTranslations();
      return translations[language]?.[namespace] || {};
    } catch (error) {
      console.error('Error reading translations:', error);
      return {};
    }
  }
}

// Create and initialize the Supabase backend
const supabaseBackend = new SupabaseBackend();

// Initialize i18next
i18n
    // Use language detector
    .use(LanguageDetector)
    // Register the custom Supabase backend
    .use(supabaseBackend as any)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        fallbackLng: 'en', // Default to English
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
            'section.trusted-by', // Use hyphen instead of dot
        ],
        defaultNS: 'common',
    });

// Load translations immediately
supabaseBackend.loadTranslations().then(translations => {
  // Add resources to i18next
  Object.keys(translations).forEach(language => {
    Object.keys(translations[language] || {}).forEach(namespace => {
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
  // Clear localStorage to force fresh data
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('i18next_')) {
      localStorage.removeItem(key);
    }
  });
  
  const translations = await supabaseBackend.loadTranslations();
  
  // Clear existing resources and add new ones
  Object.keys(translations).forEach(language => {
    Object.keys(translations[language] || {}).forEach(namespace => {
      i18n.addResourceBundle(
        language,
        namespace,
        translations[language][namespace],
        true,
        true
      );
    });
  });
  
  // Force reload all resources
  await i18n.reloadResources();
  
  return translations;
};

// Function to get available languages
export const getAvailableLanguages = () => {
    return Object.keys(LANGUAGES);
};

// Function to get default language
export const getDefaultLanguage = () => {
    return 'en'; // Default to English
};

export default i18n;
