import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

type FAQSectionData = {
  title: string;
  subtitle: string;
  content: {
    description: string;
    faqs: FAQItem[];
    cta_text: string;
    cta_button_text: string;
    cta_button_link: string;
  };
  is_active: boolean;
};

const FAQSection = () => {
  const [loading, setLoading] = useState(true);
  const [sectionData, setSectionData] = useState<FAQSectionData | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t, i18n } = useTranslation('section.faq');
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    fetchFAQData();
  }, []);

  const fetchFAQData = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_sections')
        .select('*')
        .eq('name', 'faq')
        .single();

      if (error) throw error;
      
      if (data && data.is_active) {
        setSectionData(data);
      } else {
        console.warn('FAQ section is not active or not found');
      }
    } catch (err: any) {
      console.error('Error fetching FAQ section:', err);
    } finally {
      setLoading(false);
    }
  };

  // Default FAQs as fallback
  const defaultFAQs: FAQItem[] = [
    {
      id: '1',
      question: "What documents are required for RPTKA application?",
      answer: "RPTKA applications typically require company legal documents, organizational structure, job descriptions for the foreign worker position, qualifications justification, and a foreign manpower utilization plan. Our consultants will provide a comprehensive checklist tailored to your specific situation."
    },
    {
      id: '2',
      question: "How long does it take to obtain a work visa for Indonesia?",
      answer: "The processing time for work visas varies based on nationality, position, and current regulatory conditions. Generally, it takes between 2-8 weeks from initial application to visa issuance. Our expedited services can often reduce these timelines."
    },
    {
      id: '3',
      question: "Can family members accompany a foreign worker to Indonesia?",
      answer: "Yes, immediate family members (spouse and dependent children) can accompany foreign workers through dependent visas. We provide complete assistance for family applications alongside the primary work permit processing."
    },
    {
      id: '4',
      question: "What is the difference between KITAS and KITAP?",
      answer: "KITAS (Kartu Izin Tinggal Terbatas) is a temporary stay permit valid for up to 2 years with possible extensions. KITAP (Kartu Izin Tinggal Tetap) is a permanent stay permit available after holding KITAS for several consecutive years, typically 4-5 years depending on circumstances."
    },
    {
      id: '5',
      question: "Are there any nationality restrictions for work permits in Indonesia?",
      answer: "Indonesia does not explicitly restrict work permits based on nationality, but certain positions and industries have specific requirements. Some positions may be reserved for Indonesian nationals according to the government's Negative Investment List (DNI)."
    },
    {
      id: '6',
      question: "What happens if my work permit expires while I'm still in Indonesia?",
      answer: "Overstaying a work permit can result in significant fines, deportation, and potential difficulty obtaining future permits. We provide timely reminders and renewal services to ensure continuous legal residence and work authorization."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
  if (!sectionData?.is_active && process.env.NODE_ENV !== 'development') {
    return null;
  }

  const title = t('title', { defaultValue: sectionData?.title || 'Common Questions About Work Permits & Visas' });
  const subtitle = t('subtitle', { defaultValue: sectionData?.subtitle || 'FREQUENTLY ASKED QUESTIONS' });
  const description = t('description', { defaultValue: sectionData?.content?.description || 'Find answers to frequently asked questions about work permits, visas, and immigration procedures for foreign workers in Indonesia.' });
  const ctaText = t('cta_text', { defaultValue: sectionData?.content?.cta_text || "Don't see your question here?" });
  const ctaButtonText = t('cta_button_text', { defaultValue: sectionData?.content?.cta_button_text || "Ask Your Question" });
  const ctaButtonLink = sectionData?.content?.cta_button_link || "#contact";
  const faqs = sectionData?.content?.faqs || defaultFAQs;

  return (
    <section className={`py-20 bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h5 className="text-primary font-medium mb-3 tracking-wider">{subtitle}</h5>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        
        {faqs.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={faq.id} 
                className="mb-4 rounded-lg border border-gray-200 bg-white"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <button
                  className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-gray-800 focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-playfair">{t(`faq.${faq.id}.question`, { defaultValue: faq.question })}</span>
                  <ChevronDown
                    size={20}
                    className={`transform transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                  />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-4 text-gray-600">
                    {t(`faq.${faq.id}.answer`, { defaultValue: faq.answer })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No FAQs available at the moment.</p>
          </div>
        )}
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            {ctaText}
          </p>
          <a 
            href={ctaButtonLink}
            className="btn btn-primary"
          >
            {ctaButtonText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;