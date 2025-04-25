import React, { useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'minimal';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'dropdown',
  className = ''
}) => {
  const { currentLanguage, availableLanguages, changeLanguage, languageDetails } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  // Get current language details
  const currentLangDetails = languageDetails[currentLanguage as keyof typeof languageDetails] || 
    { nativeName: 'English', flag: '🇺🇸' };

  // Filter available languages to only include those in our languageDetails
  const filteredLanguages = availableLanguages.filter(
    lang => Object.keys(languageDetails).includes(lang)
  );

  // Render dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Select language"
        >
          <Globe size={18} className="mr-1" />
          <span className="mr-1">{currentLangDetails.flag}</span>
          <span className="hidden md:inline">{currentLangDetails.nativeName}</span>
        </button>
        
        {isOpen && (
          <>
            {/* Backdrop to capture clicks outside */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={closeDropdown}
            />
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg z-50 py-1 border border-gray-200 dark:border-gray-700">
              {filteredLanguages.map((lang) => {
                const langDetails = languageDetails[lang as keyof typeof languageDetails];
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      changeLanguage(lang);
                      closeDropdown();
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 ${
                      currentLanguage === lang ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''
                    }`}
                  >
                    <span>{langDetails.flag}</span>
                    <span>{langDetails.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Render buttons variant
  if (variant === 'buttons') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {filteredLanguages.map((lang) => {
          const langDetails = languageDetails[lang as keyof typeof languageDetails];
          return (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`px-3 py-1 rounded-md flex items-center ${
                currentLanguage === lang
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-label={`Switch to ${langDetails.nativeName}`}
            >
              <span className="mr-1">{langDetails.flag}</span>
              <span className="hidden md:inline">{langDetails.nativeName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Render minimal variant (just icons)
  return (
    <div className={`flex space-x-1 ${className}`}>
      {filteredLanguages.map((lang) => {
        const langDetails = languageDetails[lang as keyof typeof languageDetails];
        return (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              currentLanguage === lang
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label={`Switch to ${langDetails.nativeName}`}
          >
            {langDetails.flag}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
