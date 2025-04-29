import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import useSiteSettings from "../hooks/useSiteSettings";

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation("common");
  const { settings } = useSiteSettings();
  const isRTL = i18n.dir() === "rtl";

  return (
    <footer className={`bg-gray-900 text-white ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container px-4 py-12 mx-auto md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-6">
              {settings?.company_logo ? (
                <img
                  src={settings.company_logo}
                  alt={settings.company_name || "Company Logo"}
                  className="object-contain w-auto h-12 mb-4"
                />
              ) : (
                <h3 className="mb-4 text-2xl font-bold font-heading">
                  {settings?.company_name || "HBM"}
                </h3>
              )}
              <p className="mb-6 text-gray-400">
                {t(
                  "footer.description",
                  "Professional Establishing Company, immigration and work permit solutions for foreign workers and companies in Indonesia."
                )}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold font-heading">
              {t("footer.services", "Our Services")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#services"
                  className="text-gray-400 transition-colors hover:text-accent"
                >
                  {t("footer.service1", "Company Establishing")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-gray-400 transition-colors hover:text-accent"
                >
                  {t("footer.service2", "Work Visa Handling")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-gray-400 transition-colors hover:text-accent"
                >
                  {t("footer.service3", "Family Visa Handling")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-gray-400 transition-colors hover:text-accent"
                >
                  {t("footer.service4", "Visa Overseas Handling")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-gray-400 transition-colors hover:text-accent"
                >
                  {t("footer.service5", "Document Consultation")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold font-heading">
              {t("footer.quickLinks", "Quick Links")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#home"
                  className="text-gray-400 transition-colors hover:text-accent"
                >
                  {t("nav.home", "Home")}
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-gray-400 transition-colors hover:text-accent"
                >
                  {t("nav.about", "About Us")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-gray-400 transition-colors hover:text-accent"
                >
                  {t("nav.services", "Services")}
                </a>
              </li>
              <li>
                <a
                  href="#process"
                  className="text-gray-400 transition-colors hover:text-accent"
                >
                  {t("nav.process", "Process")}
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-400 transition-colors hover:text-accent"
                >
                  {t("nav.contact", "Contact")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold font-heading">
              {t("footer.contactUs", "Contact Us")}
            </h3>
            <ul className="space-y-4">
              {settings?.company_address && (
                <li className="flex items-center">
                  <MapPin className="w-5 h-5 mt-1 mr-3 text-accent-light" />
                  <span className="text-gray-400">
                    {settings.company_address}
                  </span>
                </li>
              )}
              {settings?.company_email && (
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-accent-light" />
                  <a
                    href={`mailto:${settings.company_email}`}
                    className="text-gray-400 transition-colors hover:text-accent"
                  >
                    {settings.company_email}
                  </a>
                </li>
              )}
              {settings?.company_phone && (
                <li className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-accent-light" />
                  <a
                    href={`tel:${settings.company_phone}`}
                    className="text-gray-400 transition-colors hover:text-accent"
                  >
                    {settings.company_phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-12 text-center text-gray-400 border-t border-gray-800">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {settings?.company_name || "HBM Jakarta"}.{" "}
            {t("footer.rights", "All rights reserved.")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
