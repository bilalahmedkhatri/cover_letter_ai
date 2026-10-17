import {publicWorkflows} from '@/services/workflow.mjs';
import React from 'react';
import BusinessLetterContent from './BusinessLetterContent';
import { ArrowRight, Check, FileText, GraduationCap, Mail } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { useFormState } from '../contexts/FormStateContext';
import { localizedPath } from '../services/routing';
import { resourceCopy, resourceNotice, type ResourcePage } from '../services/resourceCopy';
import { Button } from './ui/button';

export function PriceComparison({ compact = false }: { compact?: boolean }) {
  const { locale } = useLocale();
  const c = resourceCopy(locale);
  const rows = [
    ['ailettergen · Starter', '$10', c.ownPeriod, c.ownFocus, localizedPath(locale, '/pricing')],
    ['Rezi Pro', '$29', c.reziPeriod, c.reziFocus, 'https://www.rezi.ai/pricing'],
    ['Teal+', '$29', c.tealPeriod, c.tealFocus, 'https://www.tealhq.com/pricing'],
  ];
  return <div lang={locale === 'ru' ? 'ru' : 'en'} dir="ltr">
    {!compact && <div className="space-y-4 sm:hidden">{rows.map(([name, price, period, focus, url], index) => <article key={name} className={`rounded-xl border border-border p-5 ${index === 0 ? 'bg-accent/5' : 'bg-card'}`}><h3 className="font-semibold"><a href={url} className="underline decoration-border underline-offset-4" {...(index > 0 ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{name}</a></h3><p className="mt-3"><span className="text-2xl font-semibold">{price}</span><span className="ms-2 text-xs text-text-secondary">{period}</span></p><p className="mt-4 text-sm leading-7 text-text-secondary">{focus}</p></article>)}</div>}
    <div className={`${compact ? '' : 'hidden sm:block'} overflow-x-auto rounded-xl border border-border`}>
      <table className={`w-full ${compact ? '' : 'min-w-[560px]'} text-start text-sm`}>
        <caption className="sr-only">{c.compareHeading}</caption>
        <thead className="bg-card-secondary"><tr>{[c.product, c.price, ...(compact ? [] : [c.focus])].map(label => <th key={label} scope="col" className="p-5 text-start font-semibold">{label}</th>)}</tr></thead>
        <tbody>
          {rows.map(([name, price, period, focus, url], index) => <tr key={name} className={`border-t border-border ${index === 0 ? 'bg-accent/5' : 'bg-card'}`}>
            <th scope="row" className="p-5 text-start align-top"><a href={url} className="underline decoration-border underline-offset-4 hover:text-accent" {...(index > 0 ? { target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${name} — ${c.source}` } : {})}>{name}</a></th>
            <td className="p-5 align-top"><span className="text-xl font-semibold">{price}</span><span className="mt-1 block text-xs text-text-secondary">{period}</span></td>
            {!compact && <td className="max-w-lg p-5 align-top leading-7 text-text-secondary">{focus}</td>}
          </tr>)}
        </tbody>
      </table>
    </div>
    <p className="mt-4 text-xs leading-6 text-text-secondary">{c.checked}</p>
    <p className="mt-3 text-sm leading-7 text-text-secondary">{c.fair}</p>
  </div>;
}

export function LandingAdditions() {
  const { locale } = useLocale();
  const c = resourceCopy(locale);
  const contentLanguage = locale === 'ru' ? 'ru' : 'en';
  return <>
    {resourceNotice[locale] && <p className="text-xs text-text-secondary">{resourceNotice[locale]}</p>}
    <section lang={contentLanguage} dir="ltr" className="grid gap-9 lg:grid-cols-2 lg:gap-14">
      <div><p className="eyebrow">{c.beforeSend}</p><h2 className="section-title mt-4">{c.guideSection}</h2><p className="mt-5 text-sm leading-7 text-text-secondary">{c.guideSectionIntro}</p><ol className="mt-6 space-y-4">{c.reviewSteps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6"><span className="text-accent">0{index + 1}</span>{step}</li>)}</ol><Button asChild variant="outline" className="mt-7"><a href={localizedPath(locale, '/guides')}>{c.viewGuides}<ArrowRight/></a></Button></div>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8"><p className="eyebrow">{c.generic}</p><p className="mt-3 font-serif text-xl leading-8 text-text-secondary">{c.genericExample}</p><div className="my-6 h-px bg-border"/><p className="eyebrow text-accent">{c.specific}</p><p className="mt-3 font-serif text-xl leading-8">{c.specificExample}</p><p className="mt-6 text-xs leading-6 text-text-secondary">{c.exampleNote}</p></div>
    </section>
    <section lang={contentLanguage} dir="ltr"><h2 className="section-title">{c.compareHeading}</h2><p className="mt-5 mb-8 max-w-3xl text-sm leading-7 text-text-secondary">{c.compareIntro}</p><PriceComparison compact/><Button asChild variant="outline" className="mt-6"><a href={localizedPath(locale, '/compare')}>{c.viewCompare}<ArrowRight/></a></Button></section>
  </>;
}

export default function ResourcePages({ page }: { page: ResourcePage }) {
  const { locale } = useLocale();
  const { setUserData, setCurrentStep } = useFormState();
  const c = resourceCopy(locale);
  const title = page === '/features' ? c.featuresTitle : page === '/guides' ? c.guidesTitle : c.compareTitle;
  const intro = page === '/features' ? c.featuresIntro : page === '/guides' ? c.guidesIntro : c.compareIntro;
  return <div className="space-y-12 sm:space-y-16">
    {resourceNotice[locale] && <p className="rounded-lg border border-border p-4 text-sm text-text-secondary">{resourceNotice[locale]}</p>}
    <div lang={locale === 'ru' ? 'ru' : 'en'} dir="ltr" className="space-y-12 sm:space-y-16">
      <header className="max-w-3xl pt-6"><h1 className="editorial-title">{title}</h1><p className="mt-6 text-lg leading-8 text-text-secondary">{intro}</p></header>
      {page === '/features' && <><div className="grid gap-6 md:grid-cols-2">{c.features.map(([heading, text], index) => <article key={heading} className="rounded-xl border border-border bg-card p-7"><span className="text-xs font-semibold text-accent">0{index + 1}</span><h2 className="mt-4 text-xl font-semibold">{heading}</h2><p className="mt-4 text-sm leading-7 text-text-secondary">{text}</p></article>)}</div><section className="max-w-3xl"><h2 className="section-title">{c.limitsTitle}</h2><p className="mt-4 text-sm leading-7 text-text-secondary">{c.limits}</p></section></>}
      {page === '/guides' && <>{c.guides.filter(guide=>publicWorkflows.includes(guide.kind==='job'?'cover-letter':guide.kind)).map((guide, index) => {
        const Icon = [FileText, GraduationCap, Mail][index];
        return <article key={guide.kind} id={guide.kind} className="scroll-mt-28 grid gap-8 border-t border-border pt-8 lg:grid-cols-2"><div><Icon className="text-accent"/><h2 className="section-title mt-4">{guide.title}</h2><p className="mt-4 text-sm text-text-secondary">{guide.audience}</p><ol className="mt-6 space-y-4">{guide.steps.map((step, i) => <li key={step} className="flex gap-3 text-sm leading-7"><span className="text-accent">{i + 1}.</span>{step}</li>)}</ol></div><div className="rounded-xl border border-border bg-card-secondary p-7"><p className="text-sm leading-8">{guide.example}</p><Button asChild className="mt-7"><a href={localizedPath(locale, '/dashboard')} onClick={() => { setUserData(previous => ({ ...previous, customInstruction: guide.prompt, documentType: guide.kind === 'email' ? 'email' : 'letter', letterType: guide.kind === 'university' ? 'university' : 'job' })); setCurrentStep(1); }}>{c.useOutline}<ArrowRight/></a></Button><p className="mt-4 text-xs leading-6 text-text-secondary">{c.outlineNote}</p></div></article>;
      })}<section className="rounded-xl border border-border p-7"><h2 className="section-title">{c.beforeSend}</h2><ul className="mt-6 grid gap-5 sm:grid-cols-2">{c.checks.map(check => <li key={check} className="flex gap-3 text-sm leading-7"><Check size={17} className="mt-1 shrink-0 text-accent"/>{check}</li>)}</ul></section></>}
      {page === '/compare' && <><PriceComparison/><section className="max-w-3xl"><h2 className="section-title">{c.choiceTitle}</h2><p className="mt-5 text-sm leading-8 text-text-secondary">{c.choice}</p><a href={localizedPath(locale, '/features')} className="mt-5 inline-block text-sm font-semibold text-accent underline underline-offset-4">{c.featuresTitle}</a></section></>}
      <div className="border-t border-border pt-8"><Button asChild size="lg"><a href={localizedPath(locale, '/dashboard')}>{c.start}<ArrowRight/></a></Button></div>
    </div>
    {page !== '/compare' && <BusinessLetterContent />}
  </div>;
}
