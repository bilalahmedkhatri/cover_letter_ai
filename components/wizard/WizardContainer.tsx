import React from 'react';
import { useFormState } from '../../contexts/FormStateContext';
import { useGeneration } from '../../contexts/GenerationContext';
import { useLocale } from '../../contexts/LocaleContext';
import PersonalDetailsStep from './PersonalDetailsStep';
import JobDetailsStep from './JobDetailsStep';
import CustomizationStep from './CustomizationStep';
import SmallLoadingSpinner from '../icons/SmallLoadingSpinner';

interface WizardContainerProps {
  onSubmit: () => void;
  onAnalyzeUrl: () => void;
  onExtractKeywords: () => void;
}

const WizardContainer: React.FC<WizardContainerProps> = ({ onSubmit, onAnalyzeUrl, onExtractKeywords }) => {
  const { currentStep, nextStep, prevStep } = useFormState();
  const { isLoading } = useGeneration();
  const { t } = useLocale();

  const mainButtonSpinner = <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      nextStep();
    } else {
      onSubmit();
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8">
      {/* Stepper Progress */}
      <div className="mb-8 flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-border rounded-full z-0"></div>
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-600 rounded-full z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        ></div>
        
        {[1, 2, 3].map((step) => (
            <div key={step} className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold transition-colors ${currentStep >= step ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-card border-border text-text-secondary'}`}>
                {step}
            </div>
        ))}
      </div>

      <form onSubmit={handleNext}>
        {currentStep === 1 && <PersonalDetailsStep />}
        {currentStep === 2 && <JobDetailsStep onAnalyzeUrl={onAnalyzeUrl} onExtractKeywords={onExtractKeywords} />}
        {currentStep === 3 && <CustomizationStep />}

        <div className="mt-8 pt-6 border-t border-border flex justify-between gap-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg text-text-primary font-medium rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-grow"></div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isLoading && mainButtonSpinner}
            {currentStep < 3 ? 'Next' : (isLoading ? t('formGeneratingButton') : t('formGenerateButton'))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WizardContainer;
