import React from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { localizedPath } from '../services/routing';
import { resourceLabels } from '../services/resourceCopy';
import { footerContext } from '../services/footerContext';
import { pricingLabel } from '../services/pricingCopy';
import Brand from './Brand';
import { blogCopy } from '../services/blogContent.mjs';

const Footer: React.FC = () => {
  const { t, locale } = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border mt-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-semibold text-text-primary"><Brand/></h3>
            <p className="mt-4 text-sm leading-6 text-text-secondary">{footerContext[locale]}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <h4 className="text-sm font-semibold text-text-primary tracking-wider uppercase">{t('footerLinks')}</h4>
              <ul className="mt-4 space-y-2">
                <li><a href={localizedPath(locale, '/')} className="text-text-secondary hover:text-accent text-sm transition-colors">{t('footerHome')}</a></li>
                <li><a href={localizedPath(locale, '/dashboard')} className="text-text-secondary hover:text-accent text-sm transition-colors">{t('footerGenerator')}</a></li>
                <li><a href={localizedPath(locale, '/pricing')} className="text-text-secondary hover:text-accent text-sm transition-colors">{pricingLabel[locale]}</a></li>
                <li><a href={localizedPath(locale, '/blog')} className="text-text-secondary hover:text-accent text-sm transition-colors">{blogCopy[locale].label}</a></li>
                {(['/features', '/guides', '/compare'] as const).map((page, index) => <li key={page}><a href={localizedPath(locale, page)} className="text-text-secondary hover:text-accent text-sm transition-colors">{resourceLabels[locale][index]}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary tracking-wider uppercase">{t('footerLegal')}</h4>
              <ul className="mt-4 space-y-2">
                <li><a href={localizedPath(locale, '/account')} className="text-text-secondary hover:text-accent text-sm">{locale === 'ru' ? 'Кабинет' : 'Your account'}</a></li>
                <li><a href={localizedPath(locale, '/about')} className="text-text-secondary hover:text-accent text-sm transition-colors">{t('footerAbout')}</a></li>
                <li><a href={localizedPath(locale, '/privacy')} className="text-text-secondary hover:text-accent text-sm transition-colors">{t('footerPrivacy')}</a></li>
                <li><a href={localizedPath(locale, '/terms')} className="text-text-secondary hover:text-accent text-sm transition-colors">{t('footerTerms')}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-border pt-8 text-start text-xs text-text-muted">
          <p>{t('footerCopyright', { year: currentYear.toString() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
