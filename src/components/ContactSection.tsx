import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { supabase } from "../lib/supabase";

// Fix Leaflet marker icon issue
// @ts-expect-error - Known issue with TypeScript and Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom icon for locations - using a locally hosted marker to ensure it loads
const customIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type MapLocation = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type ContactSectionData = {
  title: string;
  subtitle: string;
  content: {
    description: string;
    contact_info: {
      address: string[];
      phone: string[];
      email: string[];
      business_hours: string[];
    };
    map_locations: MapLocation[];
  };
  is_active: boolean;
};

// Helper function to split text at colon and format as label/value
const formatColonText = (text: string) => {
  if (!text.includes(":")) return text;

  const [label, ...valueParts] = text.split(":");
  const value = valueParts.join(":").trim();

  return (
    <div className="flex flex-col md:flex-row md:items-baseline">
      <span className="font-semibold">{label.trim()}:</span>
      <span className="md:ml-2">{value}</span>
    </div>
  );
};

const ContactSection = () => {
  const [loading, setLoading] = useState(true);
  const [contactData, setContactData] = useState<ContactSectionData | null>(
    null
  );
  const { t, i18n } = useTranslation("section.contact");
  const isRTL = i18n.dir() === "rtl";

  // Track current language to force refresh when language changes
  const currentLanguage = i18n.language;

  useEffect(() => {
    fetchContactData();

    // Reload translations for this section
    i18n.reloadResources(currentLanguage, ["section.contact"]);
  }, [currentLanguage]);

  const fetchContactData = async () => {
    setLoading(true);
    try {
      // Clear existing data from localStorage to force a fresh fetch
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("i18next_section.contact")) {
          localStorage.removeItem(key);
        }
      });

      const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .eq("name", "contact")
        .single();

      if (error) throw error;

      if (data && data.is_active) {
        setContactData(data);
      } else {
        console.warn("Contact section is not active or not found");
      }
    } catch (err: unknown) {
      console.error("Error fetching contact section:", err);
    } finally {
      setLoading(false);
    }
  };

  const mapStyles = {
    height: "500px",
    width: "100%",
    borderRadius: "0.75rem",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  };

  if (loading) {
    return (
      <section id="contact" className={`py-16 ${isRTL ? "rtl" : "ltr"}`}>
        <div
          className="container flex items-center justify-center px-4 mx-auto md:px-6"
          style={{ minHeight: "300px" }}
        >
          <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
        </div>
      </section>
    );
  }

  // If section is not active and we're not in development mode, don't render
  if (!contactData?.is_active && process.env.NODE_ENV !== "development") {
    return null;
  }

  // Use data from Supabase
  const title = t("title", {
    defaultValue: contactData?.title || "",
  });
  const subtitle = t("subtitle", {
    defaultValue: contactData?.subtitle || "",
  });
  const description = t("description", {
    defaultValue: contactData?.content?.description || "",
  });

  // Contact info
  const contactInfo = contactData?.content?.contact_info || {};

  // Map locations
  const mapLocations = contactData?.content?.map_locations || [];

  // Calculate map center based on locations
  const mapCenter =
    mapLocations.length > 0
      ? ([
          mapLocations.reduce((sum, loc) => sum + loc.lat, 0) /
            mapLocations.length,
          mapLocations.reduce((sum, loc) => sum + loc.lng, 0) /
            mapLocations.length,
        ] as [number, number])
      : ([-1.8, 102.7] as [number, number]); // Default center of Indonesia

  return (
    <section
      id="contact"
      className={`py-16 ${
        isRTL ? "rtl" : "ltr"
      } bg-gradient-to-b from-white to-blue-50`}
    >
      <div className="container px-4 mx-auto md:px-6">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-primary/10">
            <span className="w-2 h-2 mr-2 rounded-full bg-primary"></span>
            <h5 className="text-sm font-medium tracking-wider uppercase text-primary">
              {subtitle}
            </h5>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
            {title}
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600">{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1" data-aos="fade-right">
            <div className="relative p-6 overflow-hidden text-white shadow-lg rounded-xl bg-gradient-to-br from-primary to-primary-dark md:p-8">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg
                  width="100%"
                  height="100%"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="contactPattern"
                      patternUnits="userSpaceOnUse"
                      width="40"
                      height="40"
                      patternTransform="rotate(45)"
                    >
                      <rect width="100%" height="100%" fill="none" />
                      <circle cx="20" cy="20" r="2" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#contactPattern)"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="mb-6 text-2xl font-bold">
                  {t("contact_info_title", {
                    defaultValue: "Contact Information",
                  })}
                </h3>

                <div className="space-y-6">
                  {contactInfo.address && contactInfo.address.length > 0 && (
                    <div className="flex items-start">
                      <div className="flex items-center justify-center p-3 mr-4 text-white rounded-lg bg-white/20">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">
                          {t("our_office", {
                            defaultValue: "Our Office",
                          })}
                        </h4>
                        <div className="mt-1 space-y-2">
                          {contactInfo.address.map((addr, index) => (
                            <div key={index} className="whitespace-pre-line">
                              {formatColonText(addr)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {contactInfo.phone && contactInfo.phone.length > 0 && (
                    <div className="flex items-start">
                      <div className="flex items-center justify-center p-3 mr-4 text-white rounded-lg bg-white/20">
                        <Phone size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">
                          {t("phone", {
                            defaultValue: "Phone",
                          })}
                        </h4>
                        <div className="mt-1 space-y-1">
                          {contactInfo.phone.map((phone, index) => (
                            <div key={index}>{formatColonText(phone)}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {contactInfo.email && contactInfo.email.length > 0 && (
                    <div className="flex items-start">
                      <div className="flex items-center justify-center p-3 mr-4 text-white rounded-lg bg-white/20">
                        <Mail size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">
                          {t("email", {
                            defaultValue: "Email",
                          })}
                        </h4>
                        <div className="mt-1 space-y-1">
                          {contactInfo.email.map((email, index) => (
                            <div key={index}>{formatColonText(email)}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {contactInfo.business_hours &&
                    contactInfo.business_hours.length > 0 && (
                      <div className="flex items-start">
                        <div className="flex items-center justify-center p-3 mr-4 text-white rounded-lg bg-white/20">
                          <Clock size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">
                            {t("busines_hours", {
                              defaultValue: "Business Hours",
                            })}
                          </h4>
                          <div className="mt-1 space-y-1">
                            {t("business_hours_1", {
                              defaultValue: "Business Hours",
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2" data-aos="fade-left">
            <div className="overflow-hidden bg-white shadow-lg rounded-xl">
              <h3 className="p-5 text-xl font-bold border-b border-gray-100">
                {t("our_locations", {
                  defaultValue: "Our Locations",
                })}
              </h3>
              <div className="map-container">
                {!loading && (
                  <MapContainer
                    center={mapCenter}
                    zoom={5}
                    style={mapStyles}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {mapLocations.map((location) => (
                      <Marker
                        key={location.id}
                        position={[location.lat, location.lng]}
                        icon={customIcon}
                      >
                        <Popup className="custom-popup">
                          <div className="p-2 text-center">
                            <h3 className="text-lg font-bold text-primary">
                              {location.name}
                            </h3>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
