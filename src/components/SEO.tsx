import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SEOProps {
  defaultTitle?: string;
  defaultDescription?: string;
}

interface SEOSettings {
  title: string;
  description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  robots?: string;
  structured_data?: any;
}

const SEO: React.FC<SEOProps> = ({ 
  defaultTitle = 'HBM Jakarta | Professional Visa & Work Permit Services',
  defaultDescription = 'HBM Jakarta provides professional visa and work permit services for individuals and businesses in Indonesia.'
}) => {
  const location = useLocation();
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSEOSettings = async () => {
      setLoading(true);
      try {
        // Normalize path to ensure consistent matching
        const normalizedPath = location.pathname.endsWith('/') 
          ? location.pathname 
          : `${location.pathname}/`;
        
        // First try to get exact path match
        let { data, error } = await supabase
          .from('seo_settings')
          .select('*')
          .eq('page_path', normalizedPath);
        
        if (error) {
          console.error('Error fetching SEO settings for path:', error);
          throw error;
        }
        
        // If no exact match, try without trailing slash
        if (!data || data.length === 0) {
          const pathWithoutSlash = location.pathname.endsWith('/') 
            ? location.pathname.slice(0, -1) 
            : location.pathname;
            
          const { data: dataWithoutSlash, error: errorWithoutSlash } = await supabase
            .from('seo_settings')
            .select('*')
            .eq('page_path', pathWithoutSlash);
            
          if (errorWithoutSlash) {
            console.error('Error fetching SEO settings without slash:', errorWithoutSlash);
          } else if (dataWithoutSlash && dataWithoutSlash.length > 0) {
            data = dataWithoutSlash;
          }
        }
        
        // If still no match, try to get homepage settings
        if (!data || data.length === 0) {
          const { data: homeData, error: homeError } = await supabase
            .from('seo_settings')
            .select('*')
            .eq('page_path', '/');
            
          if (homeError) {
            console.error('Error fetching homepage SEO settings:', homeError);
          } else if (homeData && homeData.length > 0) {
            data = homeData;
          }
        }

        if (data && data.length > 0) {
          setSeoSettings(data[0]);
        } else {
          console.warn(`No SEO settings found for path: ${location.pathname}`);
          // Use default settings
          setSeoSettings({
            title: defaultTitle,
            description: defaultDescription
          });
        }
      } catch (error) {
        console.error('Error in SEO component:', error);
        // Use default settings on error
        setSeoSettings({
          title: defaultTitle,
          description: defaultDescription
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSEOSettings();
  }, [location.pathname, defaultTitle, defaultDescription]);

  if (loading || !seoSettings) {
    // Return minimal SEO while loading
    return (
      <Helmet>
        <title>{defaultTitle}</title>
        <meta name="description" content={defaultDescription} />
      </Helmet>
    );
  }

  const {
    title,
    description,
    keywords,
    og_title,
    og_description,
    og_image,
    twitter_card,
    twitter_title,
    twitter_description,
    twitter_image,
    canonical_url,
    robots,
    structured_data
  } = seoSettings;

  // Current URL for canonical and OG URL if not specified
  const currentUrl = window.location.origin + location.pathname;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical_url || currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical_url || currentUrl} />
      <meta property="og:title" content={og_title || title} />
      <meta property="og:description" content={og_description || description} />
      {og_image && <meta property="og:image" content={og_image} />}
      
      {/* Twitter */}
      {twitter_card && <meta name="twitter:card" content={twitter_card} />}
      <meta name="twitter:title" content={twitter_title || og_title || title} />
      <meta name="twitter:description" content={twitter_description || og_description || description} />
      {twitter_image && <meta name="twitter:image" content={twitter_image} />}
      
      {/* Robots */}
      {robots && <meta name="robots" content={robots} />}
      
      {/* Structured Data */}
      {structured_data && (
        <script type="application/ld+json">
          {JSON.stringify(structured_data)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
