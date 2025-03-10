import React, { createContext, useContext, useEffect, useState } from "react";
import { getPreferredTextSize, getHighContrastMode, setHighContrastMode } from "@/utils/languageUtils";

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
    "app.tagline": "Search medications, find specialists, and get personalized recommendations.",
    "app.footer.rights": "All rights reserved.",
    "app.footer.demo": "This is a demo application. Not for actual medical use.",
    "app.footer.global": "Providing global healthcare information and resources",
    "menu.admin": "Admin Dashboard",
    "menu.symptom_checker": "Symptom Checker",
    "menu.pharmacy_finder": "Global Pharmacy Finder",
    "menu.interaction_checker": "Interaction Checker",
    "menu.favorites": "My Favorites",
    "search.placeholder.global": "Search symptoms, conditions, specialists or medications...",
    "search.results": "Medication Results",
    "search.worldwide": "Search",
    "search.no_results": "No results found matching your search. Try different keywords.",
    "button.search": "Search",
    "button.clear": "Clear search",
    "medication.price": "Login to see pricing",
    "language.selection": "Select language",
    "language.auto_detected": "Auto-detected language",
    "loading.translations": "Loading translations...",
    "error.translations": "Error loading translations"
  },
  es: {
    "app.name": "MedMed.AI",
    "app.tagline": "Busque medicamentos, encuentre especialistas y obtenga recomendaciones personalizadas.",
    "app.footer.rights": "Todos los derechos reservados.",
    "app.footer.demo": "Esta es una aplicación de demostración. No para uso médico real.",
    "app.footer.global": "Proporcionando información y recursos de salud",
    "menu.admin": "Panel de Administración",
    "menu.symptom_checker": "Verificador de Síntomas",
    "menu.pharmacy_finder": "Buscador de Farmacias",
    "menu.interaction_checker": "Verificador de Interacciones",
    "menu.favorites": "Mis Favoritos",
    "search.placeholder.global": "Buscar síntomas, condiciones, especialistas o medicamentos...",
    "search.results": "Resultados de Medicamentos",
    "search.worldwide": "Buscar",
    "search.no_results": "No se encontraron resultados que coincidan con su búsqueda. Intente con palabras clave diferentes.",
    "button.search": "Buscar",
    "button.clear": "Limpiar búsqueda",
    "medication.price": "Inicie sesión para ver precios",
    "language.selection": "Seleccionar idioma",
    "language.auto_detected": "Idioma detectado automáticamente",
    "loading.translations": "Cargando traducciones...",
    "error.translations": "Error al cargar traducciones"
  },
  fr: {
    "app.name": "MedMed.AI",
    "app.tagline": "Recherchez des médicaments, trouvez des spécialistes et obtenez des recommandations personnalisées.",
    "app.footer.rights": "Tous droits réservés.",
    "app.footer.demo": "Ceci est une application de démonstration. Pas pour un usage médical réel.",
    "app.footer.global": "Fournir des informations et des ressources de santé",
    "menu.admin": "Tableau de Bord Admin",
    "menu.symptom_checker": "Vérificateur de Symptômes",
    "menu.pharmacy_finder": "Recherche de Pharmacies",
    "menu.interaction_checker": "Vérificateur d'Interactions",
    "menu.favorites": "Mes Favoris",
    "search.placeholder.global": "Rechercher des symptômes, des conditions, des spécialistes ou des médicaments...",
    "search.results": "Résultats de Médicaments",
    "search.worldwide": "Rechercher",
    "search.no_results": "Aucun résultat correspondant à votre recherche. Essayez des mots-clés différents.",
    "button.search": "Rechercher",
    "button.clear": "Effacer la recherche",
    "medication.price": "Connectez-vous pour voir les prix",
    "language.selection": "Sélectionner la langue",
    "language.auto_detected": "Langue détectée automatiquement",
    "loading.translations": "Chargement des traductions...",
    "error.translations": "Erreur de chargement des traductions"
  }
};

// Add types for accessibility settings
export interface AccessibilitySettings {
  highContrast: boolean;
  textSize: 'small' | 'medium' | 'large' | 'x-large';
  screenReaderOptimized: boolean;
}

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  autoDetectedLanguage: LanguageCode | null;
  isLoading: boolean;
  error: Error | null;
  supportedLanguages: typeof supportedLanguages;
  accessibility: AccessibilitySettings;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Add accessibility settings state
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    highContrast: getHighContrastMode(),
    textSize: getPreferredTextSize(),
    screenReaderOptimized: localStorage.getItem('medmed-accessibility-screen-reader') === 'true'
  });

  // Update document language and direction
  useEffect(() => {
    document.documentElement.lang = language;
    
    // Set text direction for RTL languages like Arabic
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  // Apply accessibility settings to the document
  useEffect(() => {
    // Apply text size
    document.documentElement.classList.remove('text-small', 'text-medium', 'text-large', 'text-xlarge');
    document.documentElement.classList.add(`text-${accessibility.textSize}`);
    
    // Apply high contrast
    if (accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply screen reader optimizations
    if (accessibility.screenReaderOptimized) {
      document.documentElement.classList.add('screen-reader-optimized');
    } else {
      document.documentElement.classList.remove('screen-reader-optimized');
    }
    
    // Save settings to localStorage
    localStorage.setItem('medmed-accessibility-text-size', accessibility.textSize);
    localStorage.setItem('medmed-accessibility-high-contrast', String(accessibility.highContrast));
    localStorage.setItem('medmed-accessibility-screen-reader', String(accessibility.screenReaderOptimized));
  }, [accessibility]);

  // Auto-detect language on initial load
  useEffect(() => {
    const detectedLang = detectBrowserLanguage();
    setAutoDetectedLanguage(detectedLang);
    
    // Only auto-switch if there's no user preference already saved
    if (!localStorage.getItem('medmed-language')) {
      setLanguageState(detectedLang);
    }
  }, []);

  // Load translations for the current language
  useEffect(() => {
    const loadTranslations = async () => {
      // Don't try to load if we already have translations for this language
      if (translations[language] && Object.keys(translations[language]).length > 10) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // In a real application, this would make an API call to get translations
        // For the demo, we're using the hardcoded translations or import from files
        
        // Simulating an API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // If no error, we use our default translations for now
        // In a real app, we would merge the API response with defaults
        setTranslations(prev => ({
          ...prev,
          [language]: {
            ...defaultTranslations[language as keyof typeof defaultTranslations] || defaultTranslations.en,
            // ...response.data, // API response would be merged here
          }
        }));
      } catch (err) {
        console.error("Error loading translations:", err);
        setError(err instanceof Error ? err : new Error("Failed to load translations"));
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

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
  
  // Update accessibility settings
  const updateAccessibility = (settings: Partial<AccessibilitySettings>) => {
    setAccessibility(prev => {
      const newSettings = { ...prev, ...settings };
      
      // Update high contrast mode in utils for global access
      if (settings.highContrast !== undefined) {
        setHighContrastMode(settings.highContrast);
      }
      
      return newSettings;
    });
  };

  // Provide context value
  const contextValue = {
    language,
    setLanguage,
    t,
    autoDetectedLanguage,
    isLoading,
    error,
    supportedLanguages,
    accessibility,
    updateAccessibility
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
