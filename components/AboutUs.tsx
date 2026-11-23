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
