import React, { useEffect, useState, type ReactNode } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useLocale } from '../contexts/LocaleContext';
import { useGeneration } from '../contexts/GenerationContext';
import { interfaceCopy } from '../services/interfaceCopy';
export default function WorkspaceLayout({ leftPane, rightPane }: { leftPane: ReactNode; rightPane: ReactNode }) {
  const { locale } = useLocale();
  const { coverLetter } = useGeneration();
  const copy = interfaceCopy(locale);
  const [pane, setPane] = useState('details');
  useEffect(() => { if (coverLetter) setPane('draft'); }, [coverLetter]);
  return <Tabs.Root value={pane} onValueChange={setPane} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <Tabs.List aria-label={copy.workspace} className="mb-5 grid grid-cols-2 rounded-lg border border-border bg-card-secondary p-1 lg:hidden">
      <Tabs.Trigger value="details" className="rounded-md py-3 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">{copy.details}</Tabs.Trigger>
      <Tabs.Trigger value="draft" className="rounded-md py-3 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">{copy.draft}</Tabs.Trigger>
    </Tabs.List>
    <div className="workspace-grid grid items-start gap-7 lg:grid-cols-[1.05fr_1fr]">
      <Tabs.Content forceMount value="details" className="workspace-pane min-w-0 focus-visible:outline-none">{leftPane}</Tabs.Content>
      <Tabs.Content forceMount value="draft" className="workspace-pane min-w-0 focus-visible:outline-none lg:sticky lg:top-28">{rightPane}</Tabs.Content>
    </div>
  </Tabs.Root>;
}
