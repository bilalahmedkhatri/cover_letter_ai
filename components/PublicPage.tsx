import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { localeCodes, type Page } from '@/services/routing';
import type { Locale } from '@/types';
import { getPageCopy } from '@/lib/locale-data';
import { PageCopyProvider } from '@/contexts/PageCopyContext';
import PageArticle from './PageArticle';

export default function PublicPage({ page, locale: code, children }: { page: Page; locale: string; children: ReactNode }) {
  if (!localeCodes.includes(code as Locale)) notFound();
  const locale = code as Locale;
  return <main className="mx-auto max-w-screen-xl px-5 py-12 sm:px-8 lg:px-10">
    <PageCopyProvider value={getPageCopy(locale, page)}>{children}</PageCopyProvider>
    <PageArticle page={page} locale={locale}/>
  </main>;
}
