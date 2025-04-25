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
      <section className={`py-20 ${isRTL ? 'rtl' : 'ltr'} bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50`}>
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
      className={`py-24 ${isRTL ? 'rtl' : 'ltr'} relative overflow-hidden`}
      style={{
        background: 'linear-gradient(135deg, #e6f0ff 0%, #bfd7ff 50%, #e6f0ff 100%)'
      }}
    >
      {/* Animated blob background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Blob 1 - Top left */}
        <div 
          className="absolute top-0 left-0 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] opacity-20 rounded-full blur-3xl"
          style={{
            background: 'linear-gradient(45deg, #4169E1, #6495ED)',
            animation: 'blob-move-1 25s infinite alternate ease-in-out'
          }}
        ></div>
        
        {/* Blob 2 - Bottom right */}
        <div 
          className="absolute bottom-0 right-0 w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] opacity-20 rounded-full blur-3xl"
          style={{
            background: 'linear-gradient(225deg, #1E3A8A, #3B82F6)',
            animation: 'blob-move-2 20s infinite alternate-reverse ease-in-out'
          }}
        ></div>
        
        {/* Blob 3 - Center */}
        <div 
          className="absolute top-1/2 left-1/2 w-[25vw] h-[25vw] max-w-[400px] max-h-[400px] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'linear-gradient(135deg, #60A5FA, #2563EB)',
            animation: 'blob-move-3 30s infinite alternate ease-in-out'
          }}
        ></div>
      </div>

      {/* Add the animations to the global styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob-move-1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 10%) scale(1.1); }
          100% { transform: translate(-5%, 15%) scale(0.9); }
        }
        @keyframes blob-move-2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, -5%) scale(1.1); }
          100% { transform: translate(-15%, -10%) scale(0.95); }
        }
        @keyframes blob-move-3 {
          0% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(-45%, -55%) scale(1.2); }
          66% { transform: translate(-55%, -45%) scale(0.8); }
          100% { transform: translate(-50%, -50%) scale(1.1); }
        }
      `}} />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h5 className="font-heading text-primary font-medium mb-3 tracking-wider uppercase bg-white/50 backdrop-blur-sm inline-block px-4 py-1 rounded-full">{subtitle}</h5>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-primary leading-tight">{title}</h2>
          <p className="font-body text-gray-700 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-blue-500 to-blue-300 rounded-full"></div>

          {/* Steps */}
          <div className="space-y-16 relative">
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
                  data-aos-delay={index * 100}
                >
                  <div className="flex-1 text-center md:text-left">
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 relative overflow-hidden group">
                      <div className="inline-flex items-center justify-center p-4 bg-blue-100 text-primary rounded-xl mb-5 relative">
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <h3 className="font-heading text-xl font-bold mb-3 text-primary">{step.title}</h3>
                      <p className="font-body text-gray-700">
                        {step.description}
                      </p>
                      
                      {/* Card hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center w-16 h-16 z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg font-heading">
                      {index + 1}
                    </div>
                    {/* Pulse effect */}
                    <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping opacity-75 duration-1000 delay-300"></div>
                  </div>
                  <div className="flex-1"></div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md border border-blue-100">
            <p className="font-body text-gray-700 font-medium mb-4">Ready to start your application process?</p>
            <a href="#contact" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] font-heading">
              Contact Us Today
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;