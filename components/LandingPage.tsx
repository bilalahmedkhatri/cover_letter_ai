'use client';
import { publicWorkflows } from '@/services/workflow.mjs';
import CustomerReviews from './CustomerReviews';
import BusinessLetterContent from './BusinessLetterContent';
import React from 'react';
import { LandingAdditions } from './ResourcePages';
import * as Tabs from '@radix-ui/react-tabs';
import { ArrowRight, Check, FileText, GraduationCap, Mail, ChevronDown, PencilLine } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { useFormState } from '../contexts/FormStateContext';
import { localizedPath } from '../services/routing';
import { usePageCopy } from '@/contexts/PageCopyContext';
import { Button } from './ui/button';

export default function LandingPage() {
  const { locale, t } = useLocale();
  const { userData, setUserData } = useFormState();
  const pageCopy = usePageCopy();
  const copy = pageCopy.interface!;
  const content = pageCopy.landing!;
  const selectedPurpose = userData.documentType === 'email' ? 'email' : userData.letterType === 'university' ? 'university' : 'job';
  const choose = (value: string) => setUserData(previous => ({ ...previous, documentType: value === 'email' ? 'email' : 'letter', letterType: value === 'university' ? 'university' : 'job' }));
  const purposes = [{ value: 'job', label: copy.job, Icon: FileText, text: t('landingForJobSeekersText') }, { value: 'university', label: copy.university, Icon: GraduationCap, text: t('landingForStudentsText') }, { value: 'email', label: copy.email, Icon: Mail, text: t('landingForProfessionalsText') }].filter(item=>publicWorkflows.includes(item.value==='job'?'cover-letter':item.value));
  const purpose=purposes.some(item=>item.value===selectedPurpose)?selectedPurpose:'job';
  return <div className="landing space-y-16 sm:space-y-24">
    <section className="hero-grid grid items-center gap-12 pt-5 pb-4 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-12">
      <div>
        <p className="eyebrow"><span className="inline-block size-1.5 rounded-full bg-accent" />{copy.eyebrow}</p>
        <h1 className="editorial-title mt-6 whitespace-pre-line">{copy.hero}</h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">{copy.intro}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild size="lg"><a href={localizedPath(locale, '/dashboard')}>{copy.start}<ArrowRight className="rtl:rotate-180" /></a></Button>
          <a href={localizedPath(locale, '/') + '#how-it-works'} className="text-sm font-semibold text-text-primary underline underline-offset-4">{copy.explore}</a>
        </div>
        <p className="mt-5 flex items-center gap-2 text-xs text-text-secondary"><Check size={14} className="text-accent" />{copy.note}</p>
      </div>
      <div className="paper-stage rounded-2xl border border-border bg-card-secondary/70 p-5 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3 text-xs text-text-secondary"><span className="flex items-center gap-2"><PencilLine size={14}/>{copy.sample}</span><span className="rounded-full border border-border bg-card px-3 py-1">{copy.job}</span></div>
        <article className="sample-paper rounded-sm border border-border bg-card p-7 text-text-primary shadow-sm sm:p-9">
          <div className="mb-8 flex items-center justify-between border-b border-border pb-4"><span className="font-semibold">Alex Morgan</span><span className="text-xs uppercase tracking-widest text-text-secondary">{locale.toUpperCase()}</span></div>
          <h2 className="mb-6 font-serif text-2xl">{copy.sampleTitle}</h2>
          <div className="space-y-4 text-sm leading-7"><p>{copy.sampleGreeting}</p><p>{copy.sampleBody}</p><p>{copy.sampleClosing}</p><p className="pt-2 font-serif text-lg italic">Alex Morgan</p></div>
        </article>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-text-secondary">{copy.sampleFooter}</p>
      </div>
    </section>
    <section className="purpose-section border-y border-border py-9">
      <Tabs.Root value={purpose} onValueChange={choose} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <Tabs.List aria-label={copy.welcome} className="grid gap-3 sm:grid-cols-3">
          {purposes.map(({ value, label, Icon }) => <Tabs.Trigger key={value} value={value} className="purpose-tab flex items-center gap-3 rounded-xl border border-transparent px-5 py-4 text-start text-sm font-semibold text-text-secondary transition-colors data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-text-primary"><Icon size={20} className="text-accent"/>{label}</Tabs.Trigger>)}
        </Tabs.List>
        {purposes.map(({ value, text }) => <Tabs.Content key={value} value={value} className="mt-5 flex flex-col items-start justify-between gap-4 px-5 sm:flex-row sm:items-center"><p className="max-w-2xl text-sm leading-relaxed text-text-secondary">{text}</p><Button asChild variant="outline" size="sm"><a href={localizedPath(locale, '/dashboard')}>{copy.start}<ArrowRight className="rtl:rotate-180"/></a></Button></Tabs.Content>)}
      </Tabs.Root>
    </section>
    <section>
      <h2 className="section-title max-w-3xl">{content.title}</h2>
      <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary">{content.intro}</p>
      <div className="mt-10 grid gap-8 md:grid-cols-3">{content.cases.filter((_,index)=>publicWorkflows.includes(['cover-letter','university','email'][index])).map(([title, text], index) => {
        const Icon = [FileText, GraduationCap, Mail][index];
        return <article key={title} className="rounded-xl border border-border bg-card p-6 sm:p-7"><Icon size={22} className="text-accent" aria-hidden="true"/><h3 className="mt-5 text-lg font-semibold leading-7">{title}</h3><p className="mt-4 text-sm leading-7 text-text-secondary">{text}</p></article>;
      })}</div>
    </section>
    <section id="how-it-works" className="scroll-mt-28">
      <p className="eyebrow">{copy.explore}</p><h2 className="section-title mt-4 max-w-2xl">{copy.how}</h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {[copy.stepOne, copy.stepTwo, copy.stepThree].map((title, index) => <article key={title} className="border-t border-border pt-6"><span className="text-xs font-semibold text-text-muted">0{index+1}</span><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-text-secondary">{t((['landingStep1Text','landingStep2Text','landingStep3Text'] as const)[index])}</p></article>)}
      </div>
    </section>
    <section><h2 className="section-title">{content.toolsTitle}</h2><div className="mt-8 grid gap-8 sm:grid-cols-3">{content.tools.map(([title, text], index) => <article key={title} className="border-t border-border pt-6"><span className="text-xs font-semibold text-accent">0{index + 1}</span><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-text-secondary">{text}</p></article>)}</div></section>
    <section className="grid gap-8 rounded-2xl border border-border bg-card-secondary p-7 sm:p-10 lg:grid-cols-2"><div><h2 className="section-title">{content.prepareTitle}</h2><p className="mt-4 text-sm leading-7 text-text-secondary">{content.prepareIntro}</p></div><ul className="space-y-5">{content.checklist.map(item => <li key={item} className="flex items-start gap-3 text-sm leading-6"><Check size={17} className="mt-1 shrink-0 text-accent" aria-hidden="true"/>{item}</li>)}</ul></section>
    <BusinessLetterContent showFreeFaq={false} />
    <LandingAdditions />
    <CustomerReviews />
    <section id="pricing" className="flex flex-col items-start justify-between gap-6 border-y border-border py-9 sm:flex-row sm:items-center"><p className="text-lg font-semibold">{pageCopy.pricingTeaser!.teaser}</p><Button asChild variant="outline"><a href={localizedPath(locale, '/pricing')}>{pageCopy.pricingTeaser!.view}<ArrowRight className="rtl:rotate-180"/></a></Button></section>
    <section className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
      <div><p className="eyebrow">{t('landingFAQTitle')}</p><h2 className="section-title mt-4">{copy.faq}</h2></div>
      <div>{([1,2,3,4] as const).map(number => <details key={number} className="group border-b border-border py-1"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-semibold"><span>{t(`landingFAQ${number}Title`)}</span><ChevronDown size={17} className="shrink-0 transition-transform group-open:rotate-180"/></summary><p className="pb-5 text-sm leading-7 text-text-secondary">{t(`landingFAQ${number}Text`)}</p></details>)}</div>
    </section>
    <section className="max-w-3xl"><h2 className="section-title">{content.reviewTitle}</h2><p className="mt-4 text-sm leading-7 text-text-secondary">{content.review}</p></section>
    <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card px-7 py-10 sm:flex-row sm:items-center sm:px-10"><div><h2 className="section-title">{copy.welcome}</h2><p className="mt-3 text-sm text-text-secondary">{copy.note}</p></div><Button asChild size="lg"><a href={localizedPath(locale, '/dashboard')}>{copy.start}<ArrowRight className="rtl:rotate-180"/></a></Button></section>
  </div>;
}
