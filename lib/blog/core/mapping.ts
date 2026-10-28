import { BlogUnavailableError, type AssetRow, type BlogAsset, type BlogPost, type PostRow } from './types';

export function isoDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new BlogUnavailableError('BLOG_INVALID_TIMESTAMP');
  return date.toISOString();
}

export function mapAsset(row: AssetRow): BlogAsset {
  return { id: row.id, publicUrl: row.public_url, mediaType: row.media_type.split(';', 1)[0].trim().toLowerCase(), filename: row.original_filename,
    alt: row.alt_text, caption: row.caption, width: row.width, height: row.height };
}

export function mapPost(row: PostRow): BlogPost {
  return {
    id: row.id, locale: row.locale, title: row.title, slug: row.slug, excerpt: row.excerpt,
    category: row.category_name ? { name: row.category_name, slug: row.category_slug! } : null,
    author: { name: row.author_name, designation: row.author_designation, avatarUrl: row.author_avatar_url, description: row.author_description },
    cover: row.cover ? mapAsset(row.cover) : null,
    publishedAt: isoDate(row.published_at), updatedAt: isoDate(row.updated_at),
    metadata: row.metadata_json || {}, contentSchemaVersion: row.content_schema_version,
    ...(row.content_json === undefined ? {} : { content: row.content_json }),
  };
}
