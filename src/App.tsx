import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "./components/Navbar";
// Import only essential components directly
import SEO from "./components/SEO";
import HBMLoadingSpinner from "./components/LoadingSpinner";
import { AuthProvider } from "./lib/AuthContext";
import ContentSyncProvider from "./components/ContentSyncProvider";
import "./styles/globals.css";
import "./styles/rtl.css"; // Import RTL support styles
import { useTranslation } from "react-i18next";
import "./lib/i18n"; // Import i18n configuration

// Lazy load all other components
const HeroSection = lazy(() => import("./components/HeroSection"));
const TrustedBy = lazy(() => import("./components/TrustedBy"));
const ServicesSection = lazy(() => import("./components/ServicesSection"));
const ProcessSection = lazy(() => import("./components/ProcessSection"));
const AboutSection = lazy(() => import("./components/AboutSection"));
const TestimonialsSection = lazy(() => import("./components/TestimonialsSection"));
const FAQSection = lazy(() => import("./components/FAQSection"));
const ContactSection = lazy(() => import("./components/ContactSection"));
const FloatingSocial = lazy(() => import("./components/FloatingSocial"));
const BackToTop = lazy(() => import("./components/BackToTop"));
const Footer = lazy(() => import("./components/Footer"));
const NotFound = lazy(() => import("./components/NotFound"));

// Lazy load admin components
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const HeroSectionEditor = lazy(() => import("./components/admin/HeroSectionEditor"));
const TrustedByEditor = lazy(() => import("./components/admin/TrustedByEditor"));
const ServicesSectionEditor = lazy(() => import("./components/admin/ServicesSectionEditor"));
const ProcessSectionEditor = lazy(() => import("./components/admin/ProcessSectionEditor"));
const AboutSectionEditor = lazy(() => import("./components/admin/AboutSectionEditor"));
const TestimonialsSectionEditor = lazy(() => import("./components/admin/TestimonialsSectionEditor"));
const FAQSectionEditor = lazy(() => import("./components/admin/FAQSectionEditor"));
const ContactSectionEditor = lazy(() => import("./components/admin/ContactSectionEditor"));
const FloatingSocialEditor = lazy(() => import("./components/admin/FloatingSocialEditor"));
const SEOEditor = lazy(() => import("./components/admin/SEOEditor"));
const SettingsPage = lazy(() => import("./components/admin/SettingsPage"));
const TranslationsManager = lazy(() => import("./components/admin/TranslationsManager"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// AppContent component to use hooks that require Router context
const AppContent = () => {
  const { pathname } = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    document.title =
      "HBM Jakarta - Professional Visa & Work Permit Services in Indonesia";

    const animateOnScroll = () => {
      const elements = document.querySelectorAll(".animate-on-scroll");
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        if (isVisible) {
          element.classList.add("animate-in");
        }
      });
    };

    animateOnScroll();
    window.addEventListener("scroll", animateOnScroll);

    return () => window.removeEventListener("scroll", animateOnScroll);
  }, []);

  if (isLoading && !pathname.includes("/admin")) {
    return (
      <div className="fixed inset-0 bg-primary flex items-center justify-center z-50">
        <div className="animate-pulse text-white text-3xl font-bold">
          HBM Jakarta
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/admin/login" element={
        <Suspense fallback={<LoadingSpinner />}>
          <AdminLogin />
        </Suspense>
      } />

      {/* Admin Panel Routes */}
      <Route path="/admin" element={
        <Suspense fallback={<LoadingSpinner />}>
          <AdminLayout />
        </Suspense>
      }>
        <Route index element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard />
          </Suspense>
        } />

        {/* Section Editors */}
        <Route path="sections/hero" element={
          <Suspense fallback={<LoadingSpinner />}>
            <HeroSectionEditor />
          </Suspense>
        } />
        <Route path="sections/trusted-by" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TrustedByEditor />
          </Suspense>
        } />
        <Route path="sections/services" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ServicesSectionEditor />
          </Suspense>
        } />
        <Route path="sections/process" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProcessSectionEditor />
          </Suspense>
        } />
        <Route path="sections/about" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AboutSectionEditor />
          </Suspense>
        } />
        <Route
          path="sections/testimonials"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <TestimonialsSectionEditor />
            </Suspense>
          }
        />
        <Route path="sections/faqs" element={
          <Suspense fallback={<LoadingSpinner />}>
            <FAQSectionEditor />
          </Suspense>
        } />
        <Route path="sections/contact" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ContactSectionEditor />
          </Suspense>
        } />
        <Route
          path="sections/floating-social"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <FloatingSocialEditor />
            </Suspense>
          }
        />
        <Route path="seo" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SEOEditor />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsPage />
          </Suspense>
        } />
        <Route path="translations" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TranslationsManager />
          </Suspense>
        } />
      </Route>

      {/* Main Landing Page */}
      <Route
        path="/"
        element={
          <>
            <SEO />
            <Navbar />
            <Suspense fallback={<LoadingSpinner />}>
              <FloatingSocial />
            </Suspense>
            <Suspense fallback={<LoadingSpinner />}>
              <BackToTop />
            </Suspense>
            <main>
              <Suspense fallback={<LoadingSpinner />}>
                <HeroSection />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <TrustedBy />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <ServicesSection />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <ProcessSection />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <AboutSection />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <TestimonialsSection />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <FAQSection />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <ContactSection />
              </Suspense>
            </main>
            <Suspense fallback={<LoadingSpinner />}>
              <Footer />
            </Suspense>
          </>
        }
      />

      {/* 404 Not Found */}
      <Route path="*" element={
        <Suspense fallback={<LoadingSpinner />}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  );
};

function App() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
    });

    // Set initial document direction based on language
    const currentLang = i18n.language || 'en';
    const LANGUAGES = {
      en: { dir: 'ltr' },
      id: { dir: 'ltr' },
      ja: { dir: 'ltr' },
      zh: { dir: 'ltr' },
      de: { dir: 'ltr' },
      ar: { dir: 'rtl' }
    };
    
    const langDetails = LANGUAGES[currentLang as keyof typeof LANGUAGES];
    if (langDetails) {
      document.documentElement.dir = langDetails.dir;
      document.documentElement.lang = currentLang;
    }
  }, [i18n.language]);
  
  return (
    <HelmetProvider>
      <AuthProvider>
        <ContentSyncProvider>
          <Router>
            {isLoading && <HBMLoadingSpinner onLoadComplete={() => setIsLoading(false)} />}
            <Toaster position="top-right" />
            <div className="min-h-screen">
              <AppContent />
            </div>
          </Router>
        </ContentSyncProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
