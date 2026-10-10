import { Button } from './ui/button';
import React, { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';

const COOKIE_CONSENT_KEY = 'cookie_consent_status';

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    try {
      const consentStatus = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consentStatus) {
        setIsVisible(true);
      }
    } catch (error) {
      console.warn("Could not read cookie consent status from localStorage.", error);
      // Default to showing the banner if storage is inaccessible
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (consent: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, consent);
    } catch (error) {
      console.warn("Could not save cookie consent status to localStorage.", error);
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-3 inset-x-3 sm:inset-x-6 bg-card border border-border text-text-primary p-4 z-50 rounded-xl shadow-lg"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie Consent Banner"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <p className="text-sm text-text-secondary text-start">
          {t('cookieBannerText')}
          {' '}
          <a
            href="https://policies.google.com/technologies/cookies"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-cyan-400 transition-colors"
          >
            {t('cookieLearnMore')}
          </a>.
        </p>
        <div className="flex-shrink-0 flex gap-3">
          <Button variant="outline"
            onClick={() => handleConsent('rejected')}
            className="px-4 py-2 text-sm font-medium rounded-md bg-card hover:bg-card-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
            aria-label="Reject non-essential cookies"
          >
            {t('cookieReject')}
          </Button>
          <Button variant="outline"
            onClick={() => handleConsent('accepted')}
            className="px-4 py-2 text-sm font-medium rounded-md bg-accent hover:bg-accent/90 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
            aria-label="Accept all cookies"
          >
            {t('cookieAccept')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;