import type { Locale } from '../types';
import { blogPosts } from './blogContent.mjs';

export const siteOrigin = 'https://ailettergen.com';
export const localeCodes: Locale[] = ['en', 'es', 'fr', 'ru', 'nl', 'pt', 'ar'];
export const publicPages = ['/', '/about', '/privacy', '/terms', '/pricing', '/features', '/guides', '/compare', '/blog'] as const;
export const accountPages = ['/login', '/account'] as const;
export const dashboardPages = ['/dashboard','/dashboard/cover-letter','/dashboard/university','/dashboard/email','/dashboard/drafts','/dashboard/settings','/dashboard/billing','/dashboard/feedback'] as const;
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
  const blogArticle = blogPosts.some(post => pagePath === '/blog/' + post.slug);
  const page = blogArticle || allPages.includes(pagePath as typeof allPages[number]) ? pagePath as Page : '/404';
  // Preserve unknown URLs so the browser can show the actual missing address.
  return { locale, page, path: page === '/404' ? pathname : localizedPath(locale, page) };
}
