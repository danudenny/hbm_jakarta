import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

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
    const [trustedByData, setTrustedByData] = useState<TrustedByData | null>(
        null
    );
    const { t, i18n } = useTranslation('section.trustedby');
    const isRTL = i18n.dir() === 'rtl';

    // Force refresh when language changes
    const currentLanguage = i18n.language;

    useEffect(() => {
        const fetchTrustedByData = async () => {
            setLoading(true);
            try {
                // Clear existing data from localStorage to force a fresh fetch
                Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith('i18next_section.trustedby')) {
                        localStorage.removeItem(key);
                    }
                });

                const { data, error } = await supabase
                    .from('landing_sections')
                    .select('*')
                    .eq('name', 'trusted-by')
                    .single();

                if (error) throw error;

                if (data && data.is_active) {
                    setTrustedByData(data);
                } else {
                    console.warn(
                        'Trusted By section is not active or not found'
                    );
                }
            } catch (err: any) {
                console.error('Error fetching trusted by section:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrustedByData();

        // Reload translations for this section
        i18n.reloadResources(currentLanguage, ['section.trustedby']);
    }, [currentLanguage, i18n]);

    if (loading) {
        return (
            <section className="py-12 bg-gradient-to-r from-gray-50 to-white">
                <div
                    className="container flex items-center justify-center px-4 mx-auto"
                    style={{ minHeight: '150px' }}
                >
                    <div className="w-10 h-10 border-t-2 border-b-2 rounded-full border-primary animate-spin"></div>
                </div>
            </section>
        );
    }

    if (
        !trustedByData ||
        (!trustedByData.is_active && process.env.NODE_ENV !== 'development')
    ) {
        return null;
    }

    const companies = trustedByData.content.companies;

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
            const extraNeeded = Math.min(
                2,
                firstRow.length - secondRow.length + 2
            );
            for (let i = 0; i < extraNeeded; i++) {
                secondRow.push(companies[i % companies.length]);
            }
        }

        return { firstRow, secondRow };
    };

    const { firstRow, secondRow } = splitLogos();

    return (
        <section
            className={`py-16 bg-gradient-to-r from-gray-50 to-white ${
                isRTL ? 'rtl' : 'ltr'
            } overflow-hidden`}
        >
            <div className="container px-4 mx-auto">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-primary/10">
                        <span className="w-2 h-2 mr-2 rounded-full bg-primary"></span>
                        <h5 className="text-sm font-medium tracking-wider uppercase text-primary">
                            {t('subtitle', { defaultValue: 'Our Partners' })}
                        </h5>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        {t('title', {
                            defaultValue: trustedByData.title || '',
                        })}
                    </h2>

                    {trustedByData.content?.description && (
                        <p className="max-w-2xl mx-auto mt-3 text-center text-gray-600">
                            {t('description', {
                                defaultValue: trustedByData.content.description,
                            })}
                        </p>
                    )}
                </div>

                {/* Infinity Carousel - First Row (Right Movement) */}
                <div className="relative mb-8">
                    <div className="absolute top-0 bottom-0 left-0 z-10 w-12 bg-gradient-to-r from-gray-50 to-transparent"></div>
                    <div className="absolute top-0 bottom-0 right-0 z-10 w-12 bg-gradient-to-l from-gray-50 to-transparent"></div>

                    <div className="flex overflow-hidden">
                        <div className="flex animate-marquee-right">
                            {firstRow.map((company, index) => (
                                <div
                                    key={`first-${index}`}
                                    className="flex items-center justify-center flex-shrink-0 w-48 h-20 px-6 py-4 mx-4 bg-white rounded-lg shadow-sm sm:w-52 sm:h-24"
                                >
                                    <img
                                        src={company.logo}
                                        alt={company.name}
                                        className="object-contain max-w-full transition-all duration-300 max-h-10 sm:max-h-14 md:max-h-16"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Duplicate for seamless loop */}
                        <div className="flex animate-marquee-right">
                            {firstRow.map((company, index) => (
                                <div
                                    key={`first-dup-${index}`}
                                    className="flex items-center justify-center flex-shrink-0 w-48 h-20 px-6 py-4 mx-4 bg-white rounded-lg shadow-sm sm:w-52 sm:h-24"
                                >
                                    <img
                                        src={company.logo}
                                        alt={company.name}
                                        className="object-contain max-w-full transition-all duration-300 max-h-10 sm:max-h-14 md:max-h-16"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Infinity Carousel - Second Row (Left Movement) */}
                <div className="relative">
                    <div className="absolute top-0 bottom-0 left-0 z-10 w-12 bg-gradient-to-r from-gray-50 to-transparent"></div>
                    <div className="absolute top-0 bottom-0 right-0 z-10 w-12 bg-gradient-to-l from-gray-50 to-transparent"></div>

                    <div className="flex overflow-hidden">
                        <div className="flex animate-marquee-left">
                            {secondRow.map((company, index) => (
                                <div
                                    key={`second-${index}`}
                                    className="flex items-center justify-center flex-shrink-0 w-48 h-20 px-6 py-4 mx-4 bg-white rounded-lg shadow-sm sm:w-52 sm:h-24"
                                >
                                    <img
                                        src={company.logo}
                                        alt={company.name}
                                        className="object-contain max-w-full transition-all duration-300 max-h-10 sm:max-h-14 md:max-h-16"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Duplicate for seamless loop */}
                        <div className="flex animate-marquee-left">
                            {secondRow.map((company, index) => (
                                <div
                                    key={`second-dup-${index}`}
                                    className="flex items-center justify-center flex-shrink-0 w-48 h-20 px-6 py-4 mx-4 bg-white rounded-lg shadow-sm sm:w-52 sm:h-24"
                                >
                                    <img
                                        src={company.logo}
                                        alt={company.name}
                                        className="object-contain max-w-full transition-all duration-300 max-h-10 sm:max-h-14 md:max-h-16"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add the animations to the global styles */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
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
                    `,
                }}
            />
        </section>
    );
};

export default TrustedBy;
