'use client';
import { usePageCopy } from '@/contexts/PageCopyContext';

export function useDashboardCopy() {
  const { dashboard } = usePageCopy();
  if (!dashboard) throw new Error('Dashboard copy must be supplied by the dashboard layout.');
  return (text: string) => dashboard[text] ?? text;
}
