import React, { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';

const COOKIE_CONSENT_KEY = 'cookie_consent_status';

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const consentStatus = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consentStatus) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (consent: 'accepted' | 'rejected') => {
    localStorage.setItem(COOKIE_CONSENT_KEY, consent);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-4 z-50 shadow-lg animate-slide-up"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie Consent Banner"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <p className="text-sm text-slate-200 text-center sm:text-left">
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
          <button
            onClick={() => handleConsent('rejected')}
            className="px-4 py-2 text-sm font-medium rounded-md bg-slate-600 hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
            aria-label="Reject non-essential cookies"
          >
            {t('cookieReject')}
          </button>
          <button
            onClick={() => handleConsent('accepted')}
            className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
            aria-label="Accept all cookies"
          >
            {t('cookieAccept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;