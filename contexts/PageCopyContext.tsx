'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { PageCopy } from '@/services/locale-data';

const PageCopyContext = createContext<PageCopy | null>(null);
export function PageCopyProvider({ value, children }: { value: PageCopy; children: ReactNode }) {
  return <PageCopyContext.Provider value={value}>{children}</PageCopyContext.Provider>;
}
export function usePageCopy() {
  const copy = useContext(PageCopyContext);
  if (!copy) throw new Error('Page copy must be supplied by its server route.');
  return copy;
}
export function useOptionalPageCopy() {
  return useContext(PageCopyContext);
}
