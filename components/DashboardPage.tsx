import React, { useRef, useEffect, useState } from 'react';
import { useFormState } from '../contexts/FormStateContext';
import { useGeneration } from '../contexts/GenerationContext';
import { useLocale } from '../contexts/LocaleContext';
import { generateCoverLetterUnified, extractKeywordsFromJobUnified, analyzeUniversityPageUnified } from '../services/llms';
import * as storageService from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { getFriendlyErrorMessage } from '../services/errorService';
import { SavedSession, UserData, JobDetails } from '../types';
import WorkspaceLayout from './WorkspaceLayout';
import WizardContainer from './wizard/WizardContainer';
import CoverLetterDisplay from './CoverLetterDisplay';
import SavedLettersDisplay from './SavedLettersDisplay';
import InfoIcon from './icons/InfoIcon';
import XIcon from './icons/XIcon';

const DashboardPage: React.FC = () => {
  const { userData, setUserData, jobDetails, setJobDetails, setCurrentStep } = useFormState();
  const {
    coverLetter, setCoverLetter,
    isLoading, setIsLoading,
    error, setError,
    isAnalyzing, setIsAnalyzing,
    setAnalysisError, setAdmissionInfo, setFoundCourses, setAnalysisNotes,
    extractedKeywords, setExtractedKeywords,
    isExtractingKeywords, setIsExtractingKeywords, setKeywordError
  } = useGeneration();
  const { t } = useLocale();
  const isMounted = useRef(true);

  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [showStorageWarning, setShowStorageWarning] = useState(true);

  useEffect(() => {
    isMounted.current = true;
    setSavedSessions(storageService.getSavedSessions());
    return () => { isMounted.current = false; };
  }, []);

  const handleSubmit = async () => {
    trackEvent({ name: 'form_submit', params: { letter_type: userData.letterType } });
    setIsLoading(true);
    setError(null);
    setCoverLetter('');
    try {
      const keywordsString = extractedKeywords.map(k => k.keyword).join(', ');
      const letter = await generateCoverLetterUnified(userData, jobDetails, keywordsString);
      if (!isMounted.current) return;
      setCoverLetter(letter);
      const updatedSessions = storageService.saveSession(userData, jobDetails, letter);
      setSavedSessions(updatedSessions);
      trackEvent({ name: 'generate_letter_success', params: { letter_type: userData.letterType, document_type: userData.documentType } });
    } catch (e: any) {
      if (!isMounted.current) return;
      const friendlyError = getFriendlyErrorMessage(e);
      setError(friendlyError);
      trackEvent({ name: 'generate_letter_failure', params: { letter_type: userData.letterType, error_message: friendlyError.message } });
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleAnalyzeUrl = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAdmissionInfo(null);
    setFoundCourses([]);
    setAnalysisNotes('');
    try {
      const result = await analyzeUniversityPageUnified(userData.universityUrl, userData.courseName, userData.universityAnalysisInstruction);
      if (!isMounted.current) return;
      setAdmissionInfo(result.details);
      setFoundCourses(result.courses);
      if (result.notes) setAnalysisNotes(result.notes);
      trackEvent({ name: 'analyze_url_success', params: {} });
    } catch (e: any) {
      if (!isMounted.current) return;
      const friendlyError = getFriendlyErrorMessage(e);
      setAnalysisError(friendlyError);
      trackEvent({ name: 'analyze_url_failure', params: { error_message: friendlyError.message } });
    } finally {
      if (isMounted.current) setIsAnalyzing(false);
    }
  };

  const handleExtractKeywords = async () => {
    if (!jobDetails.url && !jobDetails.screenshot) return;
    setIsExtractingKeywords(true);
    setKeywordError(null);
    setExtractedKeywords([]);
    try {
      const keywords = await extractKeywordsFromJobUnified(jobDetails);
      if (!isMounted.current) return;
      setExtractedKeywords(keywords);
      trackEvent({ name: 'extract_keywords_success', params: {} });
    } catch (e: any) {
      if (!isMounted.current) return;
      const friendlyError = getFriendlyErrorMessage(e);
      setKeywordError(friendlyError);
      trackEvent({ name: 'extract_keywords_failure', params: { error_message: friendlyError.message } });
    } finally {
      if (isMounted.current) setIsExtractingKeywords(false);
    }
  };

  const handleRestoreSession = (session: SavedSession) => {
    const { structuredUserData, coverLetter } = session;
    const { step1, step2, step3, step4 } = structuredUserData;

    const restoredUserData: UserData = {
      letterType: step1.letterType,
      name: step1.name,
      skills: step2.skills,
      experience: step2.experience,
      resume: null,
      universityUrl: step3.universityDetails.url,
      courseName: step3.universityDetails.courseName,
      universityAnalysisInstruction: step3.universityDetails.analysisInstruction,
      tone: step4.tone,
      language: step4.language,
      documentType: step4.documentType,
      customInstruction: step4.customInstruction,
      headerInfo: step4.headerInfo,
      footerInfo: step4.footerInfo,
    };

    setUserData(restoredUserData);
    setJobDetails(step3.jobDetails);
    setCoverLetter(coverLetter);
    setCurrentStep(1);

    trackEvent({ name: 'restore_session', params: {} });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveSession = (id: number) => {
    const updatedSessions = storageService.removeSession(id);
    setSavedSessions(updatedSessions);
  };

  const wizardPanel = (
    <>
        {showStorageWarning && (
          <div className="bg-amber-900/50 border border-amber-700 text-amber-300 text-sm rounded-lg p-4 flex justify-between items-start gap-4 mb-6">
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
        <WizardContainer 
            onSubmit={handleSubmit}
            onAnalyzeUrl={handleAnalyzeUrl}
            onExtractKeywords={handleExtractKeywords}
        />
    </>
  );

  const displayPanel = (
      <div id="cover-letter-display" className="bg-card/50 p-4 sm:p-6 rounded-lg shadow-lg h-full">
        <CoverLetterDisplay
          coverLetter={coverLetter}
          setCoverLetter={setCoverLetter}
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit}
          userData={userData}
          jobDetails={jobDetails}
        />
      </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
        <WorkspaceLayout leftPane={wizardPanel} rightPane={displayPanel} />
        
        <SavedLettersDisplay
            sessions={savedSessions}
            onRestore={handleRestoreSession}
            onRemove={handleRemoveSession}
        />
    </div>
  );
};

export default DashboardPage;
