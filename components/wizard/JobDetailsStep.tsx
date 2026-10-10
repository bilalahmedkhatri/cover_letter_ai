import { Input, Textarea, NativeSelect } from '../ui/fields';
import { Button } from '../ui/button';
import React, { useState } from 'react';
import { useFormState } from '../../contexts/FormStateContext';
import { useGeneration } from '../../contexts/GenerationContext';
import { useLocale } from '../../contexts/LocaleContext';
import { generateAnalysisReportPdf } from '../../services/pdfService';
import { getFriendlyErrorMessage } from '../../services/errorService';
import SmallLoadingSpinner from '../icons/SmallLoadingSpinner';
import XIcon from '../icons/XIcon';
import InfoIcon from '../icons/InfoIcon';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';
import DownloadIcon from '../icons/DownloadIcon';

interface JobDetailsStepProps {
  onAnalyzeUrl: () => void;
  onExtractKeywords: () => void;
}

const JobDetailsStep: React.FC<JobDetailsStepProps> = ({ onAnalyzeUrl, onExtractKeywords }) => {
  const { userData, setUserData, jobDetails, setJobDetails } = useFormState();
  const {
    isAnalyzing, analysisError, admissionInfo, foundCourses, analysisNotes,
    extractedKeywords, setExtractedKeywords, isExtractingKeywords, keywordError
  } = useGeneration();
  const { t } = useLocale();

  const [customKeyword, setCustomKeyword] = useState('');
  const [pdfError, setPdfError] = useState<Error | null>(null);

  const inputStyle = "";
  const inputFileStyle = "w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30 cursor-pointer";

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({ ...prev, [name]: value }));
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

  const handleRemoveKeyword = (indexToRemove: number) => {
    setExtractedKeywords(extractedKeywords.filter((_, index) => index !== indexToRemove));
  };

  const handleAddKeyword = () => {
    if (customKeyword.trim() !== '' && !extractedKeywords.some(kw => kw.keyword.toLowerCase() === customKeyword.trim().toLowerCase())) {
      setExtractedKeywords([...extractedKeywords, { keyword: customKeyword.trim(), explanation: 'Manually added by user.' }]);
      setCustomKeyword('');
    }
  };

  const handleDownloadAnalysisPdf = async () => {
    if (!admissionInfo) return;
    setPdfError(null);
    try {
        await generateAnalysisReportPdf(admissionInfo, foundCourses, t);
    } catch (e: any) {
        setPdfError(e);
    }
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

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">
            {userData.letterType === 'job' ? t('formStep3Job') : t('formStep3University')}
        </h2>
        {userData.letterType === 'job' ? (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label htmlFor="url" className="block text-sm font-medium text-text-primary mb-2">{t('formJobURL')}</label>
                  <Input type="url" id="url" name="url" value={jobDetails.url} onChange={handleJobChange} className={inputStyle} placeholder={t('formJobURLPlaceholder')} />
              </div>
              <div>
                  <label htmlFor="screenshot" className="block text-sm font-medium text-text-primary mb-2">{t('formJobScreenshot')}</label>
                  <Input type="file" id="screenshot" name="screenshot" onChange={handleScreenshotChange} accept="image/*" className={inputFileStyle} />
              </div>
            </div>

            <div className="bg-card/50 p-4 rounded-lg border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-text-primary">{t('formKeywordsTitle')}</h3>
                  <p className="text-sm text-text-secondary">{t('formKeywordsDescription')}</p>
                </div>
                <Button variant="ghost"
                  type="button"
                  onClick={onExtractKeywords}
                  disabled={isExtractingKeywords || (!jobDetails.url && !jobDetails.screenshot)}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExtractingKeywords && <SmallLoadingSpinner />}
                  {isExtractingKeywords ? t('formKeywordsExtracting') : t('formKeywordsExtract')}
                </Button>
              </div>

              {keywordError && (
                <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg p-3" role="alert">
                  <p className="font-semibold">{t('formKeywordsError')}</p>
                  <p className="mt-1">{keywordError.message}</p>
                </div>
              )}

              {(extractedKeywords.length > 0 || isExtractingKeywords) && !keywordError && (
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-text-primary mb-2">{t('formKeywordsExtracted')}</label>
                    <div className="p-3 bg-input-bg border border-border rounded-md min-h-[100px]">
                        {isExtractingKeywords ? (
                             <div className="flex items-center justify-center h-full text-text-secondary">
                                <SmallLoadingSpinner /> <span className="ms-2">{t('formKeywordsExtracting')}</span>
                            </div>
                        ) : (
                             <div className="flex flex-wrap gap-2">
                                {extractedKeywords.map((kw, index) => (
                                    <div key={index} className="group relative">
                                        <span className="flex items-center bg-accent/30 text-text-primary text-sm font-medium ps-3 pe-2 py-1 rounded-full">
                                            {kw.keyword}
                                            <Button variant="ghost"
                                                type="button"
                                                onClick={() => handleRemoveKeyword(index)}
                                                className="ms-2 -me-1 text-text-primary hover:text-accent"
                                                aria-label={`Remove ${kw.keyword}`}
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </Button>
                                        </span>
                                        {kw.explanation && (
                                            <div className="absolute bottom-full mb-2 w-64 p-2 bg-card text-text-secondary text-xs rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-border">
                                                <div className="flex items-start gap-2">
                                                    <InfoIcon className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                                                    <p>{kw.explanation}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mt-2 flex gap-2">
                        <Input
                            type="text"
                            value={customKeyword}
                            onChange={(e) => setCustomKeyword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(); } }}
                            className={inputStyle + " flex-grow"}
                            placeholder={t('formKeywordsAddPlaceholder')}
                        />
                        <Button variant="ghost"
                            type="button"
                            onClick={handleAddKeyword}
                            className="px-4 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-sm font-medium"
                        >
                            {t('formKeywordsAddButton')}
                        </Button>
                    </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="universityUrl" className="block text-sm font-medium text-text-primary mb-2">{t('formUniversityURL')}</label>
                    <Input type="url" id="universityUrl" name="universityUrl" value={userData.universityUrl} onChange={handleUserChange} required className={inputStyle} placeholder={t('formUniversityURLPlaceholder')} />
                </div>
                 <div>
                    <label htmlFor="courseName" className="block text-sm font-medium text-text-primary mb-2">{t('formCourseName')}</label>
                    {foundCourses && foundCourses.length > 0 ? (
                      <NativeSelect
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
                      </NativeSelect>
                    ) : (
                      <Input
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
                <Textarea
                    id="universityAnalysisInstruction"
                    name="universityAnalysisInstruction"
                    value={userData.universityAnalysisInstruction}
                    onChange={handleUserChange}
                    rows={3}
                    className={inputStyle}
                    placeholder={t('formAnalysisInstructionsPlaceholder')}
                />
            </div>
            <Button variant="ghost" type="button" onClick={onAnalyzeUrl} disabled={isAnalyzing || !userData.universityUrl} className="flex items-center justify-center gap-2 w-full md:w-auto whitespace-normal h-auto min-h-11 px-4 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {isAnalyzing && <SmallLoadingSpinner />}
              {isAnalyzing ? t('formAnalyzingButton') : t('formAnalyzeButton')}
            </Button>
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
                      <div className="text-right">
                        <Button variant="ghost"
                          type="button"
                          onClick={handleDownloadAnalysisPdf}
                          className="flex items-center gap-2 px-3 py-1 bg-accent hover:bg-accent/90 rounded-md transition-colors text-xs font-medium"
                        >
                          <DownloadIcon className="w-4 h-4" />
                          <span>{t('formDownloadPDF')}</span>
                        </Button>
                      </div>
                    </div>
                    {admissionInfo.admissionRequirements && (
                      <div>
                          <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                            {t('formRequirements')}
                            {admissionInfo.admissionRequirements.sourceUrl && <a href={admissionInfo.admissionRequirements.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLinkIcon className="w-4 h-4" /></a>}
                          </strong>
                          {renderBulletedText(admissionInfo.admissionRequirements.text)}
                      </div>
                    )}
                    {admissionInfo.deadlines && (
                      <div>
                          <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                              {t('formDeadlines')}
                              {admissionInfo.deadlines.sourceUrl && <a href={admissionInfo.deadlines.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLinkIcon className="w-4 h-4" /></a>}
                          </strong>
                          {renderBulletedText(admissionInfo.deadlines.text)}
                      </div>
                    )}
                    {admissionInfo.scholarships && (
                      <div>
                        <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                            {t('formScholarships')}
                            {admissionInfo.scholarships.sourceUrl && <a href={admissionInfo.scholarships.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong>
                        {renderBulletedText(admissionInfo.scholarships.text)}
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
    </div>
  );
};

export default JobDetailsStep;
