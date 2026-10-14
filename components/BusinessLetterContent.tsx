import Link from 'next/link';
import { useLocale } from '../contexts/LocaleContext';
import { localizedPath } from '../services/routing';
import { businessLetterCopy } from '../services/businessLetterCopy.mjs';
import { Button } from './ui/button';

export default function BusinessLetterContent({ showFreeFaq = true }: { showFreeFaq?: boolean }) {
  const { locale } = useLocale();
  const copy = businessLetterCopy[locale];
  return <section id="business-letters" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="scroll-mt-28 space-y-8">
    <div className="grid gap-8 lg:grid-cols-2">
      <div><h2 className="section-title">{copy.heading}</h2><p className="mt-5 text-sm leading-8 text-text-secondary">{copy.body}</p></div>
      <div><h3 className="text-xl font-semibold">{copy.editorHeading}</h3><p className="mt-5 text-sm leading-8 text-text-secondary">{copy.editor}</p></div>
    </div>
    {showFreeFaq && <details className="rounded-xl border border-border bg-card p-6">
      <summary className="cursor-pointer font-semibold">{copy.freeQuestion}</summary>
      <p className="mt-4 text-sm leading-7 text-text-secondary">{copy.freeAnswer}</p>
    </details>}
    <div className="flex flex-wrap items-center gap-5 text-sm">
      <Button asChild><Link href={localizedPath(locale, '/dashboard/email')}>{copy.action}</Link></Button>
      <Link href={localizedPath(locale, '/guides') + '#email'} className="text-accent underline underline-offset-4">{copy.guideLink}</Link>
      <Link href={localizedPath(locale, '/features') + '#business-letters'} className="text-accent underline underline-offset-4">{copy.featureLink}</Link>
    </div>
  </section>;
}
