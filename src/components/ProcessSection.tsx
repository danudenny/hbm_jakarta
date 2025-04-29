import {
    Briefcase,
    CheckCircle2,
    Clock4,
    FileText,
    UserCheck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

// Map of icon names to components
const iconMap = {
    FileText,
    UserCheck,
    Briefcase,
    Clock4,
    CheckCircle2,
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

    // Track current language to force refresh when language changes
    const currentLanguage = i18n.language;

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
            } catch (err: any) {
                console.error('Error fetching process section:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProcessData();

        // Reload translations for this section
        i18n.reloadResources(currentLanguage, ['section.process']);
    }, [currentLanguage]);

    // Default steps as fallback
    const defaultSteps = [
        {
            id: '1',
            icon: 'FileText',
            title: 'Document Preparation',
            description:
                'We help you prepare all necessary documents and forms required for your application.',
        },
        {
            id: '2',
            icon: 'UserCheck',
            title: 'Initial Review',
            description:
                'Our experts review your documentation to ensure everything meets requirements.',
        },
        {
            id: '3',
            icon: 'Briefcase',
            title: 'Application Submission',
            description:
                'We submit your application and handle all communication with authorities.',
        },
        {
            id: '4',
            icon: 'Clock4',
            title: 'Processing & Monitoring',
            description:
                'We actively monitor your application progress and handle any requests.',
        },
        {
            id: '5',
            icon: 'CheckCircle2',
            title: 'Approval & Collection',
            description:
                'Once approved, we collect your documents and guide you through final steps.',
        },
    ];

    if (loading) {
        return (
            <section
                className={`py-16 ${
                    isRTL ? 'rtl' : 'ltr'
                } bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50`}
            >
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
    if (!processData?.is_active && process.env.NODE_ENV !== 'development') {
        return null;
    }

    // If there's an error or no data, use default content
    const title = t('title', {
        defaultValue: processData?.title || 'How We Work',
    });
    const subtitle = t('subtitle', {
        defaultValue: processData?.subtitle || 'OUR PROCESS',
    });
    const description = t('description', {
        defaultValue:
            processData?.content?.description ||
            'Our streamlined process ensures efficient handling of your visa and permit requirements',
    });
    const steps = processData?.content?.steps || defaultSteps;

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

                {/* Process Steps - Fixed height cards with flexible content */}
                <div className="grid grid-cols-1 gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => {
                        const IconComponent =
                            iconMap[step.icon as keyof typeof iconMap] ||
                            FileText;

                        return (
                            <div
                                key={step.id || index}
                                className="relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border shadow-sm group rounded-xl hover:shadow-md border-blue-100/50 hover:bg-gradient-to-b hover:from-white hover:to-primary/5"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                {/* Step number indicator */}
                                <div className="absolute top-0 right-0 flex items-center justify-center w-10 h-10 font-bold text-white bg-primary rounded-bl-xl">
                                    {index + 1}
                                </div>

                                {/* Card content with flex layout for consistent heights */}
                                <div className="flex flex-col flex-grow p-6 pt-8">
                                    <div className="inline-flex items-center justify-center p-3 mb-4 transition-colors duration-300 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                                        <IconComponent className="w-6 h-6" />
                                    </div>

                                    <h3 className="font-heading text-xl font-bold mb-3 text-gray-800 group-hover:text-primary transition-colors duration-300 min-h-[3.5rem] flex items-center">
                                        {step.title}
                                    </h3>

                                    <p className="flex-grow text-sm text-gray-600 transition-colors duration-300 font-body md:text-base group-hover:text-gray-700">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Bottom accent line with gradient */}
                                <div className="w-full h-1 transition-colors duration-300 bg-gradient-to-r from-primary/70 to-primary group-hover:from-primary group-hover:to-primary/80"></div>
                            </div>
                        );
                    })}
                </div>

                {/* Connected Steps Visualization */}
                <div className="items-center justify-between hidden px-12 mt-6 lg:flex">
                    {steps.slice(0, 4).map((_, index) => (
                        <React.Fragment key={`connector-${index}`}>
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            {index < Math.min(steps.length, 4) - 1 && (
                                <div className="flex-1 h-0.5 bg-gradient-to-r from-primary to-primary/30"></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-12 text-center">
                    <a
                        href="#contact"
                        className="inline-flex items-center px-6 py-3 font-medium text-white transition-all duration-300 rounded-lg shadow-sm bg-primary hover:shadow-md hover:bg-primary-dark"
                    >
                        <span>Start Your Application</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 ml-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ProcessSection;
