'use client';
import {publicWorkflows} from '@/services/workflow.mjs';
import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { billingPlans, billingLimits } from '../services/billingPlans.mjs';
import { usePageCopy } from '@/contexts/PageCopyContext';
import BillingPanel from './billing/BillingPanel';

export default function PricingPage() {
  const { locale, shell } = useLocale();
  const pageCopy = usePageCopy();
  const copy = pageCopy.pricing!;
  const plans = Object.values(billingPlans);
  const language = locale === 'ru' ? 'ru' : 'en';

  const rows = [
    { heading: copy.categoryUsage },
    { label: copy.standard, values: plans.map(p => String(billingLimits(p).standardLetters)) },
    { label: copy.premium, values: plans.map(p => String(billingLimits(p).premiumLetters)) },
    ...(publicWorkflows.includes('research') ? [{ label: copy.research, values: plans.map(p => String(billingLimits(p).universityResearch)) }] : []),
    { heading: copy.categoryWriting },
    ...copy.features.flatMap((label,i)=> ((i===1 && !publicWorkflows.includes('university')) || (i===2 && !publicWorkflows.includes('email'))) ? [] : [{label,values:plans.map(()=>i===5 ? copy.noCredits : copy.included)}]),
    ...(publicWorkflows.includes('research') ? [{heading:copy.categoryResearch}, ...[copy.report,copy.sources,copy.searches].map(label=>({label,values:plans.map(()=>copy.planned)}))] : []),
  ];
  return <div className="space-y-14 sm:space-y-20">
    {pageCopy.pricingNotice && <p className="rounded-lg border border-border px-5 py-3 text-sm text-text-secondary">{pageCopy.pricingNotice}</p>}
    <div lang={language} dir="ltr" className="space-y-14 sm:space-y-20">
      <section className="mx-auto max-w-3xl pt-4 text-center sm:pt-8">
        <p className="eyebrow justify-center">{shell.pricing}</p>
        <h1 className="editorial-title mt-5">{copy.heading}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-secondary">{copy.intro}</p>
        <a href="#compare-plans" className="mt-6 inline-block text-sm font-semibold text-accent underline underline-offset-4">{copy.compare}</a>
      </section>
      <BillingPanel />
      <section id="compare-plans" className="scroll-mt-28">
        <h2 className="section-title">{copy.compare}</h2>
        <p className="mt-3 text-text-secondary">{copy.compareIntro}</p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-text-secondary">{copy.wallet}</p>
        <div className="mt-8 overflow-x-auto rounded-xl border border-border" tabIndex={0} aria-label={copy.compare}>
          <table className="w-full min-w-[650px] border-collapse text-start text-sm">
            <caption className="sr-only">{copy.compare}. {copy.wallet}</caption>
            <thead className="bg-card"><tr><th scope="col" className="p-5 text-start">{copy.flexible}</th>{plans.map(plan => <th key={plan.id} scope="col" className="p-5 text-start"><span className="text-base">{plan.name}</span><span className="mt-2 block font-normal text-text-secondary">${plan.price} · {copy.period}</span></th>)}</tr></thead>
            <tbody>{rows.map((row, i) => 'heading' in row ? <tr key={i} className="bg-card-secondary"><th scope="colgroup" colSpan={4} className="border-t border-border px-5 py-4 text-start font-semibold">{row.heading}</th></tr> : <tr key={i} className="border-t border-border"><th scope="row" className="p-5 text-start font-normal text-text-secondary">{row.label}</th>{row.values?.map((value, j) => <td key={j} className="p-5">{value === copy.included ? <span className="flex items-center gap-2"><Check size={15} aria-hidden="true" className="shrink-0 text-accent"/>{value}</span> : value}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><h2 className="section-title">{copy.faq}</h2><div>{copy.questions.filter((_,index)=>index!==2 || publicWorkflows.includes('research')).map(([question, answer]) => <details key={question} className="group border-b border-border"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-sm font-semibold">{question}<ChevronDown size={17} className="shrink-0 transition-transform group-open:rotate-180"/></summary><p className="pb-5 text-sm leading-7 text-text-secondary">{answer}</p></details>)}</div></section>
    </div>
  </div>;
}
