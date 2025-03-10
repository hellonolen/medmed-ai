// Add new function to detect if the user is using a screen reader
export const isUsingScreenReader = (): boolean => {
  // Check for common screen reader indicators
  return (
    typeof window !== 'undefined' && 
    (window.navigator?.userAgent?.includes('JAWS') ||
     window.navigator?.userAgent?.includes('NVDA') ||
     window.navigator?.userAgent?.includes('VoiceOver') ||
     // Check if the user has requested a screen reader experience
     localStorage.getItem('medmed-accessibility-screen-reader') === 'true')
  );
};

// Get user's preferred text size from localStorage or default to medium
export const getPreferredTextSize = (): 'small' | 'medium' | 'large' | 'x-large' => {
  if (typeof window === 'undefined') return 'medium';
  
  const savedSize = localStorage.getItem('medmed-accessibility-text-size');
  if (savedSize && ['small', 'medium', 'large', 'x-large'].includes(savedSize)) {
    return savedSize as 'small' | 'medium' | 'large' | 'x-large';
  }
  
  return 'medium';
};

// Set user's preferred text size to localStorage
export const setPreferredTextSize = (size: 'small' | 'medium' | 'large' | 'x-large'): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('medmed-accessibility-text-size', size);
  }
};

// Get user's preference for high contrast mode
export const getHighContrastMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if the user has explicitly set a preference
  const savedPreference = localStorage.getItem('medmed-accessibility-high-contrast');
  if (savedPreference !== null) {
    return savedPreference === 'true';
  }
  
  // Check if the user has requested high contrast at the OS level
  return window.matchMedia('(prefers-contrast: more)').matches;
};

// Set user's preference for high contrast mode
export const setHighContrastMode = (enabled: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('medmed-accessibility-high-contrast', String(enabled));
    
    // Apply the class to the document for immediate effect
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }
};
