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
    return (
      <section className="py-12 bg-gradient-to-r from-gray-50 to-white">
        <div className="container mx-auto px-4 flex justify-center items-center" style={{ minHeight: '150px' }}>
          <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (!trustedByData || (!trustedByData.is_active && process.env.NODE_ENV !== 'development')) {
    return null;
  }

  const companies = trustedByData.content?.companies?.length > 0 
    ? trustedByData.content.companies 
    : defaultCompanies;

  // Create two rows of logos for the carousel
  // For odd number of logos, make sure both rows have similar number of items
  const splitLogos = () => {
    const totalLogos = companies.length;
    const firstRowCount = Math.ceil(totalLogos / 2);
    
    const firstRow = [...companies.slice(0, firstRowCount)];
    const secondRow = [...companies.slice(firstRowCount)];
    
    // If we have odd number of logos, duplicate some to make it look balanced
    if (firstRow.length > secondRow.length) {
      // Duplicate a few logos to make the second row longer for better visual effect
      const extraNeeded = Math.min(2, firstRow.length - secondRow.length + 2);
      for (let i = 0; i < extraNeeded; i++) {
        secondRow.push(companies[i % companies.length]);
      }
    }
    
    return { firstRow, secondRow };
  };
  
  const { firstRow, secondRow } = splitLogos();

  return (
    <section className={`py-16 bg-gradient-to-r from-gray-50 to-white ${isRTL ? 'rtl' : 'ltr'} overflow-hidden`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
            <h5 className="text-sm font-medium tracking-wider uppercase text-primary">
              {t('subtitle', { defaultValue: 'Our Partners' })}
            </h5>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {t('title', { defaultValue: trustedByData.title || 'Trusted by Leading Companies Worldwide' })}
          </h2>
          
          {trustedByData.content?.description && (
            <p className="text-center text-gray-600 mt-3 max-w-2xl mx-auto">
              {t('description', { defaultValue: trustedByData.content.description })}
            </p>
          )}
        </div>
        
        {/* Infinity Carousel - First Row (Right Movement) */}
        <div className="mb-8 relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-gray-50 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-gray-50 to-transparent"></div>
          
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee-right">
              {firstRow.map((company, index) => (
                <div 
                  key={`first-${index}`} 
                  className="flex-shrink-0 flex items-center justify-center w-48 h-20 mx-4 px-6 py-4 bg-white rounded-lg shadow-sm"
                >
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="max-h-10 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
            
            {/* Duplicate for seamless loop */}
            <div className="flex animate-marquee-right">
              {firstRow.map((company, index) => (
                <div 
                  key={`first-dup-${index}`} 
                  className="flex-shrink-0 flex items-center justify-center w-48 h-20 mx-4 px-6 py-4 bg-white rounded-lg shadow-sm"
                >
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="max-h-10 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Infinity Carousel - Second Row (Left Movement) */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-gray-50 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-gray-50 to-transparent"></div>
          
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee-left">
              {secondRow.map((company, index) => (
                <div 
                  key={`second-${index}`} 
                  className="flex-shrink-0 flex items-center justify-center w-48 h-20 mx-4 px-6 py-4 bg-white rounded-lg shadow-sm"
                >
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="max-h-10 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
            
            {/* Duplicate for seamless loop */}
            <div className="flex animate-marquee-left">
              {secondRow.map((company, index) => (
                <div 
                  key={`second-dup-${index}`} 
                  className="flex-shrink-0 flex items-center justify-center w-48 h-20 mx-4 px-6 py-4 bg-white rounded-lg shadow-sm"
                >
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="max-h-10 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add the animations to the global styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-right {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee-left {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-right {
          animation: marquee-right 30s linear infinite;
        }
        .animate-marquee-left {
          animation: marquee-left 30s linear infinite;
        }
      `}} />
    </section>
  );
};

export default TrustedBy;