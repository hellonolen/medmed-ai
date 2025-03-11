
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AccessibilityContextType {
  fontSize: 'normal' | 'large' | 'x-large';
  setFontSize: (size: 'normal' | 'large' | 'x-large') => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  readAloud: boolean;
  setReadAloud: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Local storage key for persisting accessibility settings
const ACCESSIBILITY_STORAGE_KEY = "medmed_accessibility_settings";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'x-large'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [readAloud, setReadAloud] = useState(false);

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.fontSize) setFontSize(settings.fontSize);
        if (typeof settings.highContrast === 'boolean') setHighContrast(settings.highContrast);
        if (typeof settings.readAloud === 'boolean') setReadAloud(settings.readAloud);
      }
    } catch (error) {
      console.error("Error loading accessibility settings:", error);
    }
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(
        ACCESSIBILITY_STORAGE_KEY,
        JSON.stringify({ fontSize, highContrast, readAloud })
      );
    } catch (error) {
      console.error("Error saving accessibility settings:", error);
    }
  }, [fontSize, highContrast, readAloud]);

  // Apply font size to the document body
  useEffect(() => {
    document.body.classList.remove('text-normal', 'text-large', 'text-x-large');
    document.body.classList.add(`text-${fontSize}`);
    
    // Add appropriate CSS classes for high contrast if enabled
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    return () => {
      document.body.classList.remove('text-normal', 'text-large', 'text-x-large', 'high-contrast');
    };
  }, [fontSize, highContrast]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        readAloud,
        setReadAloud
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
