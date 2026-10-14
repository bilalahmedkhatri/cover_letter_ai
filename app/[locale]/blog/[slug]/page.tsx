import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageArticle from '@/components/PageArticle';
import { Button } from '@/components/ui/button';
import { blogCopy, blogPosts, findBlogPost } from '@/services/blogContent.mjs';
import { localizedPath, localeCodes, type Page } from '@/services/routing';
import { pageMetadata } from '@/lib/page-metadata';
import type { Locale } from '@/types';
import { articleSections } from '@/services/pageArticles.mjs';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (!findBlogPost(slug)) notFound();
  return pageMetadata(params, `/blog/${slug}`);
}
export default async function BlogArticle({ params }: Props) {
  const { locale: code, slug } = await params;
  const post = findBlogPost(slug);
  if (!post || !localeCodes.includes(code as Locale)) notFound();
  const locale = code as Locale;
  const copy = blogCopy[locale];
  const sections = articleSections('/guides');
  const article = { ...post, sections: post.ids.map(id => sections.find(section => section.id === id)) };
  return <>
    <PageArticle post={article}/>
    <section className="mx-auto mt-12 max-w-4xl space-y-6 border-t border-border pt-8">
      <Button asChild><Link href={localizedPath(locale, post.action as Page)}>{copy.write}</Link></Button>
      <h2 className="section-title">{copy.related}</h2>
      <ul className="space-y-4" lang="en" dir="ltr">{blogPosts.filter(item => item.slug !== slug).map(item => <li key={item.slug}><Link href={localizedPath(locale, `/blog/${item.slug}`)} className="text-accent underline underline-offset-4">{item.title}</Link></li>)}</ul>
    </section>
  </>;
}
