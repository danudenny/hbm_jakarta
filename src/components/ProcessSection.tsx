import React, { useState, useEffect } from 'react';
import { CheckCircle2, FileText, UserCheck, Briefcase, Clock4 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

// Map of icon names to components
const iconMap = {
  FileText,
  UserCheck,
  Briefcase,
  Clock4,
  CheckCircle2
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
  const [processData, setProcessData] = useState<ProcessSectionData | null>(null);
  const { t, i18n } = useTranslation('section.process');
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    const fetchProcessData = async () => {
      try {
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
  }, []);

  // Default steps as fallback
  const defaultSteps = [
    {
      id: '1',
      icon: 'FileText',
      title: "Document Preparation",
      description: "We help you prepare all necessary documents and forms required for your application."
    },
    {
      id: '2',
      icon: 'UserCheck',
      title: "Initial Review",
      description: "Our experts review your documentation to ensure everything meets requirements."
    },
    {
      id: '3',
      icon: 'Briefcase',
      title: "Application Submission",
      description: "We submit your application and handle all communication with authorities."
    },
    {
      id: '4',
      icon: 'Clock4',
      title: "Processing & Monitoring",
      description: "We actively monitor your application progress and handle any requests."
    },
    {
      id: '5',
      icon: 'CheckCircle2',
      title: "Approval & Collection",
      description: "Once approved, we collect your documents and guide you through final steps."
    }
  ];

  if (loading) {
    return (
      <section className={`py-16 ${isRTL ? 'rtl' : 'ltr'} bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50`}>
        <div className="container mx-auto px-4 md:px-6 flex justify-center items-center" style={{ minHeight: '300px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  // If section is not active and we're not in development mode, don't render
  if (!processData?.is_active && process.env.NODE_ENV !== 'development') {
    return null;
  }

  // If there's an error or no data, use default content
  const title = t('title', { defaultValue: processData?.title || 'How We Work' });
  const subtitle = t('subtitle', { defaultValue: processData?.subtitle || 'OUR PROCESS' });
  const description = t('description', { defaultValue: processData?.content?.description || 'Our streamlined process ensures efficient handling of your visa and permit requirements' });
  const steps = processData?.content?.steps || defaultSteps;

  return (
    <section 
      className={`py-16 ${isRTL ? 'rtl' : 'ltr'} relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-blue-50`}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 40 10 M 10 0 L 10 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
            <h5 className="font-heading text-primary text-sm font-medium tracking-wider uppercase">{subtitle}</h5>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-primary">{title}</h2>
          <p className="font-body text-gray-700 max-w-2xl mx-auto text-base md:text-lg">
            {description}
          </p>
        </div>

        {/* Process Steps - Modern Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {steps.map((step, index) => {
            const IconComponent = iconMap[step.icon as keyof typeof iconMap] || FileText;
            
            return (
              <div
                key={step.id || index}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-blue-100/50"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {/* Step number indicator */}
                <div className="absolute top-0 right-0 bg-primary text-white w-10 h-10 flex items-center justify-center rounded-bl-xl font-bold">
                  {index + 1}
                </div>
                
                {/* Card content */}
                <div className="p-6 pt-8">
                  <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-lg mb-4">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <h3 className="font-heading text-xl font-bold mb-2 text-gray-800 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="font-body text-gray-600 text-sm md:text-base">
                    {step.description}
                  </p>
                </div>
                
                {/* Bottom accent line with gradient */}
                <div className="h-1 w-full bg-gradient-to-r from-primary/70 to-primary mt-auto"></div>
              </div>
            );
          })}
        </div>
        
        {/* Connected Steps Visualization - Mobile Hidden, Desktop Visible */}
        <div className="hidden md:flex justify-between items-center mt-6 px-12">
          {steps.map((_, index) => (
            <React.Fragment key={`connector-${index}`}>
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gradient-to-r from-primary to-primary/30"></div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <a 
            href="#contact" 
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:bg-primary-dark"
          >
            <span>Start Your Application</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;