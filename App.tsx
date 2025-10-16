import React, { useState } from 'react';
import { UserData, JobDetails, AdmissionInfo } from './types';
import { generateCoverLetter, analyzeUniversityPage } from './services/geminiService';
import UserInputForm from './components/UserInputForm';
import CoverLetterDisplay from './components/CoverLetterDisplay';

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
  });
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    url: '',
    screenshot: null,
  });
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // State for university URL analysis
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
  const [foundCourses, setFoundCourses] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string>('');


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
      const result = await analyzeUniversityPage(userData.universityUrl, userData.courseName);
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
        </main>

        <footer className="text-center mt-12 text-slate-500">
          <p>Powered by <b>Bilal Ahmed</b></p>
        </footer>
      </div>
    </div>
  );
};

export default App;