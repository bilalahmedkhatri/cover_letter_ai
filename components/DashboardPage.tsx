import React, { useRef, useEffect, useState } from 'react';
import { useFormState } from '../contexts/FormStateContext';
import { useGeneration } from '../contexts/GenerationContext';
import { useLocale } from '../contexts/LocaleContext';
import * as storageService from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { getFriendlyErrorMessage } from '../services/errorService';
import { SavedSession, UserData, JobDetails } from '../types';
import WorkspaceLayout from './WorkspaceLayout';
import WizardContainer from './wizard/WizardContainer';
import CoverLetterDisplay from './CoverLetterDisplay';
import SavedLettersDisplay from './SavedLettersDisplay';
import { interfaceCopy } from '../services/interfaceCopy';
import BillingPanel from './billing/BillingPanel';

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
  const { t, locale } = useLocale();
  const copy = interfaceCopy(locale);
  const isMounted = useRef(true);

  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

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
      const { generateCoverLetterUnified } = await import('../services/llms');
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
      const { analyzeUniversityPageUnified } = await import('../services/llms');
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
      const { extractKeywordsFromJobUnified } = await import('../services/llms');
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
        <WizardContainer 
            onSubmit={handleSubmit}
            onAnalyzeUrl={handleAnalyzeUrl}
            onExtractKeywords={handleExtractKeywords}
        />
    </>
  );

  const displayPanel = (
      <div id="cover-letter-display" className="letter-preview border border-border rounded-xl bg-card h-full">
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
    <div className="workspace space-y-7">
        <section className="space-y-2">
          <h1 className="editorial-title workspace-title">{copy.workspace}</h1>
          <p className="text-text-secondary">{copy.workspaceIntro}</p>
        </section>
        <WorkspaceLayout leftPane={wizardPanel} rightPane={displayPanel} />
        <BillingPanel compact />
        
        <p className="text-xs leading-relaxed text-text-muted">{copy.localSave}</p>
        <SavedLettersDisplay
            sessions={savedSessions}
            onRestore={handleRestoreSession}
            onRemove={handleRemoveSession}
        />
    </div>
  );
};

export default DashboardPage;
