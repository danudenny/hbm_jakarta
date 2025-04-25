import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { supabase } from './supabase';

// Define supported languages
export const LANGUAGES = {
  en: { nativeName: 'English', dir: 'ltr', flag: '🇺🇸' },
  id: { nativeName: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩' },
  ja: { nativeName: '日本語', dir: 'ltr', flag: '🇯🇵' },
  zh: { nativeName: '中文', dir: 'ltr', flag: '🇨🇳' },
  de: { nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  ar: { nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' }
};

// Create a proper i18next backend class
class SupabaseBackend {
  type = 'backend' as const;
  
  constructor(services: any, options: any) {
    this.init(services, options);
  }

  init(services: any, options: any) {
    /* services and options can be used if needed */
  }

  async read(language: string, namespace: string, callback: (error: Error | null, data?: any) => void) {
    try {
      // First try to get translations from Supabase
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language', language)
        .eq('namespace', namespace);

      if (error) throw error;

      // Transform the data into the format expected by i18next
      const resources = data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      // If no translations were found, return an empty object
      if (Object.keys(resources).length === 0) {
        console.warn(`No translations found in database for ${language}/${namespace}, falling back to local files`);
        // Let i18next continue to look for translations in other backends
        callback(null, {});
        return;
      }

      callback(null, resources);
    } catch (error) {
      console.error('Error loading translations from Supabase:', error);
      // Let i18next continue to look for translations in other backends
      callback(null, {});
    }
  }
}

// Initialize i18next
i18n
  // Load translations from HTTP backend (local JSON files)
  .use(Backend)
  // Load translations from Supabase
  .use(new SupabaseBackend({}, {}) as any)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
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
      // Path to load local translation files
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

// Function to get available languages from Supabase
export const getAvailableLanguages = async () => {
  try {
    const { data, error } = await supabase
      .from('language_settings')
      .select('available_languages')
      .single();

    if (error) throw error;
    
    return data.available_languages || ['en', 'id'];
  } catch (error) {
    console.error('Error fetching available languages:', error);
    return ['en', 'id']; // Default to English and Indonesian
  }
};

// Function to get default language from Supabase
export const getDefaultLanguage = async () => {
  try {
    const { data, error } = await supabase
      .from('language_settings')
      .select('default_language')
      .single();

    if (error) throw error;
    
    return data.default_language || 'en';
  } catch (error) {
    console.error('Error fetching default language:', error);
    return 'en'; // Default to English
  }
};

export default i18n;
