import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, getAvailableLanguages, getDefaultLanguage } from './i18n';

type LanguageContextType = {
    currentLanguage: string;
    availableLanguages: string[];
    changeLanguage: (lang: string) => void;
    isRTL: boolean;
    languageDetails: Record<
        string,
        { nativeName: string; dir: string; flag: string }
    >;
};

const LanguageContext = createContext<LanguageContextType>({
    currentLanguage: 'en',
    availableLanguages: ['en'],
    changeLanguage: () => {},
    isRTL: false,
    languageDetails: LANGUAGES,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(
        i18n.language || 'id'
    );
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([
        'id',
    ]);
    const [isRTL, setIsRTL] = useState(
        LANGUAGES[currentLanguage as keyof typeof LANGUAGES]?.dir === 'rtl'
    );

    // Set up available languages from local configuration
    useEffect(() => {
        // Get available languages from the i18n configuration
        const languages = getAvailableLanguages();
        setAvailableLanguages(languages);

        // Get default language
        const defaultLang = getDefaultLanguage();

        // If user hasn't selected a language yet, use the default
        if (!localStorage.getItem('i18nextLng')) {
            changeLanguage(defaultLang);
        }
    }, []);

    // Update RTL state when language changes
    useEffect(() => {
        const langDetails =
            LANGUAGES[currentLanguage as keyof typeof LANGUAGES];
        setIsRTL(langDetails?.dir === 'rtl');

        // Update document direction
        document.documentElement.dir = langDetails?.dir || 'ltr';
        document.documentElement.lang = currentLanguage;
    }, [currentLanguage]);

    // Function to change language
    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        setCurrentLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
    };

    return (
        <LanguageContext.Provider
            value={{
                currentLanguage,
                availableLanguages,
                changeLanguage,
                isRTL,
                languageDetails: LANGUAGES,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
