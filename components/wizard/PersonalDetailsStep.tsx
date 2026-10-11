import { Input, Textarea, NativeSelect } from '../ui/fields';
import { Button } from '../ui/button';
import React, { useRef, useState } from 'react';
import { useFormState } from '../../contexts/FormStateContext';
import { useLocale } from '../../contexts/LocaleContext';
import { getFriendlyErrorMessage, FriendlyError } from '../../services/errorService';
import { trackEvent } from '../../services/analyticsService';
import SmallLoadingSpinner from '../icons/SmallLoadingSpinner';
import LinkedInIcon from '../icons/LinkedInIcon';

const PersonalDetailsStep: React.FC = () => {
  const { userData, setUserData } = useFormState();
  const { t } = useLocale();
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false);
  const [linkedInImportError, setLinkedInImportError] = useState<FriendlyError | null>(null);
  const linkedInFileInputRef = useRef<HTMLInputElement>(null);

  const inputFileStyle = "w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30 cursor-pointer";

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'resume') {
        setUserData(prev => ({ ...prev, resume: files[0] }));
      }
    }
  };

  const handleLinkedInFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingLinkedIn(true);
    setLinkedInImportError(null);

    try {
        const { importLinkedInProfileUnified } = await import('../../services/llms');
        const { skills, experience } = await importLinkedInProfileUnified(file);
        setUserData(prev => ({ ...prev, skills, experience }));
        trackEvent({ name: 'linkedin_import_success', params: {} });
    } catch (err) {
        const friendlyError = getFriendlyErrorMessage(err);
        setLinkedInImportError(friendlyError);
        trackEvent({
          name: 'linkedin_import_failure',
          params: { error_message: friendlyError.message }
        });
    } finally {
        setIsImportingLinkedIn(false);
    }
    if (e.target) {
        e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">{t('formStep1')}</h2>
        <div className="grid grid-cols-1 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">{t('formLetterType')}</label>
            <div className="flex gap-2 rounded-md bg-card-secondary p-1">
              <Button variant="ghost" type="button" onClick={() => setUserData(p => ({...p, letterType: 'job'}))} className={`w-full min-w-0 h-auto min-h-11 whitespace-normal px-2 py-2 text-sm rounded transition-colors ${userData.letterType === 'job' ? 'bg-accent text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}>{t('formJobApplication')}</Button>
              <Button variant="ghost" type="button" onClick={() => setUserData(p => ({...p, letterType: 'university'}))} className={`w-full min-w-0 h-auto min-h-11 whitespace-normal px-2 py-2 text-sm rounded transition-colors ${userData.letterType === 'university' ? 'bg-accent text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}>{t('formUniversityAdmission')}</Button>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">{t('formFullName')}</label>
            <Input type="text" id="name" name="name" value={userData.name} onChange={handleUserChange} required placeholder={t('formFullNamePlaceholder')} />
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-accent border-b border-border pb-2 flex-grow">{t('formStep2')}</h2>
            <div className="relative group flex-shrink-0">
                <Input
                    type="file"
                    ref={linkedInFileInputRef}
                    onChange={handleLinkedInFileSelect}
                    className="hidden"
                    accept=".pdf"
                    disabled={isImportingLinkedIn}
                />
                <Button variant="ghost"
                    type="button"
                    onClick={() => linkedInFileInputRef.current?.click()}
                    disabled={isImportingLinkedIn}
                    className="flex items-center gap-2 ml-4 px-3 py-1.5 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isImportingLinkedIn ? <SmallLoadingSpinner /> : <LinkedInIcon className="w-4 h-4" />}
                    <span>{isImportingLinkedIn ? t('formLinkedInImporting') : t('formLinkedInImport')}</span>
                </Button>
                <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-card text-text-secondary text-xs rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-border">
                    <h4 className="font-bold text-sm text-text-primary mb-2">{t('formLinkedInInstructionsTitle')}</h4>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>{t('formLinkedInInstructionsStep1')}</li>
                        <li>{t('formLinkedInInstructionsStep2')}</li>
                        <li>{t('formLinkedInInstructionsStep3')}</li>
                        <li>{t('formLinkedInInstructionsStep4')}</li>
                    </ol>
                </div>
            </div>
        </div>
         {linkedInImportError && (
            <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg p-3" role="alert">
                <p className="font-semibold">{t('formLinkedInImportError')}</p>
                <p className="mt-1">{linkedInImportError.message}</p>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-text-primary mb-2">{t('formSkills')}</label>
            <Textarea id="skills" name="skills" value={userData.skills} onChange={handleUserChange} rows={5} placeholder={t('formSkillsPlaceholder')}></Textarea>
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-text-primary mb-2">{t('formExperience')}</label>
            <Textarea id="experience" name="experience" value={userData.experience} onChange={handleUserChange} rows={5} placeholder={t('formExperiencePlaceholder')}></Textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="resume" className="block text-sm font-medium text-text-primary mb-2">{t('formResume')}</label>
            <Input type="file" id="resume" name="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" className={inputFileStyle} />
            <p className="text-xs text-text-secondary mt-1">{t('formResumeHint')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PersonalDetailsStep;
