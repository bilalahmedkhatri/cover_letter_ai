import React from 'react';
import { ArrowRight, ArrowLeft, LoaderCircle, Check } from 'lucide-react';
import { useFormState } from '../../contexts/FormStateContext';
import { useGeneration } from '../../contexts/GenerationContext';
import { useLocale } from '../../contexts/LocaleContext';
import { interfaceCopy } from '../../services/interfaceCopy';
import { Button } from '../ui/button';
import PersonalDetailsStep from './PersonalDetailsStep';
import JobDetailsStep from './JobDetailsStep';
import CustomizationStep from './CustomizationStep';
interface WizardContainerProps { onSubmit: () => void; onAnalyzeUrl: () => void; onExtractKeywords: () => void }
export default function WizardContainer({ onSubmit, onAnalyzeUrl, onExtractKeywords }: WizardContainerProps) {
  const { currentStep, nextStep, prevStep } = useFormState();
  const { isLoading } = useGeneration();
  const { locale, t } = useLocale();
  const copy = interfaceCopy(locale);
  const labels = [copy.stageOne, copy.stageTwo, copy.stageThree];
  const next = (event: React.FormEvent) => { event.preventDefault(); if (currentStep < 3) nextStep(); else onSubmit(); };
  return <div className="wizard-card overflow-hidden rounded-xl border border-border bg-card">
    <ol aria-label={copy.details} className="grid grid-cols-3 gap-2 border-b border-border bg-card/70 p-4 sm:p-6">
      {labels.map((label, index) => <li key={label} aria-current={currentStep === index + 1 ? 'step' : undefined} className="flex items-center gap-2">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${currentStep >= index+1 ? 'bg-accent text-white' : 'bg-card-secondary text-text-muted'}`}>{currentStep > index+1 ? <Check size={13}/> : index+1}</span>
        <span className={`text-xs leading-tight ${currentStep === index+1 ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>{label}</span>
      </li>)}
    </ol>
    <form onSubmit={next} className="p-5 sm:p-7">
      {currentStep === 1 && <PersonalDetailsStep />}
      {currentStep === 2 && <JobDetailsStep onAnalyzeUrl={onAnalyzeUrl} onExtractKeywords={onExtractKeywords} />}
      {currentStep === 3 && <CustomizationStep />}
      <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-5">
        {currentStep > 1 ? <Button type="button" variant="ghost" onClick={prevStep} disabled={isLoading}><ArrowLeft className="rtl:rotate-180"/>{copy.back}</Button> : <span/>}
        <Button type="submit" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin"/> : null}{currentStep < 3 ? copy.next : isLoading ? t('formGeneratingButton') : t('formGenerateButton')}{!isLoading && <ArrowRight className="rtl:rotate-180"/>}</Button>
      </div>
    </form>
  </div>;
}
