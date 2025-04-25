import { useState, useEffect } from 'react';
import { fetchSiteSettings, type SiteSettings } from '../lib/siteSettings';

/**
 * Hook to fetch and use site settings
 * @returns The site settings and loading state
 */
export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await fetchSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { settings, loading };
};

export default useSiteSettings;
