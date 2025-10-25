// Fix: Replaced placeholder content with a functional App component to structure the application, manage state, and handle logic.
import React, { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { UserData, JobDetails, AdmissionInfo, SavedSession, Locale } from './types';
import { generateCoverLetter, analyzeUniversityPage, extractKeywordsFromJob } from './services/geminiService';
import * as storageService from './services/storageService';
import { getFriendlyErrorMessage, FriendlyError } from './services/errorService';
import UserInputForm from './components/UserInputForm';
import CoverLetterDisplay from './components/CoverLetterDisplay';
import SavedLettersDisplay from './components/SavedLettersDisplay';
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
import InfoIcon from './components/icons/InfoIcon';
import XIcon from './components/icons/XIcon';
import { TranslationKeys } from './services/translations';

// --- Theme Management ---
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to generate the CSS string for themes from the theme object
const generateThemeCss = (themes: Record<string, Record<string, string>>): string => {
  let css = '';
  const defaultThemeName = 'dark';
  const defaultTheme = themes[defaultThemeName];

  // Set default theme variables on :root and its specific class
  css += `:root, .theme-${defaultThemeName} {\n`;
  for (const property in defaultTheme) {
    css += `  ${property}: ${defaultTheme[property]};\n`;
  }
  css += '}\n\n';

  // Set other theme-specific overrides
  for (const themeName in themes) {
    if (themeName === defaultThemeName) continue; // Already handled

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

  // This effect runs once on mount to inject the theme styles from theme.ts
  // into the document head. This makes the theme definitions available
  // globally as CSS variables.
  useEffect(() => {
    const themeCss = generateThemeCss(themes);
    const styleElement = document.createElement('style');
    styleElement.id = 'app-theme-styles'; // Use an ID to prevent duplicates on hot-reloads

    // Ensure we don't add it if it's already there
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


// Custom hook to track mounted state, preventing state updates on unmounted components
const useIsMounted = () => {
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  return isMountedRef;
};


function AppContent() {
  const { locale, setLocale, t } = useLocale();
  const isMounted = useIsMounted();

  const pageTitleKeys: Record<string, TranslationKeys> = {
    '/': 'titleHome',
    '/dashboard': 'titleDashboard',
    '/about': 'titleAbout',
    '/privacy': 'titlePrivacy',
    '/terms': 'titleTerms',
    '/404': 'title404',
  };
  const validPages = Object.keys(pageTitleKeys);

  // State for current page/route
  const [page, setPage] = useState<string>('/');

  // State for user input
  const [userData, setUserData] = useState<UserData>({
    name: '',
    skills: '',
    experience: '',
    resume: null,
    language: 'English',
    customInstruction: '',
    letterType: 'job',
    documentType: 'letter',
    headerInfo: '',
    footerInfo: '',
    universityUrl: '',
    courseName: '',
    universityAnalysisInstruction: '',
    tone: 'Professional',
  });
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    url: '',
    screenshot: null,
  });

  // State for letter generation
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);

  // State for university URL analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<FriendlyError | null>(null);
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
  const [foundCourses, setFoundCourses] = useState<string[]>([]);
  const [analysisNotes, setAnalysisNotes] = useState('');

  // State for keyword extraction
  const [extractedKeywords, setExtractedKeywords] = useState<string>('');
  const [isExtractingKeywords, setIsExtractingKeywords] = useState(false);
  const [keywordError, setKeywordError] = useState<FriendlyError | null>(null);

  // State for saved letters
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // State for UI elements
  const [showStorageWarning, setShowStorageWarning] = useState(true);

  // Effect for loading saved letters on mount
  useEffect(() => {
    setSavedSessions(storageService.getSavedSessions());
  }, []);

  // Effect for handling routing based on URL path
  useEffect(() => {
    const handleLocationChange = () => {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const potentialLocale = pathParts[0] as Locale;
        const isLocaleInPath = locales.some(l => l.code === potentialLocale);

        if (isLocaleInPath) {
            // Locale is in path, update context and page
            if (locale !== potentialLocale) {
                setLocale(potentialLocale);
            }

            let pagePath = '/' + pathParts.slice(1).join('/');
            if (pagePath.length > 1 && pagePath.endsWith('/')) {
              pagePath = pagePath.slice(0, -1);
            }
            if(pathParts.length === 1) pagePath = '/';

            const newPage = validPages.includes(pagePath) ? pagePath : '/404';
            setPage(newPage);
        } else {
            // No locale in path, we must redirect.
            let savedLocale: Locale | null = null;
            try {
              savedLocale = localStorage.getItem('locale') as Locale;
            } catch (error) {
              console.warn("Could not access localStorage for locale.", error);
            }

            const browserLang = navigator.language.split('-')[0] as Locale;
            const targetLocale = 
                (savedLocale && locales.some(l => l.code === savedLocale)) ? savedLocale 
                : (locales.some(l => l.code === browserLang) ? browserLang : 'en');
            
            const newPath = `/${targetLocale}${window.location.pathname}`.replace('//', '/');
            
            window.history.replaceState({}, '', newPath);
            // Call handler again to process the new URL. This is safe because the next time isLocaleInPath will be true.
            handleLocationChange();
        }
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Handle initial load

    return () => window.removeEventListener('popstate', handleLocationChange);
}, []); // This effect should run only once to set up the router.


  // Update document title when page or language changes
  useEffect(() => {
    document.title = t(pageTitleKeys[page]);
  }, [page, t]);

  // Effect for SPA link handling
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest('a');

        if (anchor && anchor.target !== '_blank' && anchor.origin === window.location.origin) {
            const path = anchor.pathname;
            // Check if the link is a valid internal route.
            if (validPages.includes(path)) {
                e.preventDefault();
                const newPath = `/${locale}${path === '/' ? '' : path}`;
                // Only push to history if the path is different.
                if (newPath !== window.location.pathname) {
                    window.history.pushState({}, '', newPath);
                    // Manually dispatch popstate to trigger the router
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo(0, 0);
                }
            }
        }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
}, [locale]); // Re-bind the event listener when the locale changes.


  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setCoverLetter('');
    try {
      const letter = await generateCoverLetter(userData, jobDetails, extractedKeywords);
      if (!isMounted.current) return;
      setCoverLetter(letter);
      const updatedSessions = storageService.saveSession(userData, jobDetails, letter);
      setSavedSessions(updatedSessions);
    } catch (e) {
      if (!isMounted.current) return;
      setError(getFriendlyErrorMessage(e));
    } finally {
      if (!isMounted.current) return;
      setIsLoading(false);
    }
  };

  const handleAnalyzeUrl = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAdmissionInfo(null);
    setFoundCourses([]);
    setAnalysisNotes('');
    try {
      const result = await analyzeUniversityPage(
        userData.universityUrl,
        userData.courseName,
        userData.universityAnalysisInstruction
      );
      if (!isMounted.current) return;
      setAdmissionInfo(result.details);
      setFoundCourses(result.courses);
      if (result.notes) {
        setAnalysisNotes(result.notes);
      }
    } catch (e) {
      if (!isMounted.current) return;
      setAnalysisError(getFriendlyErrorMessage(e));
    } finally {
      if (!isMounted.current) return;
      setIsAnalyzing(false);
    }
  };

  const handleExtractKeywords = async () => {
    if (!jobDetails.url && !jobDetails.screenshot) return;
    setIsExtractingKeywords(true);
    setKeywordError(null);
    setExtractedKeywords('');
    try {
      const keywords = await extractKeywordsFromJob(jobDetails);
      if (!isMounted.current) return;
      setExtractedKeywords(keywords);
    } catch (e) {
      if (!isMounted.current) return;
      setKeywordError(getFriendlyErrorMessage(e));
    } finally {
      if (!isMounted.current) return;
      setIsExtractingKeywords(false);
    }
  };


  const handleRestoreSession = (session: SavedSession) => {
    const { structuredUserData, coverLetter } = session;
    const { step1, step2, step3, step4 } = structuredUserData;

    // Flatten the structured data back into the app's state format
    const restoredUserData: UserData = {
      // Step 1
      letterType: step1.letterType,
      name: step1.name,
      // Step 2
      skills: step2.skills,
      experience: step2.experience,
      resume: null, // Resume is not saved in localStorage
      // Step 3 (University)
      universityUrl: step3.universityDetails.url,
      courseName: step3.universityDetails.courseName,
      universityAnalysisInstruction: step3.universityDetails.analysisInstruction,
      // Step 4
      tone: step4.tone,
      language: step4.language,
      documentType: step4.documentType,
      customInstruction: step4.customInstruction,
      headerInfo: step4.headerInfo,
      footerInfo: step4.footerInfo,
    };

    setUserData(restoredUserData);
    setJobDetails(step3.jobDetails); // Step 3 (Job)
    setCoverLetter(coverLetter);

    // Scroll to the top of the form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleRemoveSession = (id: number) => {
    const updatedSessions = storageService.removeSession(id);
    setSavedSessions(updatedSessions);
  };

  const renderPage = () => {
    switch (page) {
      case '/':
        return <LandingPage />;

      case '/dashboard':
        return (
          <div className="space-y-8">
            {showStorageWarning && (
              <div className="bg-amber-900/50 border border-amber-700 text-amber-300 text-sm rounded-lg p-4 flex justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">{t('storageWarningTitle')}</h4>
                    <p className="leading-relaxed mt-1">{t('storageWarningBody')}</p>
                  </div>
                </div>
                <button onClick={() => setShowStorageWarning(false)} className="text-amber-200 hover:text-white" aria-label={t('storageWarningDismiss')}>
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="bg-card/50 p-4 sm:p-6 rounded-lg shadow-lg">
              <UserInputForm
                userData={userData}
                setUserData={setUserData}
                jobDetails={jobDetails}
                setJobDetails={setJobDetails}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                onAnalyzeUrl={handleAnalyzeUrl}
                isAnalyzing={isAnalyzing}
                analysisError={analysisError}
                admissionInfo={admissionInfo}
                foundCourses={foundCourses}
                analysisNotes={analysisNotes}
                onExtractKeywords={handleExtractKeywords}
                isExtractingKeywords={isExtractingKeywords}
                keywordError={keywordError}
                extractedKeywords={extractedKeywords}
                setExtractedKeywords={setExtractedKeywords}
              />
            </div>
            <div id="cover-letter-display" className="bg-card/50 p-4 sm:p-6 rounded-lg shadow-lg">
              <CoverLetterDisplay
                coverLetter={coverLetter}
                setCoverLetter={setCoverLetter}
                isLoading={isLoading}
                error={error}
                onSubmit={handleSubmit}
              />
            </div>
            <SavedLettersDisplay
              sessions={savedSessions}
              onRestore={handleRestoreSession}
              onRemove={handleRemoveSession}
            />
          </div>
        );

      case '/privacy':
        return (
          <PrivacyPolicy />
        );

      case '/terms':
        return (
          <TermsOfService />
        );

      case '/about':
        return (
          <AboutUs />
        );

      case '/404':
        return <NotFoundPage />;

      default:
        // Fallback for any unknown route, though routing effect should handle it.
        return <NotFoundPage />;
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
        <AppContent />
      </LocaleProvider>
    </ThemeProvider>
  );
}

export default App;