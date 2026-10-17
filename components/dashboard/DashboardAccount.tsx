'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from '@/contexts/AccountContext';
import { useLocale } from '@/contexts/LocaleContext';
import { accountRequest } from '@/services/authClient';
import { publicWorkflows } from '@/services/workflow.mjs';

type Summary = {
  profile: { name: string; skills: string; experience: string };
  account: null | { active: boolean; plan: string; credits: number; remaining: {standardLetters:number;premiumLetters:number;universityResearch:number} };
};
const Context = createContext<{ data: Summary | null; refresh: () => Promise<void>; workflows: readonly string[] }>({ data: null, refresh: async () => {}, workflows: publicWorkflows });
export const useDashboardAccount = () => useContext(Context);

export default function DashboardAccount({ children, workflows }: { children: ReactNode; workflows: string[] }) {
  const { user } = useAccount();
  const { locale } = useLocale();
  const pathname = usePathname();
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState(false);
  const plan = data?.account?.active ? data.account.plan : 'Free';
  const refresh = useCallback(async () => {
    try { setData(await accountRequest()); setError(false); }
    catch { setError(true); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh, user?.id, pathname]);
  return <Context.Provider value={{ data, refresh, workflows }}>
    <div aria-label="Subscription and credits" className="mx-auto mb-6 flex min-h-5 w-full max-w-7xl justify-end text-sm">
      {error ? <span role="status" aria-label="Plan unavailable">—</span> : data ?
        <Link href={`/${locale}/dashboard/billing`} className="font-medium">{plan.charAt(0).toUpperCase() + plan.slice(1)} {data.account?.active ? data.account.credits : 0} Credits</Link>
      : null}
    </div>
    {children}
  </Context.Provider>;
}
