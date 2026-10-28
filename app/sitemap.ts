import type { MetadataRoute } from "next";
import { canonicalPublicPages } from '../services/routing.ts';
import { publishedBlogIndex } from '@/lib/blog/data';
import { blogConfig } from '@/lib/blog/adapters/config';
import { blogUrl } from '@/lib/blog/core/urls';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = blogConfig();
  const posts = await publishedBlogIndex();
  return [
    ...canonicalPublicPages().map(({url})=>({url})),
    ...posts.map(post => ({ url: blogUrl(config, post.locale, post.slug), lastModified: post.updatedAt })),
  ];
}
