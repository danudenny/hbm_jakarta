import {
  CreditCard,
  FileCheck,
  FileText,
  HelpCircle,
  MapPin,
  Plane,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";

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
  const [servicesData, setServicesData] = useState<ServicesSectionData | null>(
    null
  );
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const { t, i18n } = useTranslation("section.services");
  const isRTL = i18n.dir() === "rtl";

  // Track current language to force refresh when language changes
  const currentLanguage = i18n.language;

  useEffect(() => {
    const fetchServicesData = async () => {
      setLoading(true);
      try {
        // Clear existing data from localStorage to force a fresh fetch
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("i18next_section.services")) {
            localStorage.removeItem(key);
          }
        });

        const { data, error } = await supabase
          .from("landing_sections")
          .select("*")
          .eq("name", "services")
          .single();

        if (error) throw error;

        if (data && data.is_active) {
          setServicesData(data);
          setServiceItems(data.content.services || []);
        } else {
          console.warn("Services section is not active or not found");
        }
      } catch (err) {
        console.error("Error fetching services section:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServicesData();

    // Reload translations for this section
    i18n.reloadResources(currentLanguage, ["section.services"]).then(() => {
      console.log("Translations reloaded for section.services");
    });
  }, [currentLanguage, i18n]);

  if (loading) {
    return (
      <section className={`py-16 bg-white ${isRTL ? "rtl" : "ltr"}`}>
        <div className="container flex items-center justify-center px-4 mx-auto md:px-6">
          <div className="w-10 h-10 border-t-2 border-b-2 rounded-full border-primary animate-spin"></div>
        </div>
      </section>
    );
  }

  if (
    !servicesData ||
    (!servicesData.is_active && process.env.NODE_ENV !== "development")
  ) {
    return null;
  }

  const services = serviceItems;

  // Log translations to debug
  console.log("Current language:", currentLanguage);
  console.log("Title translation:", t("title"));
  console.log("Subtitle translation:", t("subtitle"));
  console.log(
    "Services translations:",
    services.map((_, idx) => t(`services.${idx}.title`))
  );

  return (
    <section
      id="services"
      className={`py-16 bg-white ${isRTL ? "rtl" : "ltr"}`}
    >
      <div className="container px-4 mx-auto md:px-6">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-primary/10">
            <span className="w-2 h-2 mr-2 rounded-full bg-primary"></span>
            <h5 className="text-sm font-medium tracking-wider uppercase text-primary">
              {t("subtitle")}
            </h5>
          </div>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("title")}</h2>
          <p className="max-w-3xl mx-auto text-gray-600">{t("description")}</p>
        </div>

        {/* Improved grid layout for better proportions */}
        <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {services.map((service, index) => {
            const IconComponent =
              iconMap[service.icon as keyof typeof iconMap] || HelpCircle;

            const titleKey = `service_${index + 1}_title`;
            const descriptionKey = `service_${index + 1}_description`;

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
                  {t(titleKey)}
                </h3>
                <p className="flex-grow mb-4 text-gray-600">
                  {t(descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>

        {t("note") && (
          <div className="mt-12 text-center">
            <p className="text-sm italic text-gray-500">{t("note")}</p>
          </div>
        )}

        {t("cta_text") && (
          <div className="mt-12 text-center">
            <a
              href={servicesData?.content.cta_link || "#contact"}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white transition-all duration-300 border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {t("cta_text")}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
