import { useState, useEffect } from "react";
import ServiceCard from "./ServiceCard";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Plane,
  CreditCard,
  MapPin,
  FileCheck,
  Users,
  HelpCircle,
} from "lucide-react";

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
  const { t, i18n } = useTranslation('section.services');
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
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
      } catch (err: any) {
        console.error("Error fetching services section:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServicesData();
  }, []);

  // Default service items as fallback
  const defaultServiceItems = [
    {
      id: "1",
      icon: "FileText",
      title: "Document Processing",
      description:
        "Efficient document processing services for all your business needs.",
    },
    {
      id: "2",
      icon: "Plane",
      title: "Travel Arrangements",
      description:
        "Comprehensive travel management for corporate and leisure trips.",
    },
    {
      id: "3",
      icon: "CreditCard",
      title: "Payment Solutions",
      description:
        "Secure and flexible payment processing for businesses of all sizes.",
    },
    {
      id: "4",
      icon: "MapPin",
      title: "Location Services",
      description:
        "Precise location tracking and mapping for your business operations.",
    },
    {
      id: "5",
      icon: "FileCheck",
      title: "Compliance Management",
      description:
        "Stay compliant with regulations with our comprehensive solutions.",
    },
    {
      id: "6",
      icon: "Users",
      title: "HR Management",
      description:
        "Complete human resources management for your organization.",
    },
  ];

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  // If there's an error or no data, use default content
  const services = serviceItems.length > 0 ? serviceItems : defaultServiceItems;
  const title = servicesData?.title || "Our Services";
  const subtitle = servicesData?.subtitle || "What We Offer";
  const description =
    servicesData?.content.description ||
    "We provide a range of services to help your business grow and succeed.";
  const ctaText = servicesData?.content.cta_text || "Learn More";
  const ctaLink = servicesData?.content.cta_link || "#";
  const note = servicesData?.content.note || "";

  // If section is not active and we're not in development mode, don't render
  if (!servicesData?.is_active && process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <section id="services" className={`py-16 bg-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('title', { defaultValue: title })}
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            {t('subtitle', { defaultValue: subtitle })}
          </p>
          <p className="max-w-3xl mx-auto text-gray-500">
            {t('description', { defaultValue: description })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap] || HelpCircle;
            return (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                icon={<IconComponent size={24} />}
              />
            );
          })}
        </div>

        {note && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 italic">{note}</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <a
            href={ctaLink}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
