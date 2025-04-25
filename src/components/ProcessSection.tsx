import { useState, useEffect } from 'react';
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
      <section className={`py-20 bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
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
    <section className={`py-20 bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h5 className="text-primary font-medium mb-3 tracking-wider">{subtitle}</h5>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Steps */}
          <div className="space-y-12 relative">
            {steps.map((step, index) => {
              // Get the icon component from our map, or default to FileText
              const IconComponent = iconMap[step.icon as keyof typeof iconMap] || FileText;
              
              return (
                <div
                  key={step.id || index}
                  className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                  data-aos={index % 2 === 0 ? 'fade-left' : 'fade-right'}
                >
                  <div className="flex-1 text-center md:text-left">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <div className="inline-block p-3 bg-primary/10 text-primary rounded-lg mb-4">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg z-10">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;