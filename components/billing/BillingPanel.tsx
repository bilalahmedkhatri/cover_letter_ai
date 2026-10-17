import {publicWorkflows} from '@/services/workflow.mjs';
import React, { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { billingPlans, billingLimits } from '../../services/billingPlans.mjs';
import { billingCopy } from '../../services/billingCopy';
import { pricingCopy } from '../../services/pricingCopy';
import { localizedPath } from '../../services/routing';
import { Button } from '../ui/button';
import { useAccount } from '../../contexts/AccountContext';

type Order = { id: string; plan: string; status: string; invoiceUrl: string | null; fulfilledAt: number | null };
type Billing = { ready: boolean; checkoutEnabled: boolean; sandbox?: boolean;
  account: null | { credits: number; expiresAt: number; active: boolean; remaining?: { standardLetters: number; premiumLetters: number; universityResearch: number } }; order: Order | null };
const waiting = new Set(['creating', 'waiting', 'confirming', 'confirmed', 'sending']);

export default function BillingPanel({ compact = false }: { compact?: boolean }) {
  const { locale } = useLocale();
  const { user } = useAccount();
  const copy = billingCopy(locale);
  const pricing = pricingCopy(locale);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [cancelled, setCancelled] = useState(false);
  const orderId = useRef<string | null>(null);
  const requests = useRef<Record<string, string>>({});
  const alive = useRef(false);
  const polls = useRef(0);

  async function refresh(signal?: AbortSignal) {
    const response = await fetch('/api/billing/status' + (orderId.current ? '?order=' + encodeURIComponent(orderId.current) : ''), { cache: 'no-store', credentials: 'same-origin', signal });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || copy.retry);
    if (alive.current) { setBilling(result); setError(''); }
  }
  useEffect(() => {
    alive.current = true;
    const query = new URLSearchParams(window.location.search);
    const value = query.get('billingOrder');
    orderId.current = value && /^[a-f0-9]{64}$/.test(value) ? value : null;
    setCancelled(query.get('billingCancelled') === '1');
    const controller = new AbortController();
    refresh(controller.signal).catch(error => { if (alive.current && !controller.signal.aborted) setError(error instanceof Error ? error.message : copy.retry); });
    return () => { alive.current = false; controller.abort(); };
  }, [user?.id]);
  useEffect(() => {
    if (!billing?.order || !waiting.has(billing.order.status) || polls.current >= 18) return;
    const controller = new AbortController();
    // Bounded polling is only a UI convenience; signed IPNs drive durable fulfilment.
    const timeout = window.setTimeout(() => { polls.current += 1; refresh(controller.signal).catch(() => {
      if (alive.current && !controller.signal.aborted) setError(copy.retry);
    }); }, 10000);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [billing]);

  async function checkout(plan: string) {
    if (busy) return;
    setBusy(plan); setError('');
    try {
      requests.current[plan] ||= crypto.randomUUID();
      if (!user) { window.location.assign(localizedPath(locale, '/login')); return; }
      const response = await fetch('/api/billing/checkout', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, locale, requestId: requests.current[plan] }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || copy.retry);
      const url = new URL(result.order.invoiceUrl);
      if (url.protocol !== 'https:' || !['nowpayments.io', 'sandbox.nowpayments.io'].includes(url.hostname)) throw new Error(copy.retry);
      window.location.assign(url.href);
    } catch (err) { if (alive.current) setError(err instanceof Error ? err.message : copy.retry); }
    finally { if (alive.current) setBusy(null); }
  }
  const order = billing?.order;
  return <section id="pricing" className="scroll-mt-28 space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
    <div><h2 className="section-title">{compact ? pricing.statusTitle : copy.title}</h2></div>
    {billing?.sandbox && <p className="text-sm font-semibold">{copy.sandbox}</p>}
    {!billing?.checkoutEnabled && <p className="text-sm text-text-secondary">{copy.unavailable}</p>}
    {compact ? <Button asChild variant="outline"><a href={localizedPath(locale, '/pricing')}>{pricing.view}</a></Button> : <div className="grid gap-5 md:grid-cols-3">
      {Object.values(billingPlans).map((plan, index) => <article key={plan.id} className={`flex flex-col rounded-xl border p-6 sm:p-7 ${plan.id === 'plus' ? 'border-accent bg-card-secondary' : 'border-border'}`}>
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        <p className="mt-3 min-h-12 text-sm leading-6 text-text-secondary">{pricing.audiences[index]}</p>
        <p className="mt-6 text-5xl font-semibold tracking-tight">${plan.price}</p>
        <p className="mt-2 text-sm text-text-secondary">USD · {pricing.period}</p>

        <ul className="mt-4 space-y-3 text-sm text-text-secondary">
          <li>{pricing.upTo} {billingLimits(plan).standardLetters} {pricing.standard.toLowerCase()}</li>
          <li>{pricing.or} {billingLimits(plan).premiumLetters} {pricing.premium.toLowerCase()}</li>
          {publicWorkflows.includes('research') && <li>{pricing.or} {billingLimits(plan).universityResearch} {pricing.research.toLowerCase()}</li>}
        </ul>
        <p className="mt-5 text-xs leading-5 text-text-muted">{pricing.wallet}</p>

        <Button className="mt-6 w-full" disabled={!billing?.checkoutEnabled || Boolean(busy)} onClick={() => checkout(plan.id)}>
          {busy === plan.id ? copy.creating : billing?.checkoutEnabled ? copy.buy : (locale === 'ru' ? 'Скоро' : 'Coming soon')}
        </Button>
      </article>)}
    </div>}
    <div aria-live="polite" className="space-y-3 text-sm">
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {cancelled && !order?.fulfilledAt && <p>{copy.cancelled}</p>}
      {order && <>
        <p>{order.fulfilledAt ? copy.paid : waiting.has(order.status) ? copy.pending : copy.terminal}</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled={busy === 'refresh'} onClick={async () => {
            setBusy('refresh'); try { await refresh(); } catch { setError(copy.retry); } finally { setBusy(null); }
          }}>{copy.refresh}</Button>
          {!order.fulfilledAt && waiting.has(order.status) && order.invoiceUrl && <Button asChild variant="outline"><a href={order.invoiceUrl}>{copy.resume}</a></Button>}
        </div>
        {compact && <p className="break-all text-xs text-text-muted">Order: {order.id}</p>}
      </>}
      {billing?.account && <div><p>{billing.account.active ? pricing.statusTitle : copy.expired}{' · '}{new Date(billing.account.expiresAt).toLocaleDateString(locale)}</p>
        {billing.account.active && billing.account.remaining && <p className="mt-2">{pricing.upTo} {billing.account.remaining.standardLetters} {pricing.standard.toLowerCase()} {pricing.or} {billing.account.remaining.premiumLetters} {pricing.premium.toLowerCase()} {publicWorkflows.includes('research') && <>{pricing.or} {billing.account.remaining.universityResearch} {pricing.research.toLowerCase()}</>}</p>}
      </div>}
    </div>

  </section>;
}
