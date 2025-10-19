import React from 'react';
import { useLocale } from '../contexts/LocaleContext';

const NotFoundPage: React.FC = () => {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-6xl font-extrabold text-accent">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-text-primary tracking-tight sm:text-4xl">{t('notFoundTitle')}</h2>
      <p className="mt-6 text-base leading-7 text-text-secondary">
        {t('notFoundSubtitle')}
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {t('notFoundButton')}
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
