import { assetIds, assetUrls, validateDocument } from './document';
import { isoDate, mapAsset, mapPost } from './mapping';
import { BlogUnavailableError, type AssetRow, type BlogConfig, type BlogDetail, type BlogExecutor, type BlogListOptions, type BlogPage, type PostRow, type PublishedBlogLink } from './types';

const projection = `p.id, p.locale, p.title, p.slug, p.excerpt, p.content_schema_version,
 p.metadata_json, p.author_name, p.author_designation, p.author_avatar_url, p.author_description,
 p.published_at, p.updated_at, c.name AS category_name, c.slug AS category_slug,
 CASE WHEN a.id IS NULL THEN NULL ELSE jsonb_build_object(
  'id', a.id, 'public_url', a.public_url, 'media_type', a.media_type,
  'original_filename', a.original_filename, 'alt_text', a.alt_text,
  'caption', a.caption, 'width', a.width, 'height', a.height) END AS cover`;
const joins = `FROM public.blog_posts p
 LEFT JOIN public.blog_categories c ON c.id = p.category_id
 LEFT JOIN public.blog_assets a ON a.id = p.cover_asset_id`;
const assetProjection = 'id, public_url, media_type, original_filename, alt_text, caption, width, height';

// No framework, driver, environment or UI imports in this module. Only SQL
// identifiers above are interpolated; all request inputs remain parameters.
export function createBlogRepository(db: BlogExecutor, config: BlogConfig) {
  const supported = (locale: string) => config.locales.includes(locale);
  return {
    async list(locale: string, options: BlogListOptions = {}): Promise<BlogPage> {
      const page = Number.isSafeInteger(options.page) ? Math.max(1, Math.min(config.maxPage, options.page!)) : 1;
      const size = Number.isSafeInteger(options.pageSize) ? Math.max(1, Math.min(config.maxPageSize, options.pageSize!)) : config.pageSize;
      if (!supported(locale)) return { posts: [], page, hasNext: false };
      if (options.category !== undefined && (options.category.length > 160 || !options.category)) return { posts: [], page, hasNext: false };
      // Fixed SQL choices only: latest-added related articles use creation time;
      // the main listing retains the established publication-time order.
      const order = options.sort === 'created' ? 'p.created_at DESC, p.id DESC' : 'p.published_at DESC, p.id DESC';
      const rows = await db.query<PostRow & { total_count: string | number }>(`SELECT ${projection}, COUNT(*) OVER() AS total_count ${joins}
        WHERE p.status = 'published' AND p.locale = $1
        AND ($2::text IS NULL OR c.slug = $2) AND ($3::integer IS NULL OR p.id <> $3)
        ORDER BY ${order} LIMIT $4 OFFSET $5`,
      [locale, options.category ?? null, options.excludeId ?? null, size + 1, (page - 1) * size]);
      const totalPages = rows.length ? Math.min(config.maxPage, Math.ceil(Number(rows[0].total_count) / size)) : page;
      return { posts: rows.slice(0, size).map(mapPost), page, hasNext: rows.length > size && page < config.maxPage, totalPages };
    },

    async detail(locale: string, slug: string): Promise<BlogDetail | null> {
      if (!supported(locale) || !slug || slug.length > 200) return null;
      const rows = await db.query<PostRow>(`SELECT ${projection}, p.content_json ${joins}
        WHERE p.status = 'published' AND p.locale = $1 AND p.slug = $2 LIMIT 1`, [locale, slug]);
      if (!rows[0]) return null;
      const post = mapPost(rows[0]);
      const document = validateDocument(post.content, post.contentSchemaVersion);
      const ids = assetIds(document);
      const urls = assetUrls(document);
      // Standard editor image/audio nodes have URLs, custom nodes have local
      // IDs. Both must resolve to an actual asset in this application's DB.
      // Recheck publication while resolving media after the initial query.
      const assets = (ids.length || urls.length) ? await db.query<AssetRow>(`SELECT ${assetProjection}
        FROM public.blog_assets WHERE (id = ANY($1::integer[]) OR public_url = ANY($2::text[]))
        AND EXISTS (SELECT 1 FROM public.blog_posts WHERE id = $3 AND status = 'published' AND locale = $4 AND slug = $5)`,
      [ids, urls, post.id, locale, slug]) : [];
      return { post, document, assets: assets.map(mapAsset) };
    },

    async publishedIndex(): Promise<PublishedBlogLink[]> {
      const rows = await db.query<{ locale: string; slug: string; updated_at: string | Date }>(
        "SELECT locale, slug, updated_at FROM public.blog_posts WHERE status = 'published' AND locale = ANY($1::text[]) ORDER BY published_at DESC, id DESC LIMIT 45001", [[...config.locales]]);
      if (rows.length > 45000) throw new BlogUnavailableError('BLOG_SITEMAP_SPLIT_REQUIRED');
      return rows.map(row => ({ locale: row.locale, slug: row.slug, updatedAt: isoDate(row.updated_at) }));
    },
  };
}
