'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AccountProvider, useAccount } from '@/contexts/AccountContext';
import { FormStateProvider } from '@/contexts/FormStateContext';
import { GenerationProvider } from '@/contexts/GenerationContext';

// The root layout survives locale navigation: keep personal state and the session
// here, while locale-specific dictionaries stay in the changing locale layout.
export default function WorkspaceProviders({ children }: { children: ReactNode }) {
  return <AccountProvider><PersonalWorkspace>{children}</PersonalWorkspace></AccountProvider>;
}
function PersonalWorkspace({ children }: { children: ReactNode }) {
  const { scope } = useAccount();
  const router = useRouter();
  useEffect(() => {
    // Revalidate server-rendered access/workflow grants after an identity change.
    if (scope > 0) router.refresh();
  }, [scope, router]);
  return <FormStateProvider key={scope}><GenerationProvider>{children}</GenerationProvider></FormStateProvider>;
}
