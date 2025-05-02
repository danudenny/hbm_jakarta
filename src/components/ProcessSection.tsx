import { useEffect, useState, Fragment } from 'react';
import {
    Briefcase,
    CheckCircle2,
    Clock4,
    FileText,
    UserCheck,
    ArrowRight,
    ArrowDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

// Map of icon names to components
const iconMap = {
    FileText,
    UserCheck,
    Briefcase,
    Clock4,
    CheckCircle2,
    ArrowRight,
    ArrowDown,
};

type ProcessStep = {
    id: string;
    icon: string;
    title: string;
    description: string;
};

type ProcessSectionData = {
    title: string;
    subtitle: string;
    content: {
        description: string;
        steps: ProcessStep[];
    };
    is_active: boolean;
};

const ProcessSection = () => {
    const [loading, setLoading] = useState(true);
    const [processData, setProcessData] = useState<ProcessSectionData | null>(
        null
    );
    const { t, i18n } = useTranslation('section.process');
    const isRTL = i18n.dir() === 'rtl';
    const [isMobile, setIsMobile] = useState(false);

    // Track current language to force refresh when language changes
    const currentLanguage = i18n.language;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        
        // Initial check
        checkMobile();
        
        // Add event listener for window resize
        window.addEventListener('resize', checkMobile);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchProcessData = async () => {
            setLoading(true);
            try {
                // Clear existing data from localStorage to force a fresh fetch
                Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith('i18next_section.process')) {
                        localStorage.removeItem(key);
                    }
                });

                const { data, error } = await supabase
                    .from('landing_sections')
                    .select('*')
                    .eq('name', 'process')
                    .single();

                if (error) throw error;

                if (data && data.is_active) {
                    setProcessData(data);
                } else {
                    console.warn('Process section is not active or not found');
                }
            } catch (err) {
                console.error('Error fetching process section:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProcessData();

        // Reload translations for this section
        i18n.reloadResources(currentLanguage, ['section.process']);
    }, [currentLanguage, i18n]);

    if (loading) {
        return (
            <section
                className={`py-16 ${
                    isRTL ? 'rtl' : 'ltr'
                } bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50`}
            >
                <div className="container flex items-center justify-center px-4 mx-auto md:px-6">
                    <div className="w-10 h-10 border-t-2 border-b-2 rounded-full border-primary animate-spin"></div>
                </div>
            </section>
        );
    }

    if (
        !processData ||
        (!processData.is_active && process.env.NODE_ENV !== 'development')
    ) {
        return null;
    }

    const title = t('title', '');
    const subtitle = t('subtitle', '');
    const description = t('description', '');
    const steps = processData?.content?.steps || [];

    return (
        <section
            className={`py-16 ${
                isRTL ? 'rtl' : 'ltr'
            } relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-blue-50`}
        >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                >
                    <defs>
                        <pattern
                            id="grid"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 0 10 L 40 10 M 10 0 L 10 40"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                fill="none"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="container relative z-10 px-4 mx-auto md:px-6">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-primary/10">
                        <span className="w-2 h-2 mr-2 rounded-full bg-primary"></span>
                        <h5 className="text-sm font-medium tracking-wider uppercase font-heading text-primary">
                            {subtitle}
                        </h5>
                    </div>
                    <h2 className="mb-4 text-3xl font-bold font-heading md:text-4xl text-primary">
                        {title}
                    </h2>
                    <p className="max-w-2xl mx-auto text-base text-gray-700 font-body md:text-lg">
                        {description}
                    </p>
                </div>

                {/* Process Steps with arrows between cards */}
                <div className="flex flex-col mt-12">
                    {/* Desktop view (lg and above) - horizontal layout with arrows between */}
                    <div className="hidden lg:flex items-center justify-center gap-4">
                        {steps.map((step, index) => {
                            const IconComponent =
                                iconMap[step.icon as keyof typeof iconMap] ||
                                FileText;
                            const isLastStep = index === steps.length - 1;

                            return (
                                <Fragment key={step.id || index}>
                                    <div 
                                        className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border shadow-sm group rounded-xl hover:shadow-md border-blue-100/50 hover:bg-gradient-to-b hover:from-white hover:to-primary/5"
                                        data-aos="fade-up"
                                        data-aos-delay={index * 100}
                                    >
                                        {/* Card content with flex layout for consistent heights */}
                                        <div className="flex flex-col flex-grow p-6 pt-8">
                                            <div className="inline-flex items-center justify-center p-3 mb-4 transition-colors duration-300 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                                                <IconComponent className="w-6 h-6" />
                                            </div>

                                            <h3 className="font-heading text-xl font-bold mb-3 text-gray-800 group-hover:text-primary transition-colors duration-300 min-h-[3.5rem] flex items-center">
                                                {t(`step_${index + 1}_title`)}
                                            </h3>

                                            <p className="flex-grow text-sm text-gray-600 transition-colors duration-300 font-body md:text-base group-hover:text-gray-700">
                                                {t(`step_${index + 1}_description`)}
                                            </p>
                                        </div>

                                        {/* Bottom accent line with gradient */}
                                        <div className="w-full h-1 transition-colors duration-300 bg-gradient-to-r from-primary/70 to-primary group-hover:from-primary group-hover:to-primary/80"></div>
                                    </div>
                                    
                                    {/* Arrow between cards - only show if not the last card */}
                                    {!isLastStep && (
                                        <div className="flex items-center justify-center w-8">
                                            <div className="bg-white rounded-full p-2 shadow-sm">
                                                {isRTL ? (
                                                    <ArrowRight className="w-5 h-5 text-primary transform rotate-180" />
                                                ) : (
                                                    <ArrowRight className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Fragment>
                            );
                        })}
                    </div>
                    
                    {/* Mobile and tablet view (below lg) - vertical layout with arrows between */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-6">
                        {steps.map((step, index) => {
                            const IconComponent =
                                iconMap[step.icon as keyof typeof iconMap] ||
                                FileText;
                            const isLastStep = index === steps.length - 1;

                            return (
                                <Fragment key={step.id || index}>
                                    <div 
                                        className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border shadow-sm group rounded-xl hover:shadow-md border-blue-100/50 hover:bg-gradient-to-b hover:from-white hover:to-primary/5"
                                        data-aos="fade-up"
                                        data-aos-delay={index * 100}
                                    >
                                        {/* Card content with flex layout for consistent heights */}
                                        <div className="flex flex-col flex-grow p-6 pt-8">
                                            <div className="inline-flex items-center justify-center p-3 mb-4 transition-colors duration-300 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                                                <IconComponent className="w-6 h-6" />
                                            </div>

                                            <h3 className="font-heading text-xl font-bold mb-3 text-gray-800 group-hover:text-primary transition-colors duration-300 min-h-[3.5rem] flex items-center">
                                                {t(`step_${index + 1}_title`)}
                                            </h3>

                                            <p className="flex-grow text-sm text-gray-600 transition-colors duration-300 font-body md:text-base group-hover:text-gray-700">
                                                {t(`step_${index + 1}_description`)}
                                            </p>
                                        </div>

                                        {/* Bottom accent line with gradient */}
                                        <div className="w-full h-1 transition-colors duration-300 bg-gradient-to-r from-primary/70 to-primary group-hover:from-primary group-hover:to-primary/80"></div>
                                    </div>
                                    
                                    {/* Arrow down after card - only show if not the last card and in odd position (for mobile) */}
                                    {!isLastStep && (index % 2 === 0 || isMobile) && (
                                        <div className="flex items-center justify-center col-span-1 sm:col-span-2 h-8">
                                            <div className="bg-white rounded-full p-2 shadow-sm">
                                                <ArrowDown className="w-5 h-5 text-primary" />
                                            </div>
                                        </div>
                                    )}
                                </Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProcessSection;
