import React, { useRef, useState, useEffect } from 'react';
import { useFormState } from '../../contexts/FormStateContext';
import { useLocale } from '../../contexts/LocaleContext';
import SparklesIcon from '../icons/SparklesIcon';
import { TranslationKeys } from '../../services/translations';

const languages = [
  "English", "Bulgarian", "Hungarian", "Spanish", "French", 
  "Arabic", "Dutch", "Russian", "Portuguese", "Slovak", "Polish"
];

const promptTemplates = [
  { titleKey: 'promptTemplateCareerChangeTitle', contentKey: 'promptTemplateCareerChangeContent' },
  { titleKey: 'promptTemplateRemoteJobTitle', contentKey: 'promptTemplateRemoteJobContent' },
  { titleKey: 'promptTemplateInfoInterviewTitle', contentKey: 'promptTemplateInfoInterviewContent' },
  { titleKey: 'promptTemplateEntryLevelTitle', contentKey: 'promptTemplateEntryLevelContent' },
  { titleKey: 'promptTemplateSoftSkillsTitle', contentKey: 'promptTemplateSoftSkillsContent' },
  { titleKey: 'promptTemplateFollowUpTitle', contentKey: 'promptTemplateFollowUpContent' },
];

const CustomizationStep: React.FC = () => {
  const { userData, setUserData } = useFormState();
  const { t } = useLocale();
  
  const [showTemplates, setShowTemplates] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);

  const inputStyle = "w-full bg-input-bg border border-border rounded-md px-3 py-2 text-text-primary placeholder-input-placeholder focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(event.target as Node)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelect = (contentKey: TranslationKeys) => {
    setUserData(prev => ({ ...prev, customInstruction: t(contentKey) }));
    setShowTemplates(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">{t('formStep4')}</h2>
        <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-text-primary mb-2">{t('formTone')}</label>
                <select id="tone" name="tone" value={userData.tone} onChange={handleUserChange} className={inputStyle}>
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
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="customInstruction" className="block text-sm font-medium text-text-primary">
                  {t('formInstructions')}
                </label>
                <div className="relative" ref={templatesRef}>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(prev => !prev)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-indigo-300 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-md transition-colors"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>{t('formPromptTemplates')}</span>
                  </button>
                  {showTemplates && (
                    <div className="absolute end-0 mt-2 w-72 bg-card rounded-md shadow-lg z-10 border border-border origin-top-right animate-dropdown-enter">
                      <ul className="py-1 max-h-60 overflow-y-auto">
                        {promptTemplates.map(template => (
                          <li key={template.titleKey}>
                            <button
                              type="button"
                              onClick={() => handleTemplateSelect(template.contentKey as TranslationKeys)}
                              className="w-full text-left rtl:text-right px-3 py-2 text-sm text-text-primary hover:bg-card-secondary transition-colors"
                            >
                              {t(template.titleKey as TranslationKeys)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
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
    </div>
  );
};

export default CustomizationStep;
