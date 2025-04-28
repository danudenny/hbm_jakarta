import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook for handling translation reloading
 * Now uses only local JSON files from public/locales/{countrycode}/*.json
 */
const useContentSync = () => {
    const { i18n } = useTranslation();

    useEffect(() => {
        // Initial load of resources
        const loadResources = async () => {
            try {
                await i18n.reloadResources();
                console.log(
                    'Translation resources loaded from local JSON files'
                );
            } catch (error) {
                console.error('Failed to load translation resources:', error);
            }
        };

        loadResources();

        // No subscriptions needed anymore as we're using static JSON files
    }, [i18n]);
};

export default useContentSync;
