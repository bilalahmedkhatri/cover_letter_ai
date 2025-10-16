import React, { useState, useEffect } from 'react';
import { UserData, JobDetails, AdmissionInfo } from './types';
import { generateCoverLetter, analyzeUniversityPage } from './services/geminiService';
import UserInputForm from './components/UserInputForm';
import CoverLetterDisplay from './components/CoverLetterDisplay';

// New component for displaying saved session
const PreviousSessionDisplay: React.FC<{
  savedData: {
    userData: UserData;
    jobDetails: JobDetails;
    coverLetter: string;
  };
  onLoad: () => void;
  onClear: () => void;
}> = ({ savedData, onLoad, onClear }) => {
  const { userData, jobDetails, coverLetter } = savedData;

  const target = userData.letterType === 'job'
    ? jobDetails.url || 'a previously entered job'
    : userData.universityUrl || 'a previously entered university';
    
  const letterPreview = coverLetter.substring(0, 200) + (coverLetter.length > 200 ? '...' : '');

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 shadow-2xl border border-slate-700 animate-fade-in">
      <h3 className="text-xl font-bold text-cyan-300 mb-4">Saved Session Found</h3>
      <div className="bg-slate-900/70 rounded-lg p-4 space-y-3">
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
    </div>
  );
};


const App: React.FC = () => {
  // Initialize state to be empty, not from localStorage
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

  // State for university URL analysis
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
  const [foundCourses, setFoundCourses] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string>('');

  // New state to hold data loaded from storage
  const [savedData, setSavedData] = useState<{ userData: UserData; jobDetails: JobDetails; coverLetter: string } | null>(null);

  // Effect to load data from localStorage ONCE on mount
  useEffect(() => {
    try {
      const savedUserData = localStorage.getItem('ai-letter-gen-userData');
      const savedJobDetails = localStorage.getItem('ai-letter-gen-jobDetails');
      const savedCoverLetter = localStorage.getItem('ai-letter-gen-coverLetter');

      if (savedUserData && savedJobDetails && (savedCoverLetter || JSON.parse(savedUserData).name)) {
        setSavedData({
          userData: { ...JSON.parse(savedUserData), resume: null }, // Resume cannot be persisted
          jobDetails: JSON.parse(savedJobDetails),
          coverLetter: savedCoverLetter || ''
        });
      }
    } catch (error) {
      console.error("Error loading saved data from localStorage:", error);
    }
  }, []);

  // Effect to save user data to localStorage whenever it changes
  useEffect(() => {
    try {
      const dataToStore = { ...userData, resume: null }; // Never store the File object
      localStorage.setItem('ai-letter-gen-userData', JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Error saving user data to localStorage:", error);
    }
  }, [userData]);

  // Effect to save job details to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai-letter-gen-jobDetails', JSON.stringify(jobDetails));
    } catch (error) {
      console.error("Error saving job details to localStorage:", error);
    }
  }, [jobDetails]);

  // Effect to save the generated cover letter
  useEffect(() => {
    // Only save if there's a cover letter to prevent overwriting with an empty string on load
    if (coverLetter) {
      localStorage.setItem('ai-letter-gen-coverLetter', coverLetter);
    }
  }, [coverLetter]);
  
  const handleLoadSavedData = () => {
    if (savedData) {
      setUserData(savedData.userData);
      setJobDetails(savedData.jobDetails);
      setCoverLetter(savedData.coverLetter);
      // Optional: scroll to the top of the form after loading
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearSavedData = () => {
    localStorage.removeItem('ai-letter-gen-userData');
    localStorage.removeItem('ai-letter-gen-jobDetails');
    localStorage.removeItem('ai-letter-gen-coverLetter');
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
        // If no course was selected by user, and we found courses, select the first one by default
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
            AI Professional Letter Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Craft tailored letters for job applications or university admissions.
          </p>
        </header>

        <main className="flex flex-col gap-8">
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

        <footer className="text-center mt-12 text-slate-500">
          <p>Powered by <b><a href="https://www.linkedin.com/in/bilalahmeddev/" title="Go to my LinkedIn Profile">Bilal Ahmed</a></b></p>
        </footer>
      </div>
    </div>
  );
};

export default App;