import {
    CreditCard,
    FileCheck,
    FileText,
    HelpCircle,
    MapPin,
    Plane,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

type ServiceItem = {
    id: string;
    icon: string;
    title: string;
    description: string;
};

type ServicesSectionData = {
    title: string;
    subtitle: string;
    content: {
        description: string;
        cta_text: string;
        cta_link: string;
        note: string;
        services: ServiceItem[];
    };
    is_active: boolean;
};

// Map of icon names to components
const iconMap = {
    FileText,
    Plane,
    CreditCard,
    MapPin,
    FileCheck,
    Users,
    HelpCircle,
};

const ServicesSection = () => {
    const [loading, setLoading] = useState(true);
    const [servicesData, setServicesData] =
        useState<ServicesSectionData | null>(null);
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
    const { t, i18n } = useTranslation('section.services');
    const isRTL = i18n.dir() === 'rtl';

    // Track current language to force refresh when language changes
    const currentLanguage = i18n.language;

    useEffect(() => {
        const fetchServicesData = async () => {
            setLoading(true);
            try {
                // Clear existing data from localStorage to force a fresh fetch
                Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith('i18next_section.services')) {
                        localStorage.removeItem(key);
                    }
                });

                const { data, error } = await supabase
                    .from('landing_sections')
                    .select('*')
                    .eq('name', 'services')
                    .single();

                if (error) throw error;

                if (data && data.is_active) {
                    setServicesData(data);
                    setServiceItems(data.content.services || []);
                } else {
                    console.warn('Services section is not active or not found');
                }
            } catch (err) {
                console.error('Error fetching services section:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchServicesData();

        // Reload translations for this section
        i18n.reloadResources(currentLanguage, ['section.services']);
    }, [currentLanguage]);

    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="container flex justify-center px-4 mx-auto md:px-6">
                    <div className="w-8 h-8 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
                </div>
            </section>
        );
    }

    // If there's an error or no data, use default content
    const services = serviceItems;
    const title = servicesData?.title || 'Our Services';
    const subtitle = servicesData?.subtitle || 'What We Offer';
    const description =
        servicesData?.content.description ||
        'We provide a range of services to help your business grow and succeed.';
    const ctaText = servicesData?.content.cta_text || 'Learn More';
    const ctaLink = servicesData?.content.cta_link || '#';
    const note = servicesData?.content.note || '';

    // If section is not active and we're not in development mode, don't render
    if (!servicesData?.is_active && process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <section
            id="services"
            className={`py-16 bg-white ${isRTL ? 'rtl' : 'ltr'}`}
        >
            <div className="container px-4 mx-auto md:px-6">
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-primary/10">
                        <span className="w-2 h-2 mr-2 rounded-full bg-primary"></span>
                        <h5 className="text-sm font-medium tracking-wider uppercase text-primary">
                            {t('subtitle', { defaultValue: subtitle })}
                        </h5>
                    </div>
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        {t('title', { defaultValue: title })}
                    </h2>
                    <p className="max-w-3xl mx-auto text-gray-600">
                        {t('description', { defaultValue: description })}
                    </p>
                </div>

                {/* Improved grid layout for better proportions */}
                <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {services.map((service, index) => {
                        const IconComponent =
                            iconMap[service.icon as keyof typeof iconMap] ||
                            HelpCircle;
                        return (
                            <div
                                key={service.id}
                                className="flex flex-col h-full p-6 transition-all duration-300 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 group"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                <div className="flex items-center justify-center w-12 h-12 mb-4 transition-all duration-300 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                                    <IconComponent size={24} />
                                </div>
                                <h3 className="mb-3 text-xl font-bold transition-colors duration-300 group-hover:text-primary">
                                    {t(`services.${index}.title`, {
                                        defaultValue: service.title,
                                    })}
                                </h3>
                                <p className="flex-grow mb-4 text-gray-600">
                                    {t(`services.${index}.description`, {
                                        defaultValue: service.description,
                                    })}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {note && (
                    <div className="mt-12 text-center">
                        <p className="text-sm italic text-gray-500">{note}</p>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <a
                        href={ctaLink}
                        className="inline-flex items-center px-6 py-3 text-base font-medium text-white transition-all duration-300 border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        {ctaText}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
