import { useState } from "react";
import {
  Facebook,
  Instagram,
  Phone,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FloatingSocial = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, i18n } = useTranslation("common");
  const isRTL = i18n.dir() === "rtl";

  const socialLinks = [
    {
      id: "facebook",
      icon: <Facebook size={24} className="md:w-6 md:h-6 w-5 h-5" />,
      url: "https://facebook.com",
      label: t("social.facebook", "Facebook"),
      color: "#1877F2",
      hoverBg: "rgba(24, 119, 242, 0.2)",
    },
    {
      id: "instagram",
      icon: <Instagram size={24} className="md:w-6 md:h-6 w-5 h-5" />,
      url: "https://instagram.com",
      label: t("social.instagram", "Instagram"),
      color: "#E4405F",
      hoverBg: "rgba(228, 64, 95, 0.2)",
    },
    {
      id: "whatsapp",
      icon: <MessageCircle size={24} className="md:w-6 md:h-6 w-5 h-5" />,
      url: "https://wa.me/6281234567890",
      label: t("social.whatsapp", "WhatsApp"),
      color: "#25D366",
      hoverBg: "rgba(37, 211, 102, 0.2)",
    },
    {
      id: "phone",
      icon: <Phone size={24} className="md:w-6 md:h-6 w-5 h-5" />,
      url: "tel:+6281234567890",
      label: t("social.call_us", "Call Us"),
      color: "#4F46E5",
      hoverBg: "rgba(79, 70, 229, 0.2)",
    },
  ];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`fixed ${
        isRTL ? "right-0" : "left-0"
      } top-1/2 -translate-y-1/2 z-50`}
    >
      {/* Main floating container */}
      <div
        className={`
          flex items-center
          ${isRTL ? "justify-start" : "justify-start"}
          relative
        `}
        data-aos="fade-right"
        data-aos-delay="100"
      >
        <div
          className={`
            bg-primary/90 backdrop-blur-lg md:p-3 p-2 
            ${isRTL ? "rounded-l-xl" : "rounded-r-xl"}
            border-2 border-primary/50
            shadow-lg shadow-black/20 transition-all duration-300 ease-in-out
            ${
              isExpanded
                ? isRTL
                  ? "translate-x-0"
                  : "translate-x-0"
                : isRTL
                ? "translate-x-1"
                : "-translate-x-1"
            }
            z-10
          `}
        >
          {/* Social icons */}
          <div className="md:space-y-5 space-y-4 md:py-2 py-1">
            {socialLinks.map((link) => (
              <div key={link.id} className="relative group">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    flex items-center transition-all duration-300 relative
                    ${
                      isExpanded
                        ? isRTL
                          ? "md:pl-20 pl-16"
                          : "md:pr-20 pr-16"
                        : isRTL
                        ? "pl-0"
                        : "pr-0"
                    }
                    hover:scale-110
                  `}
                  aria-label={link.label}
                >
                  <div
                    className="md:p-2 p-1.5 rounded-full transition-all duration-300 hover:bg-white/30"
                    style={{
                      color: "white",
                    }}
                  >
                    {link.icon}
                  </div>

                  {/* Label that appears when expanded */}
                  <span
                    className={`
                      absolute ${
                        isRTL ? "md:right-12 right-10" : "md:left-12 left-10"
                      } whitespace-nowrap md:text-sm text-xs font-medium
                      transition-all duration-300 origin-left text-white
                      ${
                        isExpanded
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-90"
                      }
                    `}
                    style={{
                      color: "white",
                    }}
                  >
                    {link.label}
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle button - positioned outside the main container */}
        <button
          className={`
            absolute ${
              isRTL ? "md:-left-12 -left-10" : "md:-right-12 -right-10"
            } top-1/2 -translate-y-1/2 
            bg-accent md:p-2.5 p-2 
            ${isRTL ? "rounded-l-lg" : "rounded-r-lg"}
            shadow-lg cursor-pointer border-2 border-white/30 
            transition-transform duration-300 hover:scale-110
            z-20
          `}
          onClick={toggleExpanded}
          aria-label={
            isExpanded ? "Collapse social menu" : "Expand social menu"
          }
        >
          <Share2
            size={20}
            className={`text-white transition-transform duration-300 md:w-5 md:h-5 w-4 h-4 ${
              isExpanded
                ? isRTL
                  ? "rotate-0"
                  : "rotate-180"
                : isRTL
                ? "rotate-180"
                : "rotate-0"
            }`}
          />
        </button>

        {/* Pulse animation for attention */}
        {!isExpanded && (
          <div
            className={`absolute ${
              isRTL ? "md:-left-12 -left-10" : "md:-right-12 -right-10"
            } top-1/2 -translate-y-1/2 z-10`}
          >
            <span className="absolute flex md:h-10 md:w-10 h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingSocial;
