import React from 'react';
import { useLocale } from '../contexts/LocaleContext';

const Footer: React.FC = () => {
  const { t } = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-accent">AI Letter Generator</h3>
            <p className="mt-2 text-sm text-text-secondary">{t('footerDescription')}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <h4 className="text-sm font-semibold text-text-primary tracking-wider uppercase">{t('footerLinks')}</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="/" className="text-text-secondary hover:text-accent text-sm transition-colors">{t('footerHome')}</a></li>
                <li><a href="/dashboard" className="text-text-secondary hover:text-accent text-sm transition-colors">{t('footerGenerator')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary tracking-wider uppercase">{t('footerLegal')}</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="/about" className="text-text-secondary hover:text-accent text-sm transition-colors">{t('footerAbout')}</a></li>
                <li><a href="/privacy" className="text-text-secondary hover:text-accent text-sm transition-colors">{t('footerPrivacy')}</a></li>
                <li><a href="/terms" className="text-text-secondary hover:text-accent text-sm transition-colors">{t('footerTerms')}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-border pt-8 text-center text-sm text-text-muted">
          <p>{t('footerCopyright', { year: currentYear.toString() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
