import { supabase } from './supabase';

// Function to create translations table if it doesn't exist
export const setupTranslationsTable = async () => {
  try {
    // Check if table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('translations')
      .select('count(*)', { count: 'exact', head: true });
    
    if (tableCheckError) {
      console.error('Error checking translations table:', tableCheckError);
      
      // Try to create the table if it doesn't exist
      const { error: createError } = await supabase.rpc('create_translations_table');
      
      if (createError) {
        console.error('Error creating translations table:', createError);
        return false;
      }
      
      console.log('Translations table created successfully');
    } else {
      console.log('Translations table already exists');
    }
    
    // Insert initial data if table is empty
    const count = tableExists && 'count' in tableExists ? tableExists.count : 0;
    
    if (count === 0) {
      await insertInitialTranslations();
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up translations table:', error);
    return false;
  }
};

// Function to insert initial translations
const insertInitialTranslations = async () => {
  try {
    // Sample translations for common namespace
    const commonTranslations = [
      // Indonesian (id) - default language
      { language: 'id', namespace: 'common', key: 'welcome', value: 'Selamat Datang' },
      { language: 'id', namespace: 'common', key: 'language', value: 'Bahasa' },
      
      // English (en)
      { language: 'en', namespace: 'common', key: 'welcome', value: 'Welcome' },
      { language: 'en', namespace: 'common', key: 'language', value: 'Language' },
      
      // German (de)
      { language: 'de', namespace: 'common', key: 'welcome', value: 'Willkommen' },
      { language: 'de', namespace: 'common', key: 'language', value: 'Sprache' },
      
      // Japanese (ja)
      { language: 'ja', namespace: 'common', key: 'welcome', value: 'ようこそ' },
      { language: 'ja', namespace: 'common', key: 'language', value: '言語' },
      
      // Korean (ko)
      { language: 'ko', namespace: 'common', key: 'welcome', value: '환영합니다' },
      { language: 'ko', namespace: 'common', key: 'language', value: '언어' },
      
      // Chinese (zh)
      { language: 'zh', namespace: 'common', key: 'welcome', value: '欢迎' },
      { language: 'zh', namespace: 'common', key: 'language', value: '语言' },
      
      // Arabic (ar)
      { language: 'ar', namespace: 'common', key: 'welcome', value: 'مرحبا' },
      { language: 'ar', namespace: 'common', key: 'language', value: 'لغة' },
    ];
    
    // Sample translations for section.trustedby namespace
    const trustedByTranslations = [
      { language: 'id', namespace: 'section.trustedby', key: 'title', value: 'Dipercaya Oleh' },
      { language: 'en', namespace: 'section.trustedby', key: 'title', value: 'Trusted By' },
      { language: 'de', namespace: 'section.trustedby', key: 'title', value: 'Vertraut von' },
      { language: 'ja', namespace: 'section.trustedby', key: 'title', value: '信頼されている' },
      { language: 'ko', namespace: 'section.trustedby', key: 'title', value: '신뢰받는' },
      { language: 'zh', namespace: 'section.trustedby', key: 'title', value: '受信任' },
      { language: 'ar', namespace: 'section.trustedby', key: 'title', value: 'موثوق به من قبل' },
    ];
    
    // Combine all translations
    const allTranslations = [
      ...commonTranslations,
      ...trustedByTranslations,
    ];
    
    // Insert translations in batches
    const { error } = await supabase
      .from('translations')
      .insert(allTranslations);
    
    if (error) {
      console.error('Error inserting initial translations:', error);
      return false;
    }
    
    console.log('Initial translations inserted successfully');
    return true;
  } catch (error) {
    console.error('Error inserting initial translations:', error);
    return false;
  }
};

// Function to check and add missing translations for a specific namespace
export const checkAndAddMissingTranslations = async (namespace: string) => {
  try {
    console.log(`Checking for missing translations in namespace: ${namespace}`);
    
    // Get existing translations for this namespace
    const { data: existingTranslations, error: fetchError } = await supabase
      .from('translations')
      .select('language, key')
      .eq('namespace', namespace);
    
    if (fetchError) {
      console.error(`Error fetching existing translations for ${namespace}:`, fetchError);
      return false;
    }
    
    // Create a map of existing translations for quick lookup
    const existingKeys = new Map();
    existingTranslations?.forEach(item => {
      const mapKey = `${item.language}:${item.key}`;
      existingKeys.set(mapKey, true);
    });
    
    console.log(`Found ${existingKeys.size} existing translations for ${namespace}`);
    
    // Return true since we're not hardcoding translations anymore
    return true;
  } catch (error) {
    console.error(`Error checking missing translations for ${namespace}:`, error);
    return false;
  }
};

// Function to add only the missing service translations
export const addMissingServiceTranslations = async () => {
  return await checkAndAddMissingTranslations('section.services');
};

// Function to add translations for the trusted-by section (with hyphen)
export const addTrustedByTranslations = async () => {
  return await checkAndAddMissingTranslations('section.trusted-by');
};

// Function to add translations for the process steps
export const addProcessStepTranslations = async () => {
  return await checkAndAddMissingTranslations('section.process');
};

// Function to fix all missing translations at once
export const fixAllMissingTranslations = async () => {
  try {
    // Run all translation fixes
    await Promise.all([
      checkAndAddMissingTranslations('section.services'),
      checkAndAddMissingTranslations('section.trusted-by'),
      checkAndAddMissingTranslations('section.process')
    ]);
    
    console.log('All missing translations checked successfully');
    return true;
  } catch (error) {
    console.error('Error checking missing translations:', error);
    return false;
  }
};

// Export function to manually trigger setup
export const initializeTranslations = async () => {
  return await setupTranslationsTable();
};
