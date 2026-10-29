import type { Locale } from '../types';

export const siteOrigin = 'https://ailettergen.com';
export const localeCodes: Locale[] = ['en', 'es', 'fr', 'ru', 'nl', 'pt', 'ar'];
export const publicPages = ['/', '/about', '/privacy', '/terms', '/pricing', '/features', '/guides', '/compare', '/blog', '/guest-post'] as const;
export const accountPages = ['/login', '/account'] as const;
export const dashboardPages = ['/dashboard','/dashboard/university','/dashboard/research','/dashboard/email','/dashboard/settings','/dashboard/billing','/dashboard/cover-letter/result','/dashboard/university/result','/dashboard/email/result','/dashboard/research/result'] as const;
export const allPages = [...publicPages, ...accountPages, ...dashboardPages];
export type Page = typeof allPages[number] | `/blog/${string}` | '/404';

export function localizedPath(locale: Locale, page: Page): string {
  return `/${locale}${page === '/' ? '' : page}`;
}

export function resolveRoute(pathname: string): { locale: Locale; page: Page; path: string } {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const parts = normalized.split('/').slice(1);
  const hasLocale = localeCodes.includes(parts[0] as Locale);
  const locale = hasLocale ? parts[0] as Locale : 'en';
  const pagePath = hasLocale ? '/' + parts.slice(1).join('/') : normalized;
  // Shape recognition only. Published membership is enforced by server DB reads,
  // never by a client-side slug allowlist or by a matching slug in another locale.
  const blogArticle = /^\/blog\/[^/]+$/.test(pagePath);
  const page = blogArticle || allPages.includes(pagePath as typeof allPages[number]) ? pagePath as Page : '/404';
  // Preserve unknown URLs so the browser can show the actual missing address.
  return { locale, page, path: page === '/404' ? pathname : localizedPath(locale, page) };
}

// Index only pages whose primary content is available in the requested language.
export function contentLocales(page: Page): Locale[] {
  if (page.startsWith('/blog/')) return []; // Per-record locale, resolved on the server.
  if (page === '/terms' || page === '/guest-post') return ['en'];
  if (['/pricing','/features'].includes(page)) return ['en','ru'];
  return localeCodes;
}
export function canonicalLocale(locale: Locale,page: Page): Locale { return contentLocales(page).includes(locale) ? locale : 'en'; }
export function canonicalPublicPages() {
  return publicPages.flatMap(page=>contentLocales(page).map(locale=>({locale,page,url:siteOrigin+localizedPath(locale,page)})));
}
