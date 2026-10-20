'use client';
import React from 'react';
import { Button } from './ui/button';
import { useLocale } from '../contexts/LocaleContext';
import { localizedPath } from '../services/routing';
import { usePageCopy } from '@/contexts/PageCopyContext';

const AboutUs: React.FC = () => {
  const { t, locale } = useLocale();
  const { aboutDescription } = usePageCopy();
  return (
    <div className="mx-auto max-w-3xl space-y-5 text-text-primary leading-relaxed">
      <h1 className="editorial-title mb-8">{t('about')}</h1>
      
      <p>{aboutDescription}</p>
      <h2 className="text-xl font-semibold text-accent pt-4">{t('landingStepsTitle')}</h2>
      {(['1', '2', '3'] as const).map(step => (
        <section key={step} className="space-y-2">
          <h3 className="text-lg font-semibold">{t(`landingStep${step}Title`)}</h3>
          <p>{t(`landingStep${step}Text`)}</p>
        </section>
      ))}
      <h2 className="text-xl font-semibold text-accent pt-4">{t('landingForWhoTitle')}</h2>
      <p>{t('landingForJobSeekersText')}</p>
      <p>{t('landingForStudentsText')}</p>
      <p>{t('landingForProfessionalsText')}</p>
      <p><a href={localizedPath(locale, '/privacy')} className="text-accent underline">{t('privacy')}</a></p>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <Button asChild><a href={localizedPath(locale, '/dashboard')}>
            {t('backToGenerator')}
        </a></Button>
      </div>
    </div>
  );
};

export default AboutUs;
