import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

type TrustedByData = {
  title: string;
  content: {
    description?: string;
    companies: Array<{
      name: string;
      logo: string;
    }>;
  };
  is_active: boolean;
};

const TrustedBy = () => {
  const [loading, setLoading] = useState(true);
  const [trustedByData, setTrustedByData] = useState<TrustedByData | null>(null);
  const { t, i18n } = useTranslation('section.trustedby');
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    const fetchTrustedByData = async () => {
      try {
        const { data, error } = await supabase
          .from('landing_sections')
          .select('*')
          .eq('name', 'trusted-by')
          .single();

        if (error) throw error;
        
        if (data && data.is_active) {
          setTrustedByData(data);
        } else {
          console.warn('Trusted By section is not active or not found');
        }
      } catch (err: any) {
        console.error('Error fetching trusted by section:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrustedByData();
  }, []);

  // Default companies as fallback
  const defaultCompanies = [
    {
      name: "Microsoft",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
    },
    {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
    },
    {
      name: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
    },
    {
      name: "Apple",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
    }
  ];

  if (loading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  if (!trustedByData) {
    return null;
  }

  const companies = trustedByData.content.companies.length > 0 
    ? trustedByData.content.companies 
    : defaultCompanies;

  return (
    <section className={`py-12 bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t('title', { defaultValue: trustedByData.title })}
        </h2>
        
        {trustedByData.content.description && (
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            {t('description', { defaultValue: trustedByData.content.description })}
          </p>
        )}
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {companies.map((company, index) => (
            <div key={index} className="flex items-center justify-center">
              <img 
                src={company.logo} 
                alt={company.name} 
                className="h-8 md:h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;