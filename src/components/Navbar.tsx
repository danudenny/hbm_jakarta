import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import useSiteSettings from '../hooks/useSiteSettings';
import { useAuth } from '../lib/AuthContext';
import { LANGUAGES, getAvailableLanguages } from '../lib/i18n';
import { supabase } from '../lib/supabase';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('common');
    const { settings } = useSiteSettings();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchAvailableLanguages = async () => {
            // No need to await since we're using static values now
            getAvailableLanguages();
        };

        fetchAvailableLanguages();
    }, []);

    // Add debugging for settings object
    useEffect(() => {
        if (settings) {
            console.log('Navbar - settings loaded:', settings);
            console.log('Navbar - logo URL:', settings.company_logo);
        } else {
            console.log('Navbar - settings not loaded yet');
        }
    }, [settings]);

    const handleLanguageChange = (language: string) => {
        i18n.changeLanguage(language);
        setLanguageMenuOpen(false);
        // Store the selected language in localStorage
        localStorage.setItem('i18nextLng', language);

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

            toast.success(t('logout_success', 'Successfully logged out'));
            navigate('/');
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to log out';
            toast.error(errorMessage);
        }
    };

    const currentLanguage = i18n.language || 'id';

    // Updated to include all 7 supported languages
    const languages = [
        { code: 'id', name: 'Indonesia' },
        { code: 'en', name: 'English' },
        { code: 'de', name: 'Deutsch' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' },
        { code: 'zh', name: '中文' },
        { code: 'ar', name: 'العربية' },
    ];

    const isRTL = i18n.dir() === 'rtl';

    const currentLanguageName =
        languages.find((lang) => lang.code === i18n.language)?.name ||
        t('nav.language', 'Language');

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${
                scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
            } ${isRTL ? 'rtl' : 'ltr'}`}
        >
            <div className="container px-4 mx-auto md:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className={`font-inter text-2xl font-bold ${
                                scrolled ? 'text-primary' : 'text-white'
                            }`}
                        >
                            {settings?.company_logo ? (
                                <div className="flex items-center">
                                    <img
                                        src={settings.company_logo}
                                        alt={t(
                                            'company_logo_alt',
                                            'Company Logo'
                                        )}
                                        className="object-contain w-auto h-10 mr-3"
                                        onError={(e) => {
                                            console.error(
                                                'Error loading logo:',
                                                e
                                            );
                                            // Set fallback text when image fails to load
                                            e.currentTarget.style.display =
                                                'none';
                                        }}
                                    />
                                    <span
                                        className={`font-heading text-xl tracking-wide ${
                                            scrolled
                                                ? 'text-primary'
                                                : 'text-white'
                                        }`}
                                    >
                                        {t(
                                            'company_name',
                                            settings?.company_name ||
                                                'Hasmar Bumi Mandiri'
                                        )}
                                    </span>
                                </div>
                            ) : (
                                <span className="tracking-wide font-heading">
                                    {t(
                                        'company_name',
                                        settings?.company_name ||
                                            'Hasmar Bumi Mandiri'
                                    )}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="items-center hidden space-x-8 md:flex">
                        <a
                            href="#home"
                            className={`font-medium hover:text-accent transition-colors ${
                                scrolled ? 'text-gray-800' : 'text-white'
                            }`}
                        >
                            {t('nav.home', 'Home')}
                        </a>
                        <a
                            href="#services"
                            className={`font-medium hover:text-accent transition-colors ${
                                scrolled ? 'text-gray-800' : 'text-white'
                            }`}
                        >
                            {t('nav.services', 'Services')}
                        </a>
                        <a
                            href="#about"
                            className={`font-medium hover:text-accent transition-colors ${
                                scrolled ? 'text-gray-800' : 'text-white'
                            }`}
                        >
                            {t('nav.about', 'About')}
                        </a>
                        <a
                            href="#testimonials"
                            className={`font-medium hover:text-accent transition-colors ${
                                scrolled ? 'text-gray-800' : 'text-white'
                            }`}
                        >
                            {t('nav.testimonials', 'Testimonials')}
                        </a>
                        <a href="#contact" className="ml-4 btn btn-primary">
                            {t('nav.contact_us', 'Contact Us')}
                        </a>

                        <div className="relative">
                            <button
                                onClick={() =>
                                    setLanguageMenuOpen(!languageMenuOpen)
                                }
                                className={`flex items-center space-x-1 p-2 rounded-full ${
                                    scrolled
                                        ? 'text-primary bg-gray-100'
                                        : 'text-white bg-white/10'
                                }`}
                                aria-label={t(
                                    'change_language',
                                    'Change language'
                                )}
                            >
                                <Globe size={18} />
                                <span className="ml-1 text-sm">
                                    {currentLanguageName}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${
                                        languageMenuOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {languageMenuOpen && (
                                <div className="absolute right-0 z-50 w-48 py-1 mt-2 bg-white rounded-md shadow-lg">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() =>
                                                handleLanguageChange(lang.code)
                                            }
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                                currentLanguage === lang.code
                                                    ? 'bg-gray-50 text-primary font-medium'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex md:hidden">
                        <button
                            onClick={() =>
                                setLanguageMenuOpen(!languageMenuOpen)
                            }
                            className={`p-2 mr-2 rounded-full ${
                                scrolled
                                    ? 'text-primary bg-gray-100'
                                    : 'text-white bg-white/10'
                            }`}
                            aria-label={t('change_language', 'Change language')}
                        >
                            <Globe size={20} />
                        </button>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`p-2 rounded-md ${
                                scrolled ? 'text-gray-800' : 'text-white'
                            }`}
                            aria-label={
                                isOpen
                                    ? t('close_menu', 'Close menu')
                                    : t('open_menu', 'Open menu')
                            }
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="px-4 py-3 bg-white md:hidden">
                    <div className="flex flex-col space-y-3">
                        <a
                            href="#home"
                            className="font-medium text-gray-800 hover:text-accent"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('nav.home', 'Home')}
                        </a>
                        <a
                            href="#services"
                            className="font-medium text-gray-800 hover:text-accent"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('nav.services', 'Services')}
                        </a>
                        <a
                            href="#about"
                            className="font-medium text-gray-800 hover:text-accent"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('nav.about', 'About')}
                        </a>
                        <a
                            href="#testimonials"
                            className="font-medium text-gray-800 hover:text-accent"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('nav.testimonials', 'Testimonials')}
                        </a>
                        <a
                            href="#contact"
                            className="font-medium text-gray-800 hover:text-accent"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('nav.contact_us', 'Contact Us')}
                        </a>

                        {user ? (
                            <>
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className="font-medium text-gray-800 hover:text-accent"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {t('nav.admin_panel', 'Admin Panel')}
                                    </Link>
                                )}
                                <Link
                                    to="/dashboard"
                                    className="font-medium text-gray-800 hover:text-accent"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('nav.dashboard', 'Dashboard')}
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="font-medium text-left text-gray-800 hover:text-accent"
                                >
                                    {t('nav.logout', 'Logout')}
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="font-medium text-gray-800 hover:text-accent"
                                onClick={() => setIsOpen(false)}
                            >
                                {t('nav.login', 'Login')}
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Language menu for mobile */}
            {languageMenuOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setLanguageMenuOpen(false)}
                    ></div>
                    <div className="relative z-10 w-64 p-4 bg-white rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">
                                {t('select_language', 'Select Language')}
                            </h3>
                            <button
                                onClick={() => setLanguageMenuOpen(false)}
                                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        handleLanguageChange(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-md text-sm ${
                                        currentLanguage === lang.code
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
