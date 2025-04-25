import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";

type ContactSectionData = {
  title: string;
  subtitle: string;
  content: {
    description: string;
    contact_info: {
      address: string;
      phone: string;
      whatsapp: string;
      email: string;
      support_email: string;
      business_hours: {
        weekdays: string;
        weekends: string;
      }
    };
    social_media: {
      facebook: string;
      instagram: string;
      twitter: string;
      youtube: string;
    };
  };
  is_active: boolean;
};

const ContactSection = () => {
  const [loading, setLoading] = useState(true);
  const [contactData, setContactData] = useState<ContactSectionData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const { t, i18n } = useTranslation('section.contact');
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
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
    } catch (err: any) {
      console.error("Error fetching contact section:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");

    try {
      // Here you would typically send the form data to your backend
      // For demonstration, we'll simulate a successful submission after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setFormStatus("success");
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus("idle");
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormStatus("error");
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        setFormStatus("idle");
      }, 5000);
    }
  };

  if (loading) {
    return (
      <section id="contact" className={`py-20 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4 md:px-6 flex justify-center items-center" style={{ minHeight: "300px" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  // If section is not active and we're not in development mode, don't render
  if (!contactData?.is_active && process.env.NODE_ENV !== "development") {
    return null;
  }

  // Default values if data is not available
  const defaultContactData = {
    title: "Get in Touch with Our Experts",
    subtitle: "CONTACT US",
    content: {
      description: "Have questions about visa requirements or need assistance with your documentation? Our team is ready to help you navigate the process smoothly.",
      contact_info: {
        address: "Jl. Sudirman Kav. 52-53, Jakarta Selatan, 12190, Indonesia",
        phone: "+62 21 123 4567",
        whatsapp: "+62 812 3456 7890 (WhatsApp)",
        email: "info@visapro-indonesia.com",
        support_email: "support@visapro-indonesia.com",
        business_hours: {
          weekdays: "Monday - Friday: 9:00 AM - 5:00 PM",
          weekends: "Saturday: 9:00 AM - 1:00 PM"
        }
      },
      social_media: {
        facebook: "#",
        instagram: "#",
        twitter: "#",
        youtube: "#"
      }
    }
  };

  // Use data from Supabase or fallback to defaults
  const title = t('title', { defaultValue: contactData?.title || defaultContactData.title });
  const subtitle = t('subtitle', { defaultValue: contactData?.subtitle || defaultContactData.subtitle });
  const description = t('description', { defaultValue: contactData?.content?.description || defaultContactData.content.description });
  
  // Contact info
  const contactInfo = contactData?.content?.contact_info || defaultContactData.content.contact_info;
  const address = t('address', { defaultValue: contactInfo.address });
  const phone = contactInfo.phone;
  const whatsapp = contactInfo.whatsapp;
  const email = contactInfo.email;
  const supportEmail = contactInfo.support_email;
  const weekdays = t('weekdays', { defaultValue: contactInfo.business_hours?.weekdays });
  const weekends = t('weekends', { defaultValue: contactInfo.business_hours?.weekends });
  
  // Social media
  const socialMedia = contactData?.content?.social_media || defaultContactData.content.social_media;

  // Form labels
  const formNameLabel = t('form_name_label', { defaultValue: "Your Name" });
  const formEmailLabel = t('form_email_label', { defaultValue: "Your Email" });
  const formSubjectLabel = t('form_subject_label', { defaultValue: "Subject" });
  const formMessageLabel = t('form_message_label', { defaultValue: "Your Message" });
  const formSubmitText = t('form_submit_text', { defaultValue: "Send Message" });
  const successMessage = t('success_message', { defaultValue: "Thank you! Your message has been sent successfully." });
  const errorMessage = t('error_message', { defaultValue: "Oops! Something went wrong. Please try again later." });

  return (
    <section id="contact" className={`py-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h5 className="text-primary font-medium mb-3 tracking-wider">{subtitle}</h5>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-1/3" data-aos="fade-right">
            <div className="bg-primary rounded-lg shadow-lg p-6 md:p-8 text-white">
              <h3 className="text-2xl font-playfair font-bold mb-6">
                {t('contact_info_title', { defaultValue: "Contact Information" })}
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-white/10 p-3 rounded-full mr-4">
                    <MapPin size={20} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-accent">
                      {t('our_office', { defaultValue: "Our Office" })}
                    </h4>
                    <p className="mt-1">{address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white/10 p-3 rounded-full mr-4">
                    <Phone size={20} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-accent">
                      {t('phone', { defaultValue: "Phone" })}
                    </h4>
                    <p className="mt-1">{phone}</p>
                    <p>{whatsapp}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white/10 p-3 rounded-full mr-4">
                    <Mail size={20} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-accent">
                      {t('email', { defaultValue: "Email" })}
                    </h4>
                    <p className="mt-1">{email}</p>
                    <p>{supportEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white/10 p-3 rounded-full mr-4">
                    <Clock size={20} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-accent">
                      {t('business_hours', { defaultValue: "Business Hours" })}
                    </h4>
                    <p className="mt-1">{weekdays}</p>
                    <p>{weekends}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/20">
                <h4 className="font-bold text-lg mb-4">
                  {t('follow_us', { defaultValue: "Follow Us" })}
                </h4>
                <div className="flex space-x-4">
                  <a href={socialMedia.facebook} className="bg-white/10 p-2 rounded-full hover:bg-accent transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href={socialMedia.instagram} className="bg-white/10 p-2 rounded-full hover:bg-accent transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href={socialMedia.twitter} className="bg-white/10 p-2 rounded-full hover:bg-accent transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href={socialMedia.youtube} className="bg-white/10 p-2 rounded-full hover:bg-accent transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 011.772 1.153 2.504 2.504 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a2.504 2.504 0 01-1.153 1.772 2.504 2.504 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a2.504 2.504 0 01-1.772-1.153 2.504 2.504 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a2.504 2.504 0 011.153-1.772A2.504 2.504 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/3" data-aos="fade-left">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-playfair font-bold mb-6">
                {t('form_title', { defaultValue: "Send Us A Message" })}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2">
                      {formNameLabel}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                      {formEmailLabel}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-gray-700 mb-2">
                    {formSubjectLabel}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 mb-2">
                    {formMessageLabel}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  ></textarea>
                </div>
                
                {formStatus === "success" && (
                  <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
                    {successMessage}
                  </div>
                )}
                
                {formStatus === "error" && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                    {errorMessage}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={formStatus === "submitting"}
                  className="btn btn-primary"
                >
                  {formStatus === "submitting" ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>{t('sending', { defaultValue: "Sending..." })}</span>
                    </div>
                  ) : (
                    formSubmitText
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
