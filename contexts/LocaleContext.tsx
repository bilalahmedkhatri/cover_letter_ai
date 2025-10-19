import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations, TranslationKeys } from '../services/translations';
import { Locale } from '../types';

export const locales: { code: Locale; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ru', name: 'Русский' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pt', name: 'Português' },
    { code: 'ar', name: 'العربية' },
];

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKeys, replacements?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to English, but check for a saved locale
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    // Check for a saved locale in localStorage on initial load
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && locales.some(l => l.code === savedLocale)) {
      setLocale(savedLocale);
    } else {
        // Fallback to browser language if no preference is saved
        const browserLang = navigator.language.split('-')[0] as Locale;
        if(locales.some(l => l.code === browserLang)) {
            setLocale(browserLang);
        }
    }
  }, []);

  // Effect to update everything when the locale changes
  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
    // Set text direction for RTL languages like Arabic
    if (locale === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
  }, [locale]);

  // The translation function
  const t = (key: TranslationKeys, replacements?: Record<string, string>): string => {
    let translation = translations[locale][key] || translations['en'][key];
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{{${rKey}}}`, replacements[rKey]);
        });
    }
    return translation;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
