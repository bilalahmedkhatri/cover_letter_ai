'use client';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { usePageCopy } from '@/contexts/PageCopyContext';
import { localizedPath } from '@/services/routing';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import LandingDepth from './LandingDepth';

export default function LandingResearch() {
  const { locale } = useLocale();
  const copy = usePageCopy().landingResearch!;
  return <>
    <section aria-labelledby="landing-evidence" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <h2 id="landing-evidence" className="section-title max-w-3xl">{copy.title}</h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">{copy.paragraphs.map(paragraph => <p key={paragraph} className="text-sm leading-7 text-text-secondary">{paragraph}</p>)}</div>
    </section>
    <section aria-labelledby="landing-platforms" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <h2 id="landing-platforms" className="section-title max-w-3xl">{copy.platformTitle}</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">{copy.tips.map(([title, text], index) => <Card key={title} data-landing-card className="gap-4">
        <LandingDepth variant={(['sheets', 'orbit', 'frames'] as const)[index % 3]} />
        <CardHeader><CardTitle><h3 className="text-base leading-6">{title}</h3></CardTitle></CardHeader>
        <CardContent className="text-sm leading-7 text-text-secondary">{text}</CardContent>
      </Card>)}</div>
      <div className="mt-6 space-y-3 text-xs leading-6 text-text-secondary">
        <p>{copy.sourceNote}</p>
        <p className="flex flex-wrap gap-x-4 gap-y-2"><span>{copy.sourceLabel}:</span>{copy.sources.map(source => <a key={source.href} href={source.href} className="underline underline-offset-4 hover:text-accent">{source.name}</a>)}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-accent">
        <Link prefetch={false} href={localizedPath(locale, '/guides')} className="underline underline-offset-4">{copy.guidesLink}</Link>
        <Link prefetch={false} href={localizedPath(locale, '/compare')} className="underline underline-offset-4">{copy.compareLink}</Link>
        <Link prefetch={false} href={localizedPath(locale, '/blog')} className="underline underline-offset-4">{copy.blogLink}</Link>
      </div>
    </section>
  </>;
}
