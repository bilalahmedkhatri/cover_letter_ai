import type { Locale } from '../types';

export const siteOrigin = 'https://ailettergen.com';
export const localeCodes: Locale[] = ['en', 'es', 'fr', 'ru', 'nl', 'pt', 'ar'];
export const publicPages = ['/', '/dashboard', '/about', '/privacy', '/terms', '/pricing', '/features', '/guides', '/compare'] as const;
export type Page = typeof publicPages[number] | '/404';

export function localizedPath(locale: Locale, page: Page): string {
  return `/${locale}${page === '/' ? '' : page}`;
}

export function resolveRoute(pathname: string): { locale: Locale; page: Page; path: string } {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const parts = normalized.split('/').slice(1);
  const hasLocale = localeCodes.includes(parts[0] as Locale);
  const locale = hasLocale ? parts[0] as Locale : 'en';
  const pagePath = hasLocale ? '/' + parts.slice(1).join('/') : normalized;
  const page = publicPages.includes(pagePath as typeof publicPages[number]) ? pagePath as Page : '/404';
  // Preserve unknown URLs so the browser can show the actual missing address.
  return { locale, page, path: page === '/404' ? pathname : localizedPath(locale, page) };
}
