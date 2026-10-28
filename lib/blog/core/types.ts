import type { DocNode } from './document';

export type JsonObject = Record<string, unknown>;

export interface BlogAsset {
  id: number;
  publicUrl: string;
  mediaType: string;
  filename: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
}

export interface BlogPost {
  id: number;
  locale: string;
  title: string;
  slug: string;
  excerpt: string;
  category: { name: string; slug: string } | null;
  author: { name: string; designation: string | null; avatarUrl: string | null; description: string | null };
  cover: BlogAsset | null;
  publishedAt: string;
  updatedAt: string;
  metadata: JsonObject;
  content?: unknown;
  contentSchemaVersion: number;
}

export interface BlogConfig {
  origin: string;
  locales: readonly string[];
  routeBase: (locale: string) => string;
  mediaOrigins: readonly string[];
  pageSize: number;
  maxPageSize: number;
  maxPage: number;
}

export interface BlogExecutor {
  query<T>(statement: string, values?: unknown[]): Promise<T[]>;
}

export interface BlogListOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  excludeId?: number;
  sort?: 'published' | 'created';
}

export interface BlogPage { posts: BlogPost[]; page: number; hasNext: boolean }
export interface BlogDetail { post: BlogPost; document: DocNode | null; assets: BlogAsset[] }
export interface PublishedBlogLink { locale: string; slug: string; updatedAt: string }

export class BlogUnavailableError extends Error {
  constructor(readonly code = 'BLOG_UNAVAILABLE') {
    super('Blog content is temporarily unavailable.');
    this.name = 'BlogUnavailableError';
  }
}

export interface PostRow {
  id: number; locale: string; title: string; slug: string; excerpt: string;
  category_name: string | null; category_slug: string | null;
  author_name: string; author_designation: string | null; author_avatar_url: string | null; author_description: string | null;
  published_at: Date | string; updated_at: Date | string;
  metadata_json: JsonObject; content_json?: unknown; content_schema_version: number;
  cover: AssetRow | null;
}

export interface AssetRow {
  id: number; public_url: string; media_type: string; original_filename: string;
  alt_text: string; caption: string | null; width: number | null; height: number | null;
}
