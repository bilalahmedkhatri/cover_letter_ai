import type { BlogConfig, BlogPost } from './types';
import { blogUrl, mediaUrl } from './urls';

const text = (value: unknown, fallback: string, max: number) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback.slice(0, max);

export function postSeo(post: BlogPost, config: BlogConfig) {
  const expected = blogUrl(config, post.locale, post.slug);
  let canonical = expected;
  try {
    const stored = new URL(String(post.metadata.canonical_url));
    if (stored.href === expected && !stored.username && !stored.password) canonical = stored.href;
  } catch { /* Missing/untrusted canonical is regenerated from application config. */ }
  const title = text(post.metadata.title, post.title, 300);
  const description = text(post.metadata.description, post.excerpt, 320);
  const image = post.cover?.mediaType.startsWith('image/') && post.cover.mediaType !== 'image/svg+xml'
    ? mediaUrl(post.cover.publicUrl, config.mediaOrigins) : undefined;
  const avatar = mediaUrl(post.author.avatarUrl, config.mediaOrigins);
  return {
    title, description, canonical, image,
    structuredData: {
      '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': `${canonical}#article`,
      headline: post.title, description, inLanguage: post.locale, mainEntityOfPage: canonical,
      datePublished: post.publishedAt, dateModified: post.updatedAt,
      author: { '@type': 'Person', name: post.author.name,
        ...(post.author.designation ? { jobTitle: post.author.designation } : {}),
        ...(post.author.description ? { description: post.author.description } : {}),
        ...(avatar ? { image: avatar } : {}),
      },
      ...(image ? { image: [image] } : {}),
    },
  };
}

export const serializeJsonLd = (value: Record<string, unknown>) => JSON.stringify(value)
  .replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
