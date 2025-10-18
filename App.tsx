// Fix: Replaced placeholder content with a functional App component to structure the application, manage state, and handle logic.
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserData, JobDetails, AdmissionInfo, SavedSession } from './types';
import { generateCoverLetter, analyzeUniversityPage } from './services/geminiService';
import * as storageService from './services/storageService';
import UserInputForm from './components/UserInputForm';
import CoverLetterDisplay from './components/CoverLetterDisplay';
import SavedLettersDisplay from './components/SavedLettersDisplay';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AboutUs from './components/AboutUs';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { themes } from './theme';

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
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme);
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


type Page = '/' | '/dashboard' | '/privacy' | '/terms' | '/about';

const pagesInfo = {
  '/': { title: 'AI Professional Letter Generator | Home' },
  '/dashboard': { title: 'Generator Dashboard | AI Professional Letter Generator' },
  '/about': { title: 'About Us | AI Professional Letter Generator' },
  '/privacy': { title: 'Privacy Policy | AI Professional Letter Generator' },
  '/terms': { title: 'Terms of Service | AI Professional Letter Generator' },
};


function AppContent() {
  // State for current page/route
  const [page, setPage] = useState<Page>('/');

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
  });
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    url: '',
    screenshot: null,
  });

  // State for letter generation
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for university URL analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
  const [foundCourses, setFoundCourses] = useState<string[]>([]);
  const [analysisNotes, setAnalysisNotes] = useState('');

  // State for saved letters
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Effect for loading saved letters on mount
  useEffect(() => {
    setSavedSessions(storageService.getSavedSessions());
  }, []);

  // Effect for handling routing
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname as Page;
      const newPage = pagesInfo[path] ? path : '/';
      setPage(newPage);
      document.title = pagesInfo[newPage].title;
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Handle initial load

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);
  
  // Effect for SPA link handling
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.target !== '_blank' && anchor.origin === window.location.origin) {
        const path = anchor.pathname as Page;
        if (pagesInfo[path] && path !== window.location.pathname) {
          e.preventDefault();
          window.history.pushState({}, '', path);
          setPage(path);
          document.title = pagesInfo[path].title;
          window.scrollTo(0, 0);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);


  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setCoverLetter('');
    try {
      const letter = await generateCoverLetter(userData, jobDetails);
      setCoverLetter(letter);
      const updatedSessions = storageService.saveSession(userData, jobDetails, letter);
      setSavedSessions(updatedSessions);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeUrl = async () => {
    setIsAnalyzing(true);
    setAnalysisError('');
    setAdmissionInfo(null);
    setFoundCourses([]);
    setAnalysisNotes('');
    try {
      const result = await analyzeUniversityPage(
        userData.universityUrl,
        userData.courseName,
        userData.universityAnalysisInstruction
      );
      setAdmissionInfo(result.details);
      setFoundCourses(result.courses);
      if (result.notes) {
        setAnalysisNotes(result.notes);
      }
    } catch (e) {
      if (e instanceof Error) {
        setAnalysisError(e.message);
      } else {
        setAnalysisError('An unexpected error occurred during analysis.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestoreSession = (session: SavedSession) => {
    setUserData(session.userData);
    setJobDetails(session.jobDetails);
    setCoverLetter(session.coverLetter);
    // Scroll to the top of the form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveSession = (id: number) => {
    const updatedSessions = storageService.removeSession(id);
    setSavedSessions(updatedSessions);
  };
  
  const renderPage = () => {
    if (page === '/') {
        return <LandingPage />;
    }
    
    if (page === '/dashboard') {
      return (
         <div className="space-y-8">
          <div className="bg-card/50 p-6 rounded-lg shadow-lg">
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
            />
          </div>
          <div id="cover-letter-display" className="bg-card/50 p-6 rounded-lg shadow-lg">
            <CoverLetterDisplay
              coverLetter={coverLetter}
              setCoverLetter={setCoverLetter}
              isLoading={isLoading}
              error={error}
            />
          </div>
          <SavedLettersDisplay
            sessions={savedSessions}
            onRestore={handleRestoreSession}
            onRemove={handleRemoveSession}
          />
        </div>
      );
    }

    let content;
    if (page === '/privacy') content = <PrivacyPolicy />;
    if (page === '/terms') content = <TermsOfService />;
    if (page === '/about') content = <AboutUs />;

    return (
       <div className="bg-card/50 p-8 rounded-lg shadow-lg">
        {content}
      </div>
    );
  };

  return (
    <div className="bg-background text-text-primary min-h-screen font-sans flex flex-col">
      <Header />

      <main className="flex-grow w-full max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>

      <Footer />
    </div>
  );
}


function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;