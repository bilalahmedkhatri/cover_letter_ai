import React, { useState } from 'react';
import UserInputForm from './components/UserInputForm';
import CoverLetterDisplay from './components/CoverLetterDisplay';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AboutUs from './components/AboutUs';
import { UserData, JobDetails, AdmissionInfo } from './types';
import { generateCoverLetter, analyzeUniversityPage } from './services/geminiService';


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
    const [jobDetails, setJobDetails] = useState<JobDetails>({
        url: '',
        screenshot: null,
    });
    const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
    const [foundCourses, setFoundCourses] = useState<string[]>([]);
    const [coverLetter, setCoverLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [analysisError, setAnalysisError] = useState('');

    const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'about' | null>(null);

    const handleAnalyzeUrl = async () => {
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
            }
        } catch (err) {
            if (err instanceof Error) {
                setAnalysisError(err.message);
            } else {
                setAnalysisError('An unknown error occurred during analysis.');
            }
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');
        setCoverLetter('');
        try {
            const letter = await generateCoverLetter(userData, jobDetails);
            setCoverLetter(letter);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while generating the letter.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderModal = () => {
        if (!activeModal) return null;

        const ModalContent = {
            privacy: PrivacyPolicy,
            terms: TermsOfService,
            about: AboutUs,
        }[activeModal];

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-300">
                    <div className="p-8 relative">
                         <h2 className="text-2xl font-bold text-cyan-300 mb-4 sr-only">{activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}</h2>
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl leading-none font-bold" aria-label="Close modal">&times;</button>
                        <ModalContent />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen font-sans">
            <main className="container mx-auto px-4 py-8">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-indigo-500 text-transparent bg-clip-text pb-2">
                        AI Professional Letter Generator
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
                        Craft the perfect cover letter or university admission letter in seconds. Fill in your details, and let our AI-powered advisor do the rest.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-slate-800/50 p-6 md:p-8 rounded-xl border border-slate-700">
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
                    <div className="bg-slate-800/50 p-6 md:p-8 rounded-xl border border-slate-700 flex flex-col">
                       <CoverLetterDisplay
                            coverLetter={coverLetter}
                            setCoverLetter={setCoverLetter}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>
                </div>
            </main>
            <footer className="text-center py-6 mt-12 border-t border-slate-800 text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} AI Letter Generator. All rights reserved.</p>
                <div className="flex justify-center gap-4 mt-2">
                    <button onClick={() => setActiveModal('about')} className="hover:text-cyan-400 transition-colors">About Us</button>
                    <button onClick={() => setActiveModal('privacy')} className="hover:text-cyan-400 transition-colors">Privacy Policy</button>
                    <button onClick={() => setActiveModal('terms')} className="hover:text-cyan-400 transition-colors">Terms of Service</button>
                </div>
            </footer>
            {renderModal()}
        </div>
    );
};

export default App;
