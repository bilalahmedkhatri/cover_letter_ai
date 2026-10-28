import 'server-only';
import { localeCodes, siteOrigin } from '@/services/routing';
import { BlogUnavailableError, type BlogConfig } from '../core/types';

export function blogConfig(): BlogConfig {
  const mediaOrigins = (process.env.BLOG_MEDIA_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean).map(value => {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
      return url.origin;
    } catch { throw new BlogUnavailableError('BLOG_MEDIA_CONFIGURATION_INVALID'); }
  });
  return {
    origin: siteOrigin,
    locales: localeCodes,
    routeBase: locale => `/${locale}/blog`,
    mediaOrigins,
    pageSize: 12,
    maxPageSize: 48,
    maxPage: 10000,
  };
}
