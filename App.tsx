// Fix: Replaced placeholder content with a functional App component to structure the application, manage state, and handle logic.
import React, { useState, useEffect } from 'react';
import { UserData, JobDetails, AdmissionInfo, SavedSession } from './types';
import { generateCoverLetter, analyzeUniversityPage } from './services/geminiService';
import * as storageService from './services/storageService';
import UserInputForm from './components/UserInputForm';
import CoverLetterDisplay from './components/CoverLetterDisplay';
import SavedLettersDisplay from './components/SavedLettersDisplay';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AboutUs from './components/AboutUs';

type Page = '/' | '/privacy' | '/terms' | '/about';

const pagesInfo = {
  '/': { title: 'AI Professional Letter Generator' },
  '/about': { title: 'About Us | AI Professional Letter Generator' },
  '/privacy': { title: 'Privacy Policy | AI Professional Letter Generator' },
  '/terms': { title: 'Terms of Service | AI Professional Letter Generator' },
};


function App() {
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
    try {
      const result = await analyzeUniversityPage(
        userData.universityUrl,
        userData.courseName,
        userData.universityAnalysisInstruction
      );
      setAdmissionInfo(result.details);
      setFoundCourses(result.courses);
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
      return (
         <div className="space-y-8">
          <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
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
            />
          </div>
          <div id="cover-letter-display" className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
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
       <div className="bg-slate-800/50 p-8 rounded-lg shadow-lg">
        {content}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 text-slate-300 min-h-screen font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <a href="/" className="text-2xl font-bold text-cyan-400">AI Letter Generator</a>
                <nav className="flex space-x-4 text-sm font-medium">
                    <a href="/about" className="text-slate-400 hover:text-cyan-400 transition-colors">About</a>
                    <a href="/privacy" className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy</a>
                    <a href="/terms" className="text-slate-400 hover:text-cyan-400 transition-colors">Terms</a>
                </nav>
            </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;