import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AboutUs from './components/AboutUs';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import Footer from './components/Footer';
import NotFoundPage from './components/NotFoundPage';
import CookieConsentBanner from './components/CookieConsentBanner';
import { themes } from './theme';
import WhatsAppJoin from './components/WhatsAppJoin';
import BackToTopButton from './components/BackToTopButton';
import { LocaleProvider, useLocale, locales } from './contexts/LocaleContext';
import { TranslationKeys } from './services/translations';
import DashboardPage from './components/DashboardPage';
import { FormStateProvider } from './contexts/FormStateContext';
import { GenerationProvider } from './contexts/GenerationContext';
import { localizedPath, resolveRoute, siteOrigin, Page } from './services/routing';

// --- Theme Management ---
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const generateThemeCss = (themes: Record<string, Record<string, string>>): string => {
  let css = '';
  const defaultThemeName = 'dark';
  const defaultTheme = themes[defaultThemeName];

  css += `:root, .theme-${defaultThemeName} {\n`;
  for (const property in defaultTheme) {
    css += `  ${property}: ${defaultTheme[property]};\n`;
  }
  css += '}\n\n';

  for (const themeName in themes) {
    if (themeName === defaultThemeName) continue;

    css += `.theme-${themeName} {\n`;
    const themeProperties = themes[themeName];
    for (const property in themeProperties) {
      css += `  ${property}: ${themeProperties[property]};\n`;
    }
    css += '}\n\n';
  }
  return css;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const themeCss = generateThemeCss(themes);
    const styleElement = document.createElement('style');
    styleElement.id = 'app-theme-styles';

    const existingStyleElement = document.getElementById('app-theme-styles');
    if (existingStyleElement) {
      existingStyleElement.innerHTML = themeCss;
    } else {
      styleElement.innerHTML = themeCss;
      document.head.appendChild(styleElement);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${theme}`);
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn("Could not save theme to localStorage.", error);
    }
  }, [theme]);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.warn("Could not retrieve theme from localStorage.", error);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
// --- End Theme Management ---


function AppContent() {
  const { locale, setLocale, t } = useLocale();

  const pageTitleKeys: Record<string, TranslationKeys> = {
    '/': 'titleHome',
    '/dashboard': 'titleDashboard',
    '/about': 'titleAbout',
    '/privacy': 'titlePrivacy',
    '/terms': 'titleTerms',
    '/404': 'title404',
  };
  const [page, setPage] = useState<Page>(() => resolveRoute(window.location.pathname).page);

  useEffect(() => {
    const handleLocationChange = () => {
        const route = resolveRoute(window.location.pathname);
        if (route.path !== window.location.pathname) {
            window.history.replaceState({}, '', route.path + window.location.search + window.location.hash);
        }
        setLocale(route.locale);
        setPage(route.page);
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [setLocale]);

  useEffect(() => {
    document.title = t(pageTitleKeys[page]);
  }, [page, t]);

  useEffect(() => {
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    if (page === '/404') {
      document.querySelector('link[rel="canonical"]')?.remove();
      return;
    }
    const canonicalUrl = siteOrigin + localizedPath(locale, page);

    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);

    locales.forEach(lang => {
      const alternateLink = document.createElement('link');
      alternateLink.rel = 'alternate';
      alternateLink.hreflang = lang.code;
      alternateLink.href = siteOrigin + localizedPath(lang.code, page);
      document.head.appendChild(alternateLink);
    });

    const xDefaultLink = document.createElement('link');
    xDefaultLink.rel = 'alternate';
    xDefaultLink.hreflang = 'x-default';
    xDefaultLink.href = siteOrigin + localizedPath('en', page);
    document.head.appendChild(xDefaultLink);

  }, [page, locale]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const anchor = e.target instanceof Element ? e.target.closest('a') : null;

        if (anchor && (!anchor.target || anchor.target === '_self') && !anchor.hasAttribute('download') && anchor.origin === window.location.origin) {
            const route = resolveRoute(anchor.pathname);
            if (route.page !== '/404') {
                e.preventDefault();
                const newPath = route.path + anchor.search + anchor.hash;
                if (newPath !== window.location.pathname + window.location.search + window.location.hash) {
                    window.history.pushState({}, '', newPath);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo(0, 0);
                }
            }
        }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);


  const renderPage = () => {
    switch (page) {
      case '/': return <LandingPage />;
      case '/dashboard': return <DashboardPage />;
      case '/privacy': return <PrivacyPolicy />;
      case '/terms': return <TermsOfService />;
      case '/about': return <AboutUs />;
      case '/404': return <NotFoundPage />;
      default: return <NotFoundPage />;
    }
  };

  return (
    <div className="bg-background text-text-primary min-h-screen font-sans flex flex-col">
      <Header />
      <main className="flex-grow w-full max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
      <Footer />
      <WhatsAppJoin />
      <BackToTopButton />
      <CookieConsentBanner />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <FormStateProvider>
          <GenerationProvider>
            <AppContent />
          </GenerationProvider>
        </FormStateProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

export default App;
