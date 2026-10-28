import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import { createBlogRepository } from './core/repository';
import { blogConfig } from './adapters/config';
import { blogDatabase } from './adapters/database';
import type { BlogListOptions } from './core/types';
import { decodeBlogSlug } from './core/urls';

const repository = () => createBlogRepository(blogDatabase, blogConfig());

// Request-scoped deduplication only; no stale published records or cached drafts.
const getDecodedBlogPost = cache(async (locale: string, slug: string) => {
  await connection();
  return repository().detail(locale, slug);
});

export function getBlogPost(locale: string, routeSlug: string) {
  const slug = decodeBlogSlug(routeSlug);
  return slug === undefined ? Promise.resolve(null) : getDecodedBlogPost(locale, slug);
}

export async function listBlogPosts(locale: string, options?: BlogListOptions) {
  await connection();
  return repository().list(locale, options);
}

export async function publishedBlogIndex() {
  await connection();
  return repository().publishedIndex();
}
