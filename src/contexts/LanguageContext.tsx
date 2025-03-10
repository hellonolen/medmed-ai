
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

// Default translations to avoid empty screen
const defaultTranslations = {
  en: {
    "app.name": "MedMed.AI",
    "app.tagline": "Global healthcare platform: Search medications, find specialists, and get personalized recommendations worldwide",
    "app.footer.rights": "All rights reserved.",
    "app.footer.demo": "This is a demo application. Not for actual medical use.",
    "app.footer.global": "Providing global healthcare information and resources",
    "menu.admin": "Admin Dashboard",
    "menu.symptom_checker": "Symptom Checker",
    "menu.pharmacy_finder": "Global Pharmacy Finder",
    "menu.interaction_checker": "Interaction Checker",
    "menu.favorites": "My Favorites",
    "search.placeholder.global": "Search symptoms, conditions, specialists or medications worldwide...",
    "search.results": "Global Medication Results",
    "search.worldwide": "Worldwide search",
    "search.no_results": "No results found matching your search. Try different keywords.",
    "button.search": "Search",
    "button.clear": "Clear search",
    "medication.price": "Login to see pricing"
  }
};

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
      console.error("Error detecting browser language:", e);
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
      console.error("Error getting initial language:", e);
      return 'en';
    }
  };

  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(defaultTranslations);
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
      // Try the default translations as a fallback
      if (defaultTranslations.en[key]) {
        return defaultTranslations.en[key];
      }
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

  // Provide context value
  const contextValue = {
    language,
    setLanguage,
    t,
    autoDetectedLanguage
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
