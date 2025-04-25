import React, { useState, useEffect } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LANGUAGES, getAvailableLanguages } from "../lib/i18n";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchAvailableLanguages = async () => {
      await getAvailableLanguages();
    };

    fetchAvailableLanguages();
  }, []);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setLanguageMenuOpen(false);
    // Store the selected language in localStorage
    localStorage.setItem("i18nextLng", language);
    
    // Set the document direction based on language
    const langDetails = LANGUAGES[language as keyof typeof LANGUAGES];
    if (langDetails) {
      document.documentElement.dir = langDetails.dir || 'ltr';
      document.documentElement.lang = language;
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Successfully logged out");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    }
  };

  const currentLanguage = i18n.language || "en";

  const languages = [
    { code: "en", name: "English" },
    { code: "id", name: "Indonesia" },
    { code: "ja", name: "日本語" },
    { code: "zh", name: "中文" },
    { code: "de", name: "Deutsch" },
    { code: "ar", name: "العربية" },
  ];

  const isRTL = i18n.dir() === 'rtl';

  const currentLanguageName = languages.find(lang => lang.code === i18n.language)?.name || 'Language';

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"
      } ${isRTL ? 'rtl' : 'ltr'}`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link
              to="/"
              className={`font-inter text-2xl font-bold ${
                scrolled ? "text-primary" : "text-white"
              }`}
            >
              HBM
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="#home"
              className={`font-medium hover:text-accent transition-colors ${
                scrolled ? "text-gray-800" : "text-white"
              }`}
            >
              {t("nav.home", "Home")}
            </a>
            <a
              href="#services"
              className={`font-medium hover:text-accent transition-colors ${
                scrolled ? "text-gray-800" : "text-white"
              }`}
            >
              {t("nav.services", "Services")}
            </a>
            <a
              href="#about"
              className={`font-medium hover:text-accent transition-colors ${
                scrolled ? "text-gray-800" : "text-white"
              }`}
            >
              {t("nav.about", "About")}
            </a>
            <a
              href="#testimonials"
              className={`font-medium hover:text-accent transition-colors ${
                scrolled ? "text-gray-800" : "text-white"
              }`}
            >
              {t("nav.testimonials", "Testimonials")}
            </a>
            <a href="#contact" className="btn btn-primary ml-4">
              {t("nav.contact_us", "Contact Us")}
            </a>

            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className={`flex items-center space-x-1 p-2 rounded-full ${
                  scrolled
                    ? "text-primary bg-gray-100"
                    : "text-white bg-white/10"
                }`}
              >
                <Globe size={18} />
                <span className="text-sm ml-1">{currentLanguageName}</span>
                <ChevronDown size={14} className={`transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        currentLanguage === lang.code
                          ? "bg-gray-50 text-primary font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${
                scrolled ? "text-primary" : "text-white"
              }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${isRTL ? 'rtl' : 'ltr'}`}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-6 border-b">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary">HBM</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-primary"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="flex flex-col space-y-6">
              <a
                href="#home"
                onClick={() => setIsOpen(false)}
                className="text-xl font-medium text-gray-800 hover:text-primary"
              >
                {t("nav.home", "Home")}
              </a>
              <a
                href="#services"
                onClick={() => setIsOpen(false)}
                className="text-xl font-medium text-gray-800 hover:text-primary"
              >
                {t("nav.services", "Services")}
              </a>
              <a
                href="#about"
                onClick={() => setIsOpen(false)}
                className="text-xl font-medium text-gray-800 hover:text-primary"
              >
                {t("nav.about", "About")}
              </a>
              <a
                href="#testimonials"
                onClick={() => setIsOpen(false)}
                className="text-xl font-medium text-gray-800 hover:text-primary"
              >
                {t("nav.testimonials", "Testimonials")}
              </a>
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="btn btn-primary"
              >
                {t("nav.contact_us", "Contact Us")}
              </a>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-4">
                  {t("nav.language", "Language")}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setIsOpen(false);
                      }}
                      className={`flex items-center px-3 py-2 rounded-md text-sm ${
                        currentLanguage === lang.code
                          ? "bg-primary/10 text-primary font-medium"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {user && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">
                    {t("nav.account", "Account")}
                  </h3>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-sm bg-gray-100 text-gray-700 mb-2"
                    >
                      {t("nav.admin_dashboard", "Admin Dashboard")}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center px-3 py-2 rounded-md text-sm bg-red-50 text-red-600"
                  >
                    {t("nav.logout", "Logout")}
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
