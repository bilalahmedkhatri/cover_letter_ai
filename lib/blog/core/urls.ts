import type { BlogConfig } from './types';

// Route params can reach metadata decoded and the page percent-encoded.
// Decode once at the route boundary, before enforcing the stored slug limit.
export function decodeBlogSlug(value: string): string | undefined {
  try {
    const slug = decodeURIComponent(value);
    if (!slug || slug.length > 200 || /[/\\\u0000-\u001f\u007f]/u.test(slug)) return;
    return slug;
  } catch { return; }
}

export function safeLink(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value || value.length > 2048 || /[\s\u0000-\u001f\u007f\\]/u.test(value)) return;
  if ((value.startsWith('/') && !value.startsWith('//')) || value.startsWith('#')) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch { /* Unsafe or invalid URLs are omitted. */ }
}

export function mediaUrl(value: unknown, origins: readonly string[]): string | undefined {
  const safe = safeLink(value);
  if (!safe?.startsWith('https://')) return;
  return origins.includes(new URL(safe).origin) ? safe : undefined;
}

export function youtubeUrl(value: unknown): string | undefined {
  const safe = safeLink(value);
  if (!safe?.startsWith('https://')) return;
  const url = new URL(safe);
  if (url.port && url.port !== '443') return;
  let id = '';
  if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
    else if (url.pathname.startsWith('/embed/')) id = url.pathname.slice(7);
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(id)) return `https://www.youtube.com/embed/${id}`;
}

export function blogPath(config: BlogConfig, locale: string, slug?: string): string {
  if (!config.locales.includes(locale)) throw new Error('Unsupported blog locale.');
  return config.routeBase(locale) + (slug === undefined ? '' : `/${encodeURIComponent(slug)}`);
}

export function blogUrl(config: BlogConfig, locale: string, slug?: string): string {
  return new URL(blogPath(config, locale, slug), config.origin).href;
}
