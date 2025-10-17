import React, { useState, useEffect } from 'react';
import { UserData, JobDetails, AdmissionInfo } from './types';
import { generateCoverLetter, analyzeUniversityPage } from './services/geminiService';
import UserInputForm from './components/UserInputForm';
import CoverLetterDisplay from './components/CoverLetterDisplay';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AboutUs from './components/AboutUs';

// New component for displaying saved session
const PreviousSessionDisplay: React.FC<{
  savedData: {
    userData: UserData;
    jobDetails: JobDetails;
    coverLetter: string;
    timestamp?: number;
  };
  onLoad: () => void;
  onClear: () => void;
}> = ({ savedData, onLoad, onClear }) => {
  const { userData, jobDetails, coverLetter, timestamp } = savedData;
  const [isOld, setIsOld] = useState(false);

  useEffect(() => {
    if (timestamp) {
      const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
      const dataAge = Date.now() - timestamp;
      if (dataAge > FIVE_MINUTES_IN_MS) {
        setIsOld(true);
      } else {
        setIsOld(false); // Reset if data gets updated to be fresh
      }
    }
  }, [timestamp]);


  const target = userData.letterType === 'job'
    ? jobDetails.url || 'a previously entered job'
    : userData.universityUrl || 'a previously entered university';
    
  const letterPreview = coverLetter.substring(0, 200) + (coverLetter.length > 200 ? '...' : '');

  return (
    <section aria-labelledby="saved-session-heading" className="bg-slate-800/50 rounded-xl p-6 shadow-2xl border border-slate-700 animate-fade-in">
      <h3 id="saved-session-heading" className="text-xl font-bold text-cyan-300 mb-4">Saved Session Found</h3>
      <div className="bg-slate-900/70 rounded-lg p-4 space-y-4">
        {isOld && (
          <div className="p-3 bg-amber-900/50 border border-amber-700/80 rounded-lg text-amber-200 text-sm flex items-start gap-3" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">This session was saved more than 5 minutes ago and may be outdated.</p>
            </div>
          </div>
        )}
        <p className="text-slate-400">
          You have a previously generated letter for <strong className="text-slate-200">{target}</strong>.
        </p>
        {coverLetter && (
          <blockquote className="border-l-4 border-slate-600 pl-4 italic text-sm text-slate-500 max-h-24 overflow-hidden">
            "{letterPreview}"
          </blockquote>
        )}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button onClick={onClear} className="px-4 py-2 bg-rose-800/60 hover:bg-rose-700/60 rounded-md transition-colors text-sm font-medium text-rose-100">
            Clear Saved Data
          </button>
          <button onClick={onLoad} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors text-sm font-medium">
            Load Session
          </button>
        </div>
      </div>
    </section>
  );
};

const HowItWorks: React.FC = () => (
  <section className="bg-slate-800/30 rounded-xl p-6 shadow-lg border border-slate-700/50 mb-8">
    <h2 className="text-2xl font-bold text-center text-cyan-300 mb-6">How It Works</h2>
    <div className="grid md:grid-cols-3 gap-6 text-center">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/20 text-indigo-300 mb-4 border border-indigo-500/50">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
        <h3 className="font-semibold text-lg text-slate-200">1. Enter Your Details</h3>
        <p className="text-slate-400 text-sm">Provide your information, skills, experience, and details about the job or university program you're applying for.</p>
      </div>
       <div className="flex flex-col items-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/20 text-indigo-300 mb-4 border border-indigo-500/50">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <h3 className="font-semibold text-lg text-slate-200">2. AI-Powered Generation</h3>
        <p className="text-slate-400 text-sm">Our advanced AI analyzes your input and the target role or program to craft a unique, professional, and tailored letter.</p>
      </div>
       <div className="flex flex-col items-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/20 text-indigo-300 mb-4 border border-indigo-500/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </div>
        <h3 className="font-semibold text-lg text-slate-200">3. Edit & Download</h3>
        <p className="text-slate-400 text-sm">Review the generated letter, make any final edits directly in the app, and download it as a PDF, ready to send.</p>
      </div>
    </div>
  </section>
);


type View = 'app' | 'privacy' | 'terms' | 'about';

