
import React, { createContext, useContext, useEffect, useState } from "react";

// Supported languages with their native names
export const supportedLanguages = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
  ar: "العربية",
  ru: "Русский",
  ja: "日本語",
  hi: "हिन्दी",
  pt: "Português"
};

export type LanguageCode = keyof typeof supportedLanguages;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to detect the browser language or use English as fallback
  const detectBrowserLanguage = (): LanguageCode => {
    try {
      const browserLang = navigator.language.split('-')[0];
      return (browserLang in supportedLanguages) 
        ? (browserLang as LanguageCode) 
        : 'en';
    } catch (e) {
      return 'en';
    }
  };

  // Get language from localStorage or detect from browser
  const getInitialLanguage = (): LanguageCode => {
    try {
      const storedLang = localStorage.getItem('medmed-language');
      if (storedLang && storedLang in supportedLanguages) {
        return storedLang as LanguageCode;
      }
      return detectBrowserLanguage();
    } catch (e) {
      return 'en';
    }
  };

  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});

  // Load translation files
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // In a real app, this would be a more organized structure with proper language files
        // For this example, we're using a simple dynamic import
        const module = await import(`../translations/${language}.ts`);
        setTranslations(prevTranslations => ({
          ...prevTranslations,
          [language]: module.default
        }));
      } catch (error) {
        console.error(`Could not load translations for ${language}`, error);
        // Fallback to English if translations can't be loaded
        if (language !== 'en') {
          const enModule = await import(`../translations/en.ts`);
          setTranslations(prevTranslations => ({
            ...prevTranslations,
            [language]: enModule.default
          }));
        }
      }
    };
    
    loadTranslations();
  }, [language]);

  // Update language and save to localStorage
  const setLanguage = (lang: LanguageCode) => {
    try {
      localStorage.setItem('medmed-language', lang);
    } catch (e) {
      console.error("Could not save language preference to localStorage", e);
    }
    setLanguageState(lang);
    document.documentElement.lang = lang;
  };

  // Translation function
  const t = (key: string, fallback: string = key): string => {
    if (!translations[language]) {
      return fallback;
    }
    
    return translations[language][key] || fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
