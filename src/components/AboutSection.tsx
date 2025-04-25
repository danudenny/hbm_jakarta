import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";

type Advantage = {
  id: string;
  text: string;
};

type AboutSectionData = {
  title: string;
  subtitle: string;
  content: {
    description1: string;
    description2: string;
    image: string;
    experience_years: number;
    experience_label: string;
    advantages: Advantage[];
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
          .from("landing_sections")
          .select("*")
          .eq("name", "about")
          .single();

        if (error) throw error;

        if (data && data.is_active) {
          setAboutData(data);
        } else {
          console.warn("About section is not active or not found");
        }
      } catch (err: any) {
        console.error("Error fetching about section:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const defaultAdvantages = [
    {
      id: "1",
      text: "Extensive experience with Indonesian immigration regulations",
    },
    { id: "2", text: "Direct relationships with immigration offices" },
    { id: "3", text: "Dedicated case managers for each client" },
    {
      id: "4",
      text: "Multilingual support staff (English, Indonesian, Mandarin)",
    },
    { id: "5", text: "Regular status updates throughout the process" },
    { id: "6", text: "Transparent pricing with no hidden fees" },
  ];

  if (loading) {
    return (
      <section id="about" className={`py-20 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div
          className="container mx-auto px-4 md:px-6 flex justify-center items-center"
          style={{ minHeight: "300px" }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  // If section is not active and we're not in development mode, don't render
  if (!aboutData?.is_active && process.env.NODE_ENV !== "development") {
    return null;
  }

  const title = t('title', { 
    defaultValue: aboutData?.title || "Your Trusted Partner for Immigration Solutions" 
  });
  const subtitle = t('subtitle', { 
    defaultValue: aboutData?.subtitle || "ABOUT US" 
  });
  const description1 = t('description1', { 
    defaultValue: aboutData?.content?.description1 ||
    "Since 2014, we have been providing expert consultation and comprehensive documentation services for foreign workers and companies operating in Indonesia. Our team of experienced professionals understands the complexities of Indonesian immigration laws and processes."
  });
  const description2 = t('description2', { 
    defaultValue: aboutData?.content?.description2 ||
    "We take pride in our attention to detail, ensuring that every application is properly prepared, submitted, and followed through to successful completion. Our goal is to make the immigration process as smooth and stress-free as possible for our clients."
  });
  const image =
    aboutData?.content?.image ||
    "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg";
  const experienceYears = aboutData?.content?.experience_years || 10;
  const experienceLabel = t('experience_label', { 
    defaultValue: aboutData?.content?.experience_label || "Experience" 
  });
  const advantages = aboutData?.content?.advantages || defaultAdvantages;
  const ctaText = t('cta_text', { 
    defaultValue: aboutData?.content?.cta_text || "Get In Touch" 
  });
  const ctaLink = aboutData?.content?.cta_link || "#contact";

  return (
    <section id="about" className={`py-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2" data-aos="fade-right">
            <div className="relative">
              <img
                src={image}
                alt="Professional team meeting"
                className="rounded-lg shadow-xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-8 -right-8 bg-white p-4 rounded-lg shadow-lg hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="bg-primary rounded-full p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
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
                    <p className="text-gray-600 text-sm">{experienceLabel}</p>
                    <p className="text-primary font-bold text-2xl">
                      {experienceYears}+ Years
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2" data-aos="fade-left">
            <h5 className="text-primary font-medium mb-3 tracking-wider">
              {subtitle}
            </h5>
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
              {title}
            </h2>
            <p className="text-gray-600 mb-6">{description1}</p>
            <p className="text-gray-600 mb-8">{description2}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {advantages.map((advantage, index) => (
                <div
                  key={advantage.id || `advantage-${index}`}
                  className="flex items-start"
                >
                  <CheckCircle
                    size={20}
                    className="text-accent mt-1 mr-2 flex-shrink-0"
                  />
                  <p className="text-gray-700">{advantage.text}</p>
                </div>
              ))}
            </div>

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
