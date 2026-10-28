import 'server-only';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/page-metadata';
import type { BlogPost } from '../core/types';
import { postSeo } from '../core/seo';
import { blogConfig } from './config';

export async function blogPostMetadata(post: BlogPost): Promise<Metadata> {
  const base = await pageMetadata(Promise.resolve({ locale: post.locale }), '/blog');
  const seo = postSeo(post, blogConfig());
  const images = seo.image ? [{ url: seo.image, alt: post.cover?.alt || post.title }] : [];
  return {
    ...base,
    title: { absolute: seo.title }, description: seo.description,
    alternates: { canonical: seo.canonical },
    authors: [{ name: post.author.name }],
    openGraph: { ...base.openGraph, type: 'article', title: seo.title, description: seo.description,
      url: seo.canonical, publishedTime: post.publishedAt, modifiedTime: post.updatedAt,
      authors: [post.author.name], images,
    },
    twitter: { card: seo.image ? 'summary_large_image' : 'summary', title: seo.title, description: seo.description, images },
  };
}

