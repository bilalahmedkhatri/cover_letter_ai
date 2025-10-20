import React from 'react';
import { UserData, JobDetails, AdmissionInfo } from '../types';
import { FriendlyError } from '../services/errorService';
import { generateAnalysisReportPdf } from '../services/pdfService';
import { useLocale } from '../contexts/LocaleContext';
import SmallLoadingSpinner from './icons/SmallLoadingSpinner';
import InfoIcon from './icons/InfoIcon';
import DownloadIcon from './icons/DownloadIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';


interface UserInputFormProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  jobDetails: JobDetails;
  setJobDetails: React.Dispatch<React.SetStateAction<JobDetails>>;
  onSubmit: () => void;
  isLoading: boolean;
  onAnalyzeUrl: () => void;
  isAnalyzing: boolean;
  analysisError: FriendlyError | null;
  admissionInfo: AdmissionInfo | null;
  foundCourses: string[];
  analysisNotes: string;
  onExtractKeywords: () => void;
  isExtractingKeywords: boolean;
  keywordError: FriendlyError | null;
  extractedKeywords: string;
  setExtractedKeywords: (keywords: string) => void;
}

const UserInputForm: React.FC<UserInputFormProps> = ({
  userData,
  setUserData,
  jobDetails,
  setJobDetails,
  onSubmit,
  isLoading,
  onAnalyzeUrl,
  isAnalyzing,
  analysisError,
  admissionInfo,
  foundCourses,
  analysisNotes,
  onExtractKeywords,
  isExtractingKeywords,
  keywordError,
  extractedKeywords,
  setExtractedKeywords,
}) => {
  const { t } = useLocale();

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'resume') {
        setUserData(prev => ({ ...prev, resume: files[0] }));
      }
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            const base64String = reader.result.split(',')[1];
            setJobDetails(prev => ({ ...prev, screenshot: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleDownloadAnalysisPdf = () => {
    if (!admissionInfo) return;
    generateAnalysisReportPdf(admissionInfo, foundCourses, t);
  };
  
  const renderBulletedText = (text: string) => {
    if (!text || text.toLowerCase() === 'information not found' || text.trim() === '') {
      return <p className="text-text-secondary italic">{t('formInfoNotFound')}</p>;
    }
    const items = text.split('\n').filter(line => line.trim() !== '');
    return (
      <ul className="list-disc list-inside space-y-1 text-text-primary">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    );
  };

  const languages = [
    "English", "Bulgarian", "Hungarian", "Spanish", "French", 
    "Arabic", "Dutch", "Russian", "Portuguese", "Slovak", "Polish"
  ];

  const inputStyle = "w-full bg-input-bg border border-border rounded-md px-3 py-2 text-text-primary placeholder-input-placeholder focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
  const inputFileStyle = "w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/30 cursor-pointer";
  const mainButtonSpinner = <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1 */}
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">{t('formStep1')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">{t('formLetterType')}</label>
            <div className="flex gap-2 rounded-md bg-card-secondary p-1">
              <button type="button" onClick={() => setUserData(p => ({...p, letterType: 'job'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.letterType === 'job' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}>{t('formJobApplication')}</button>
              <button type="button" onClick={() => setUserData(p => ({...p, letterType: 'university'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.letterType === 'university' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}>{t('formUniversityAdmission')}</button>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">{t('formFullName')}</label>
            <input type="text" id="name" name="name" value={userData.name} onChange={handleUserChange} required className={inputStyle} placeholder={t('formFullNamePlaceholder')} />
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">{t('formStep2')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-text-primary mb-2">{t('formSkills')}</label>
            <textarea id="skills" name="skills" value={userData.skills} onChange={handleUserChange} rows={5} className={inputStyle} placeholder={t('formSkillsPlaceholder')}></textarea>
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-text-primary mb-2">{t('formExperience')}</label>
            <textarea id="experience" name="experience" value={userData.experience} onChange={handleUserChange} rows={5} className={inputStyle} placeholder={t('formExperiencePlaceholder')}></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="resume" className="block text-sm font-medium text-text-primary mb-2">{t('formResume')}</label>
            <input type="file" id="resume" name="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" className={inputFileStyle} />
            <p className="text-xs text-text-secondary mt-1">{t('formResumeHint')}</p>
          </div>
        </div>
      </section>
      
      {/* Step 3 */}
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">
            {userData.letterType === 'job' ? t('formStep3Job') : t('formStep3University')}
        </h2>
        {userData.letterType === 'job' ? (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label htmlFor="url" className="block text-sm font-medium text-text-primary mb-2">{t('formJobURL')}</label>
                  <input type="url" id="url" name="url" value={jobDetails.url} onChange={handleJobChange} className={inputStyle} placeholder={t('formJobURLPlaceholder')} />
              </div>
              <div>
                  <label htmlFor="screenshot" className="block text-sm font-medium text-text-primary mb-2">{t('formJobScreenshot')}</label>
                  <input type="file" id="screenshot" name="screenshot" onChange={handleScreenshotChange} accept="image/*" className={inputFileStyle} />
              </div>
            </div>

            {/* NEW KEYWORD EXTRACTION SECTION */}
            <div className="bg-card/50 p-4 rounded-lg border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-text-primary">{t('formKeywordsTitle')}</h3>
                  <p className="text-sm text-text-secondary">{t('formKeywordsDescription')}</p>
                </div>
                <button 
                  type="button" 
                  onClick={onExtractKeywords} 
                  disabled={isExtractingKeywords || (!jobDetails.url && !jobDetails.screenshot)}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExtractingKeywords && <SmallLoadingSpinner />}
                  {isExtractingKeywords ? t('formKeywordsExtracting') : t('formKeywordsExtract')}
                </button>
              </div>

              {keywordError && (
                <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg p-3" role="alert">
                  <p className="font-semibold">{t('formKeywordsError')}</p>
                  <p className="mt-1">{keywordError.message}</p>
                </div>
              )}
              
              {(extractedKeywords || isExtractingKeywords) && !keywordError && (
                <div className="mt-4">
                  <label htmlFor="extractedKeywords" className="block text-sm font-medium text-text-primary mb-2">{t('formKeywordsExtracted')}</label>
                  <textarea
                    id="extractedKeywords"
                    name="extractedKeywords"
                    value={extractedKeywords}
                    onChange={(e) => setExtractedKeywords(e.target.value)}
                    rows={3}
                    className={inputStyle}
                    placeholder={t('formKeywordsPlaceholder')}
                    readOnly={isExtractingKeywords}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="universityUrl" className="block text-sm font-medium text-text-primary mb-2">{t('formUniversityURL')}</label>
                    <input type="url" id="universityUrl" name="universityUrl" value={userData.universityUrl} onChange={handleUserChange} required className={inputStyle} placeholder={t('formUniversityURLPlaceholder')} />
                </div>
                 <div>
                    <label htmlFor="courseName" className="block text-sm font-medium text-text-primary mb-2">{t('formCourseName')}</label>
                    {foundCourses && foundCourses.length > 0 ? (
                      <select
                        id="courseName"
                        name="courseName"
                        value={userData.courseName}
                        onChange={handleUserChange}
                        className={inputStyle}
                        aria-label="Select from courses found on the page"
                      >
                        <option value="">{t('formCourseNameSelect')}</option>
                        {foundCourses.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="courseName"
                        name="courseName"
                        value={userData.courseName}
                        onChange={handleUserChange}
                        className={inputStyle}
                        placeholder={t('formCourseNamePlaceholder')}
                      />
                    )}
                </div>
            </div>
            <div>
                <label htmlFor="universityAnalysisInstruction" className="block text-sm font-medium text-text-primary mb-2">{t('formAnalysisInstructions')}</label>
                <textarea
                    id="universityAnalysisInstruction"
                    name="universityAnalysisInstruction"
                    value={userData.universityAnalysisInstruction}
                    onChange={handleUserChange}
                    rows={3}
                    className={inputStyle}
                    placeholder={t('formAnalysisInstructionsPlaceholder')}
                />
            </div>
            <button type="button" onClick={onAnalyzeUrl} disabled={isAnalyzing || !userData.universityUrl} className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {isAnalyzing && <SmallLoadingSpinner />}
              {isAnalyzing ? t('formAnalyzingButton') : t('formAnalyzeButton')}
            </button>
            {analysisError && (
              <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg p-3" role="alert">
                <p className="font-semibold">{t('formAnalysisFailed')}</p>
                <p className="mt-1">{analysisError.message}</p>
                {analysisError.message.includes("couldn't structure the information") && (
                  <p className="mt-2 text-red-200">
                    <strong>{t('formAnalysisTip')}</strong> {t('formAnalysisTipText')}
                  </p>
                )}
              </div>
            )}
            {analysisNotes && !analysisError && (
              <div className="mt-4 bg-amber-900/50 border border-amber-700 text-amber-300 text-sm rounded-lg p-3 flex items-start gap-3" role="alert">
                <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">{t('formAnalysisNote')}</h4>
                  <p className="leading-relaxed mt-1">{analysisNotes}</p>
                </div>
              </div>
            )}
            {admissionInfo && (
                <div className="mt-4 bg-card/50 p-4 rounded-lg border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg text-accent">{t('formAnalysisResults')}</h3>
                      <button
                        type="button"
                        onClick={handleDownloadAnalysisPdf}
                        className="flex items-center gap-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors text-xs font-medium"
                        aria-label="Download analysis as PDF"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        <span>{t('formDownloadPDF')}</span>
                      </button>
                    </div>
                    <div>
                        <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                           {t('formRequirements')}
                           {admissionInfo.admissionRequirements.sourceUrl && <a href={admissionInfo.admissionRequirements.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong> 
                        {renderBulletedText(admissionInfo.admissionRequirements.text)}
                    </div>
                    <div>
                        <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                            {t('formDeadlines')}
                            {admissionInfo.deadlines.sourceUrl && <a href={admissionInfo.deadlines.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong> 
                        {renderBulletedText(admissionInfo.deadlines.text)}
                    </div>
                    {admissionInfo.scholarships && (
                      <div>
                        <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                            {t('formScholarships')}
                            {admissionInfo.scholarships.sourceUrl && <a href={admissionInfo.scholarships.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong> 
                        {renderBulletedText(admissionInfo.scholarships.text)}
                      </div>
                    )}
                    {admissionInfo.emails && admissionInfo.emails.list.length > 0 && (
                      <div>
                        <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                            {t('formContactEmails')}
                             {admissionInfo.emails.sourceUrl && <a href={admissionInfo.emails.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong>
                        <ul className="list-disc list-inside space-y-1 text-text-primary">
                            {admissionInfo.emails.list.map((email, index) => (
                                <li key={index}>
                                    <a href={`mailto:${email.address}`} className="text-indigo-400 hover:underline">{email.address}</a>
                                    <span className="text-text-secondary text-sm"> ({email.description})</span>
                                </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>
            )}
            {foundCourses.length > 0 && !admissionInfo && (
                <div className="mt-4 bg-card/50 p-4 rounded-lg border border-border">
                    <h3 className="font-semibold text-lg text-accent mb-2">{t('formFoundCourses')}</h3>
                    <p className="text-sm text-text-secondary mb-2">{t('formFoundCoursesHint')}</p>

                    <ul className="list-disc list-inside text-text-primary text-sm">{foundCourses.map(c => <li key={c}>{c}</li>)}</ul>
                </div>
            )}
          </div>
        )}
      </section>

      {/* Step 4 */}
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">{t('formStep4')}</h2>
        <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-text-primary mb-2">{t('formTone')}</label>
                <select
                  id="tone"
                  name="tone"
                  value={userData.tone}
                  onChange={handleUserChange}
                  className={inputStyle}
                >
                  {(['Professional', 'Formal', 'Enthusiastic', 'Concise'] as const).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-text-primary mb-2">{t('formLanguage')}</label>
                <select id="language" name="language" value={userData.language} onChange={handleUserChange} className={inputStyle}>
                  {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">{t('formFormat')}</label>
              <div className="flex gap-2 rounded-md bg-card-secondary p-1">
                  <button type="button" onClick={() => setUserData(p => ({...p, documentType: 'letter'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.documentType === 'letter' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}>{t('formFormalLetter')}</button>
                  <button type="button" onClick={() => setUserData(p => ({...p, documentType: 'email'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.documentType === 'email' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}>{t('formProfessionalEmail')}</button>
              </div>
            </div>
            <div>
              <label htmlFor="customInstruction" className="block text-sm font-medium text-text-primary mb-2">
                {t('formInstructions')}
              </label>
              <textarea
                id="customInstruction"
                name="customInstruction"
                value={userData.customInstruction}
                onChange={handleUserChange}
                rows={4}
                className={inputStyle}
                placeholder={t('formInstructionsPlaceholderJob')}
              />
            </div>
            <div>
                <label htmlFor="headerInfo" className="block text-sm font-medium text-text-primary mb-2">
                    {userData.documentType === 'email' ? t('formEmailSignature') : t('formHeader')}
                </label>
                <textarea
                    id="headerInfo"
                    name="headerInfo"
                    value={userData.headerInfo}
                    onChange={handleUserChange}
                    rows={3}
                    className={inputStyle}
                    placeholder={
                        userData.documentType === 'email'
                        ? t('formEmailSignaturePlaceholder')
                        : t('formHeaderPlaceholder')
                    }
                />
            </div>
             <div>
                <label htmlFor="footerInfo" className="block text-sm font-medium text-text-primary mb-2">
                    {userData.documentType === 'email' ? t('formEmailClosing') : t('formClosing')}
                </label>
                <input
                    type="text"
                    id="footerInfo"
                    name="footerInfo"
                    value={userData.footerInfo}
                    onChange={handleUserChange}
                    className={inputStyle}
                    placeholder={
                        userData.documentType === 'email'
                        ? t('formEmailClosingPlaceholder')
                        : t('formClosingPlaceholder')
                    }
                />
            </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="pt-6 border-t border-border">
        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all">
          {isLoading && mainButtonSpinner}
          {isLoading ? t('formGeneratingButton') : t('formGenerateButton')}
        </button>
      </div>
    </form>
  );
};

export default UserInputForm;