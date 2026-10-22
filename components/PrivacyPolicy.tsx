import 'server-only';
import { Button } from './ui/button';
import { localizedPath } from '../services/routing';
import { privacyPolicyCopy } from '../services/privacyPolicyCopy';
import type { Locale } from '../types';

export default function PrivacyPolicy({ locale }: { locale: Locale }) {
  const copy = privacyPolicyCopy[locale];
  return (
    <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="mx-auto max-w-3xl space-y-5 text-text-primary leading-relaxed [overflow-wrap:anywhere]">
      <h1 className="editorial-title mb-8">{copy.title}</h1>
      <div className="space-y-4">
        {copy.sections.map((section, index) => <section key={index} className="space-y-4">
          <h2 className="text-xl font-semibold text-accent pt-4">{index + 1}. {section.title}</h2>
          {section.intro && <p>{section.intro}</p>}
          {section.items && <ul className="list-disc list-inside ps-4">{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
          {section.body && <p>{section.body}</p>}
        </section>)}
      </div>
      <div className="mt-8 pt-6 border-t border-border text-center">
        <Button asChild><a href={localizedPath(locale, '/dashboard')}>{copy.back}</a></Button>
      </div>
    </div>
  );
}