const App: React.FC = () => {
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

  const [jobDetails, setJobDetails] = useState<JobDetails>({ url: '', screenshot: null });
  const [coverLetter, setCoverLetter] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
  const [foundCourses, setFoundCourses] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string>('');

  const [savedData, setSavedData] = useState<{ 
    userData: UserData; 
    jobDetails: JobDetails; 
    coverLetter: string;
    timestamp: number;
  } | null>(null);

  // State to manage which view is active
  const [view, setView] = useState<View>('app');

  // Effect to handle routing based on URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      switch(hash) {
        case 'privacy':
          setView('privacy');
          break;
        case 'terms':
          setView('terms');
          break;
        case 'about':
          setView('about');
          break;
        default:
          setView('app');
          break;
      }
    };
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Initial check
    handleHashChange();
    
    // Cleanup
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem('ai-letter-gen-userData')) {
        localStorage.removeItem('ai-letter-gen-userData');
        localStorage.removeItem('ai-letter-gen-jobDetails');
        localStorage.removeItem('ai-letter-gen-coverLetter');
      }

      const savedSession = localStorage.getItem('ai-letter-gen-session');
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        if (parsedSession.userData && (parsedSession.coverLetter || parsedSession.userData.name)) {
          setSavedData({
            ...parsedSession,
            userData: { ...parsedSession.userData, resume: null },
          });
        }
      }
    } catch (error) {
      console.error("Error loading saved data from localStorage:", error);
    }
  }, []);
  
  useEffect(() => {
    if (userData.name) {
      try {
        const sessionData = {
          userData: { ...userData, resume: null },
          jobDetails,
          coverLetter,
          timestamp: Date.now(),
        };
        localStorage.setItem('ai-letter-gen-session', JSON.stringify(sessionData));
        setSavedData(sessionData);
      } catch (error) {
        console.error("Error saving session to localStorage:", error);
      }
    }
  }, [userData, jobDetails, coverLetter]);
  
  const handleLoadSavedData = () => {
    if (savedData) {
      setUserData(savedData.userData);
      setJobDetails(savedData.jobDetails);
      setCoverLetter(savedData.coverLetter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearSavedData = () => {
    localStorage.removeItem('ai-letter-gen-session');
    setSavedData(null);
  };

  const handleGenerateLetter = async () => {
    setIsLoading(true);
    setError('');
    setCoverLetter('');
    try {
      const letter = await generateCoverLetter(userData, jobDetails);
      setCoverLetter(letter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!userData.universityUrl) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    setAdmissionInfo(null);
    setFoundCourses([]);
    try {
      const result = await analyzeUniversityPage(userData.universityUrl, userData.courseName, userData.universityAnalysisInstruction);
      if (result.details) {
        setAdmissionInfo(result.details);
      }
      if (result.courses && result.courses.length > 0) {
        setFoundCourses(result.courses);
        if (!userData.courseName && result.courses[0]) {
            setUserData(prev => ({ ...prev, courseName: result.courses[0]}));
        }
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze URL.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderView = () => {
    switch(view) {
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      case 'about':
        return <AboutUs />;
      case 'app':
      default:
        return (
          <>
            <HowItWorks />
            <main className="flex flex-col gap-8">
              {/* TODO: Add manual AdSense ad units here if needed, e.g., between sections */}
              <div className="bg-slate-800/50 rounded-xl p-6 shadow-2xl border border-slate-700">
                <UserInputForm 
                  userData={userData}
                  setUserData={setUserData}
                  jobDetails={jobDetails}
                  setJobDetails={setJobDetails}
                  onSubmit={handleGenerateLetter}
                  isLoading={isLoading}
                  onAnalyzeUrl={handleAnalyzeUrl}
                  isAnalyzing={isAnalyzing}
                  analysisError={analysisError}
                  admissionInfo={admissionInfo}
                  foundCourses={foundCourses}
                />
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 shadow-2xl border border-slate-700">
                 <CoverLetterDisplay 
                  coverLetter={coverLetter}
                  setCoverLetter={setCoverLetter}
                  isLoading={isLoading}
                  error={error}
                />
              </div>

              {savedData && (
                <PreviousSessionDisplay
                  savedData={savedData}
                  onLoad={handleLoadSavedData}
                  onClear={handleClearSavedData}
                />
              )}
            </main>
          </>
        );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
             <a href="#" aria-label="Back to main page">{/* Link to reset hash */}
              AI Professional Letter Generator
             </a>
          </h1>
          <p className="text-slate-400 text-lg">
            Craft tailored letters for job applications or university admissions.
          </p>
        </header>

        {renderView()}

        <footer className="text-center mt-12 text-slate-500">
          <div className="flex justify-center gap-4 mb-2">
            <a href="#/about" className="hover:text-slate-300 transition-colors text-sm">About Us</a>
            <a href="#/privacy" className="hover:text-slate-300 transition-colors text-sm">Privacy Policy</a>
            <a href="#/terms" className="hover:text-slate-300 transition-colors text-sm">Terms of Service</a>
          </div>
          <p>Powered by <b><a href="https://www.linkedin.com/in/bilalahmeddev/" title="Go to my LinkedIn Profile" target="_blank" rel="noopener noreferrer">Bilal Ahmed</a></b></p>
        </footer>
      </div>
    </div>
  );
};

export default App;
