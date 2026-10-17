import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageArticle from '@/components/PageArticle';
import { Button } from '@/components/ui/button';
import { ContentCard } from '@/components/ui/content-card';
import { blogCopy, blogPosts, findBlogPost } from '@/services/blogContent.mjs';
import { localizedPath, localeCodes, type Page } from '@/services/routing';
import { pageMetadata } from '@/lib/page-metadata';
import type { Locale } from '@/types';
import { articleSections, articleReadingMinutes } from '@/services/pageArticles.mjs';
import { canUseWorkflow } from '@/server/feature-access.mjs';
import { requestIdentity } from '@/lib/auth/access';
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
  const article = { ...post, sections: articleSections(post.ids) };
  const enabled=canUseWorkflow(post.action === '/dashboard' ? 'cover-letter' : post.action.split('/').pop()!,await requestIdentity());
  return <>
    <PageArticle post={article}/>
    {enabled && <div className="mx-auto mt-12 max-w-4xl"><Button asChild><Link href={localizedPath(locale, post.action as Page)}>{copy.write}</Link></Button></div>}
    <section aria-labelledby="related-guides" className="mt-12 space-y-8 border-t border-border pt-8">
      <h2 id="related-guides" className="section-title">{copy.related}</h2>
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4" lang="en" dir="ltr">{blogPosts.filter(item => item.slug !== slug).map(item => <ContentCard key={item.slug} href={localizedPath('en', `/blog/${item.slug}`)} title={item.title} category={item.category} metadata={`${articleReadingMinutes(item.ids)} min read`} headingLevel={3} variant="editorial" />)}</div>
    </section>
  </>;
}
