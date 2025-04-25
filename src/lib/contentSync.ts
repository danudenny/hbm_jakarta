import { supabase } from './supabase';
import toast from 'react-hot-toast';

interface LandingSection {
  id: string;
  name: string;
  title: string;
  subtitle: string | null;
  content: any;
  is_active: boolean;
}

/**
 * Synchronizes content from landing_sections to translations table
 * This ensures that when content is updated in the admin panel,
 * it's also updated in the translations system
 */
export const syncSectionToTranslations = async (
  section: LandingSection,
  language: string = 'en'
) => {
  try {
    const sectionNamespace = `section.${section.name}`;
    const translationsToSync: any[] = [];
    
    // Add title
    if (section.title) {
      translationsToSync.push({
        key: 'title',
        namespace: sectionNamespace,
        language,
        value: section.title
      });
    }
    
    // Add subtitle
    if (section.subtitle) {
      translationsToSync.push({
        key: 'subtitle',
        namespace: sectionNamespace,
        language,
        value: section.subtitle
      });
    }
    
    // Add content fields
    if (section.content) {
      // Handle different content structures for different sections
      if (section.name === 'hero') {
        if (section.content.description) {
          translationsToSync.push({
            key: 'description',
            namespace: sectionNamespace,
            language,
            value: section.content.description
          });
        }
        
        if (section.content.cta_text) {
          translationsToSync.push({
            key: 'cta_text',
            namespace: sectionNamespace,
            language,
            value: section.content.cta_text
          });
        }
        
        // Add title parts for colored styling
        if (section.title) {
          const titleWords = section.title.split(' ');
          const mainPart = titleWords.slice(0, -1).join(' ');
          const accentPart = titleWords.slice(-1)[0];
          
          translationsToSync.push({
            key: 'title_first_line',
            namespace: sectionNamespace,
            language,
            value: mainPart
          });
          
          translationsToSync.push({
            key: 'title_colored_part',
            namespace: sectionNamespace,
            language,
            value: accentPart
          });
        }
      } else {
        // For other sections, add all content fields as separate translations
        Object.entries(section.content).forEach(([key, value]) => {
          // Skip arrays and objects, only sync string values
          if (typeof value === 'string') {
            translationsToSync.push({
              key,
              namespace: sectionNamespace,
              language,
              value
            });
          } else if (Array.isArray(value)) {
            // For arrays like FAQs, we need special handling
            if (key === 'faqs' && section.name === 'faq') {
              value.forEach((faq: any, index: number) => {
                if (faq.question) {
                  translationsToSync.push({
                    key: `faq_${index + 1}_question`,
                    namespace: sectionNamespace,
                    language,
                    value: faq.question
                  });
                }
                if (faq.answer) {
                  translationsToSync.push({
                    key: `faq_${index + 1}_answer`,
                    namespace: sectionNamespace,
                    language,
                    value: faq.answer
                  });
                }
              });
            }
          }
        });
      }
    }
    
    // For each translation to sync, check if it exists and update or insert
    for (const translation of translationsToSync) {
      const { data: existingTranslation } = await supabase
        .from('translations')
        .select('id')
        .eq('key', translation.key)
        .eq('namespace', translation.namespace)
        .eq('language', translation.language)
        .maybeSingle();
      
      if (existingTranslation) {
        // Update existing translation
        await supabase
          .from('translations')
          .update({ value: translation.value })
          .eq('id', existingTranslation.id);
      } else {
        // Insert new translation
        await supabase
          .from('translations')
          .insert(translation);
      }
    }
    
    return {
      success: true,
      message: `Successfully synced ${translationsToSync.length} translations for ${section.name}`
    };
  } catch (error) {
    console.error('Error syncing section to translations:', error);
    return {
      success: false,
      message: 'Failed to sync section to translations'
    };
  }
};

/**
 * Updates a landing section and automatically syncs the changes to translations
 */
export const updateLandingSection = async (
  sectionId: string,
  updates: Partial<LandingSection>,
  language: string = 'en'
) => {
  try {
    // Update the landing section
    const { data, error } = await supabase
      .from('landing_sections')
      .update(updates)
      .eq('id', sectionId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Sync the updated section to translations
    const syncResult = await syncSectionToTranslations(data, language);
    
    if (!syncResult.success) {
      // If sync failed, show a warning but don't fail the whole operation
      console.warn('Section updated but sync to translations failed:', syncResult.message);
      toast.error('Content updated but translations may be out of sync');
    }
    
    return {
      success: true,
      data,
      message: 'Section updated and translations synced'
    };
  } catch (error) {
    console.error('Error updating landing section:', error);
    return {
      success: false,
      message: 'Failed to update section'
    };
  }
};

/**
 * Refreshes translations from landing sections
 * This can be used to force a full sync of all sections
 */
export const refreshAllSectionTranslations = async (language: string = 'en') => {
  try {
    // Get all landing sections
    const { data: sections, error } = await supabase
      .from('landing_sections')
      .select('*');
    
    if (error) throw error;
    
    // Sync each section to translations
    let successCount = 0;
    let failCount = 0;
    
    for (const section of sections) {
      const result = await syncSectionToTranslations(section, language);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    return {
      success: true,
      message: `Synced ${successCount} sections, failed ${failCount} sections`
    };
  } catch (error) {
    console.error('Error refreshing section translations:', error);
    return {
      success: false,
      message: 'Failed to refresh section translations'
    };
  }
};
