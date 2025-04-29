import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

type AboutSectionData = {
    title: string;
    subtitle: string;
    content: {
        description1: string;
        description2: string;
        image: string;
        experience_years: number;
        experience_label: string;
        cta_text: string;
        cta_link: string;
    };
    is_active: boolean;
};

const AboutSection = () => {
    const [loading, setLoading] = useState(true);
    const [aboutData, setAboutData] = useState<AboutSectionData | null>(null);
    const { t, i18n } = useTranslation('section.about');
    const isRTL = i18n.dir() === 'rtl';

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const { data, error } = await supabase
                    .from('landing_sections')
                    .select('*')
                    .eq('name', 'about')
                    .single();

                if (error) throw error;

                if (data && data.is_active) {
                    setAboutData(data);
                } else {
                    console.warn('About section is not active or not found');
                }
            } catch (err: any) {
                console.error('Error fetching about section:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutData();
    }, []);

    if (loading) {
        return (
            <section id="about" className={`py-20 ${isRTL ? 'rtl' : 'ltr'}`}>
                <div
                    className="container flex items-center justify-center px-4 mx-auto md:px-6"
                    style={{ minHeight: '300px' }}
                >
                    <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
                </div>
            </section>
        );
    }

    // If section is not active and we're not in development mode, don't render
    if (!aboutData?.is_active && process.env.NODE_ENV !== 'development') {
        return null;
    }

    const title = t('title', {
        defaultValue:
            aboutData?.title ||
            'Your Trusted Partner for Immigration Solutions',
    });
    const subtitle = t('subtitle', {
        defaultValue: aboutData?.subtitle || 'ABOUT US',
    });
    const description1 = t('description1', {
        defaultValue:
            aboutData?.content?.description1 ||
            'Since 2014, we have been providing expert consultation and comprehensive documentation services for foreign workers and companies operating in Indonesia. Our team of experienced professionals understands the complexities of Indonesian immigration laws and processes.',
    });
    const description2 = t('description2', {
        defaultValue:
            aboutData?.content?.description2 ||
            'We take pride in our attention to detail, ensuring that every application is properly prepared, submitted, and followed through to successful completion. Our goal is to make the immigration process as smooth and stress-free as possible for our clients.',
    });
    const image =
        aboutData?.content?.image ||
        'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg';
    const experienceYears = aboutData?.content?.experience_years || 10;
    const experienceLabel = t('experience_label', {
        defaultValue: aboutData?.content?.experience_label || 'Experience',
    });
    const ctaText = t('cta_text', {
        defaultValue: aboutData?.content?.cta_text || 'Get In Touch',
    });
    const ctaLink = aboutData?.content?.cta_link || '#contact';

    return (
        <section id="about" className={`py-20 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="container px-4 mx-auto md:px-6">
                <div className="flex flex-col items-center gap-12 lg:flex-row">
                    <div className="lg:w-1/2" data-aos="fade-right">
                        <div className="relative">
                            <img
                                src={image}
                                alt="Professional team meeting"
                                className="object-cover w-full h-auto rounded-lg shadow-xl"
                            />
                            <div className="absolute hidden p-4 bg-white rounded-lg shadow-lg -bottom-8 -right-8 md:block">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-primary">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-8 h-8 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            {experienceLabel}
                                        </p>
                                        <p className="text-2xl font-bold text-primary">
                                            {experienceYears}+ Years
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2" data-aos="fade-left">
                        <h5 className="mb-3 font-medium tracking-wider text-primary">
                            {subtitle}
                        </h5>
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl font-playfair">
                            {title}
                        </h2>
                        <p className="mb-6 text-gray-600">{description1}</p>
                        {/* Render second paragraph as rich text */}
                        <div
                            className="mb-8 text-gray-600 rich-text-content"
                            dangerouslySetInnerHTML={{ __html: description2 }}
                        />

                        <a href={ctaLink} className="btn btn-primary">
                            {ctaText}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
