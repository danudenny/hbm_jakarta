import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

type HeroSectionData = {
    title: string;
    subtitle: string | null;
    content: {
        description: string;
        cta_text: string;
        cta_link: string;
        background_image: string;
    };
    is_active: boolean;
};

const HeroSection: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [heroData, setHeroData] = useState<HeroSectionData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { t, i18n } = useTranslation('section.hero');
    const isRTL = i18n.dir() === 'rtl';

    // Re-render component when language changes
    useEffect(() => {
        // This ensures proper RTL/LTR layout when language changes
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }, [i18n.language, isRTL]);

    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const { data, error } = await supabase
                    .from('landing_sections')
                    .select('*')
                    .eq('name', 'hero')
                    .single();

                if (error) throw error;

                if (data && data.is_active) {
                    setHeroData(data);
                } else {
                    console.warn('Hero section is not active or not found');
                }
            } catch (err: any) {
                console.error('Error fetching hero section:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHeroData();
    }, []);

    if (loading) {
        return (
            <section
                id="home"
                className="relative flex items-center min-h-screen bg-gradient-to-r from-primary via-primary-dark to-primary"
            >
                <div className="container relative z-10 flex items-center justify-center px-4 py-24 mx-auto md:px-6">
                    <div className="w-12 h-12 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                </div>
            </section>
        );
    }

    if (error || !heroData) {
        return (
            <section
                id="home"
                className={`relative flex items-center min-h-screen bg-gradient-to-r from-primary via-primary-dark to-primary ${
                    isRTL ? 'rtl' : 'ltr'
                }`}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
                <div className="container relative z-10 px-4 py-24 mx-auto md:px-6">
                    <div className="max-w-3xl">
                        <h1 className="mb-6 text-4xl leading-tight text-white font-hero-title md:text-5xl lg:text-6xl">
                            {t('title_first_line', 'Simplified Work Permit')}{' '}
                            <br className="hidden md:block" />
                            <span className="text-accent-light">
                                {t(
                                    'title_colored_part',
                                    'Solutions for Expatriates'
                                )}
                            </span>
                        </h1>
                        <p className="max-w-2xl mb-8 text-lg font-body text-white/90 md:text-xl">
                            {t(
                                'description',
                                'Expert consultation and comprehensive documentation services for foreign workers in Indonesia. We handle the complexity so you can focus on your work.'
                            )}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            id="home"
            className={`relative flex items-center min-h-screen ${
                isRTL ? 'rtl' : 'ltr'
            }`}
            style={{
                backgroundImage: `url(${heroData.content.background_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
            <div className="container relative z-10 px-4 py-24 mx-auto md:px-6">
                <div className="max-w-3xl">
                    <h1 className="mb-6 text-4xl leading-tight text-white font-hero-title md:text-5xl lg:text-6xl">
                        {t(
                            'title',
                            heroData.title ||
                                'Simplified Work Permit Solutions for Expatriates'
                        )}
                    </h1>
                    <p className="max-w-2xl mb-8 text-lg font-body text-white/90 md:text-xl">
                        {t(
                            'description',
                            heroData.content.description ||
                                'Expert consultation and comprehensive documentation services for foreign workers in Indonesia.'
                        )}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
