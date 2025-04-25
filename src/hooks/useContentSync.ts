import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { refreshAllSectionTranslations } from '../lib/contentSync';
import { useTranslation } from 'react-i18next';

/**
 * Hook to listen for landing section content changes and automatically sync them to translations
 * This ensures that when content is updated in the admin panel, it's immediately reflected on the landing page
 */
const useContentSync = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set up a subscription to landing_sections table changes
    const subscription = supabase
      .channel('landing_sections_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'landing_sections',
        },
        async (payload) => {
          console.log('Landing section changed:', payload);
          
          // When a landing section is updated, sync the changes to translations
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            console.log('Syncing landing section changes to translations...');
            
            // Get the current language
            const currentLang = i18n.language;
            
            // Refresh translations for the current language
            await refreshAllSectionTranslations(currentLang);
            
            // Force i18n to reload translations
            await i18n.reloadResources();
          }
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [i18n]);
};

export default useContentSync;
