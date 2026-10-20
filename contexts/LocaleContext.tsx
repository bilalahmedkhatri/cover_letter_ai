import React, { createContext, useContext, useEffect, useLayoutEffect, ReactNode } from 'react';
import type { TranslationKeys } from '../services/translations';
import type { Locale } from '../types';
import type { LocaleData } from '../services/locale-data';
import { useOptionalPageCopy } from './PageCopyContext';


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
  shell: LocaleData['shell'];
  t: (key: TranslationKeys, replacements?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children, locale, data }: { children: ReactNode; locale: Locale; data: LocaleData }) => {

  // Commit direction before paint when client navigation changes the locale.
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  useEffect(() => {
    try {
        localStorage.setItem('locale', locale);
    } catch (error) {
        console.warn("Could not save locale to localStorage.", error);
    }
  }, [locale]);

  // The translation function
  const t = (key: TranslationKeys, replacements?: Record<string, string>): string => {
    let translation = data.messages[key];
    
    // If no translation is found even in the fallback, return the key itself to avoid crashing.
    if (!translation) {
        console.warn(`Translation for key "${key}" not found.`);
        return key;
    }
    
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{{${rKey}}}`, replacements[rKey]);
        });
    }
    return translation;
  };

  return (
    <LocaleContext.Provider value={{ locale, shell: data.shell, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  const pageCopy = useOptionalPageCopy();
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  if (!pageCopy?.messages) return context;
  return { ...context, t: (key, replacements) => {
    let text = pageCopy.messages[key];
    if (!text) return context.t(key, replacements);
    for (const [name, value] of Object.entries(replacements || {})) text = text.replace(`{{${name}}}`, value);
    return text;
  } };
};
