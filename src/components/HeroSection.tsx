import React, { useState, useEffect } from "react";
import { ArrowRight, Circle } from "lucide-react";
import StatsCounter from "./StatsCounter";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";

type HeroSectionData = {
  title: string;
  subtitle: string | null;
  content: {
    description: string;
    cta_text: string;
    cta_link: string;
    background_image: string;
    features: Array<{
      title: string;
      description: string;
    }>;
    stats: Array<{
      value: number;
      suffix: string;
      label: string;
      duration?: number;
    }>;
  };
  is_active: boolean;
};

const HeroSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState<HeroSectionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation("section.hero");

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const { data, error } = await supabase
          .from("landing_sections")
          .select("*")
          .eq("name", "hero")
          .single();

        if (error) throw error;

        if (data && data.is_active) {
          setHeroData(data);
        } else {
          console.warn("Hero section is not active or not found");
        }
      } catch (err: any) {
        console.error("Error fetching hero section:", err);
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
        className="relative min-h-screen flex items-center bg-gradient-to-r from-primary via-primary-dark to-primary"
      >
        <div className="container mx-auto px-4 md:px-6 py-24 relative z-10 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </section>
    );
  }

  if (error || !heroData) {
    // Fallback to default content if there's an error or no data
    return (
      <section
        id="home"
        className="relative min-h-screen flex items-center bg-gradient-to-r from-primary via-primary-dark to-primary"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
        <div className="container mx-auto px-4 md:px-6 py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm border border-accent-light px-4 py-1 mb-3">
              <Circle className="w-3 h-3 mr-2 fill-accent-light text-accent-light" />
              <h5 className="font-heading text-accent-light font-medium tracking-wider">
                {t("subtitle", "PROFESSIONAL VISA SERVICES")}
              </h5>
            </div>
            <h1 className="font-hero-title text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              {t("title_first_line", "Simplified Work Permit")}{" "}
              <br className="hidden md:block" />
              <span className="text-accent-light">
                {t("title_colored_part", "Solutions for Expatriates")}
              </span>
            </h1>
            <p className="font-body text-white/90 text-lg md:text-xl mb-8 max-w-2xl">
              {t(
                "description",
                "Expert consultation and comprehensive documentation services for foreign workers in Indonesia. We handle the complexity so you can focus on your work."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#services" className="btn btn-accent font-heading">
                {t("cta_text", "Our Services")}
                <ArrowRight size={18} className="ml-2" />
              </a>
              <a href="#contact" className="btn btn-outline-white font-heading">
                {t("contact_us", "Contact Us")}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center bg-gradient-to-r from-primary via-primary-dark to-primary"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>

      {heroData.content.background_image && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('${heroData.content.background_image}')`,
          }}
        ></div>
      )}

      <div className="container mx-auto px-4 md:px-6 py-24 relative z-10">
        <div className="">
          <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm border border-accent-light px-4 py-1 mb-3">
            <Circle className="w-3 h-3 mr-2 fill-accent-light text-accent-light" />
            <h5 className="font-heading text-accent-light font-medium tracking-wider">
              {t("subtitle", heroData.subtitle || "PROFESSIONAL VISA SERVICES")}
            </h5>
          </div>
          <h1 className="font-jakarta font-[900] text-4xl md:text-5xl lg:text-6xl mt-2 text-white mb-6 leading-tight w-5xl">
            {/* Use separate complete translations for each part to handle different language structures */}
            {t(
              "title_first_line",
              heroData.title.split(" ").slice(0, -1).join(" ")
            )}{" "}
            <br className="hidden md:block" />
            <span className="text-accent-light">
              {t("title_colored_part", heroData.title.split(" ").slice(-1)[0])}
            </span>
          </h1>
          <p className="font-body text-white/90 text-lg md:text-xl mb-8 max-w-2xl">
            {t("description", heroData.content.description)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={heroData.content.cta_link}
              className="btn btn-accent font-heading"
            >
              {t("cta_text", heroData.content.cta_text)}
              <ArrowRight size={18} className="ml-2 rtl-flip" />
            </a>
            <a href="#contact" className="btn btn-outline-white font-heading">
              {t("contact_us", "Contact Us")}
            </a>
          </div>

          <div className="max-w-3xl">
            <StatsCounter
              stats={heroData.content.stats.map((stat) => ({
                ...stat,
                label: t(
                  `stats.${stat.label.toLowerCase().replace(/\s+/g, "_")}`,
                  stat.label
                ),
              }))}
            />
          </div>

          <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {heroData.content.features &&
              heroData.content.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-accent-light"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-heading text-white font-semibold">
                      {t(`features.${index}.title`, feature.title)}
                    </h3>
                    <p className="font-body text-white/70">
                      {t(`features.${index}.description`, feature.description)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
