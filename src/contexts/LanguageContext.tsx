
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
  autoDetectedLanguage: LanguageCode | null;
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
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
    // Default English translations to avoid empty screen
    en: {}
  });
  const [autoDetectedLanguage, setAutoDetectedLanguage] = useState<LanguageCode | null>(null);

  // Set document language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Auto-detect language on initial load
  useEffect(() => {
    const detectedLang = detectBrowserLanguage();
    setAutoDetectedLanguage(detectedLang);
    
    // Only auto-switch if there's no user preference already saved
    if (!localStorage.getItem('medmed-language')) {
      setLanguageState(detectedLang);
    }
  }, []);

  // Translation function that works even if translations aren't loaded yet
  const t = (key: string, fallback: string = key): string => {
    if (!translations[language] || !translations[language][key]) {
      return fallback;
    }
    
    return translations[language][key];
  };

  // Update language and save to localStorage
  const setLanguage = (lang: LanguageCode) => {
    try {
      localStorage.setItem('medmed-language', lang);
    } catch (e) {
      console.error("Could not save language preference to localStorage", e);
    }
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, autoDetectedLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
