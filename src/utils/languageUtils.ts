
// Language utility functions

/**
 * Formats a date based on the current language/locale
 */
export const formatDate = (date: Date, language: string): string => {
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Formats a number based on the current language/locale
 */
export const formatNumber = (num: number, language: string): string => {
  return new Intl.NumberFormat(language).format(num);
};

/**
 * Formats a currency value based on the current language/locale
 */
export const formatCurrency = (amount: number, language: string, currency: string = 'USD'): string => {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Gets appropriate direction (ltr or rtl) based on language code
 */
export const getTextDirection = (language: string): 'ltr' | 'rtl' => {
  // RTL languages
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
};

/**
 * Handles pluralization based on count and language
 */
export const pluralize = (
  count: number, 
  language: string, 
  forms: {singular: string, plural: string, zero?: string}
): string => {
  if (count === 0 && forms.zero) {
    return forms.zero;
  }
  
  // Basic pluralization for English
  // In a real app, we'd use a more comprehensive solution like Intl.PluralRules
  return count === 1 ? forms.singular : forms.plural;
};
