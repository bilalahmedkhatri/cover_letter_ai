import { notFound } from 'next/navigation';
import PageArticle from '@/components/PageArticle';
import { findBlogPost } from '@/services/blogContent.mjs';
import { localizedPath, localeCodes, type Page } from '@/services/routing';
import type { Locale } from '@/types';
import { canUseWorkflow } from '@/server/feature-access.mjs';
import { requestIdentity } from '@/lib/auth/access';
import { getBlogPost, listBlogPosts } from '@/lib/blog/data';
import { blogConfig } from '@/lib/blog/adapters/config';
import { blogPostMetadata } from '@/lib/blog/adapters/seo';
import { getBlogCopy } from '@/lib/blog/adapters/copy';
import { articleStyles, BlogByline, BlogCover, BlogPreview, BlogPostMetadata, BlogTableOfContents } from '@/lib/blog/adapters/ui';
import { BlogContent } from '@/lib/blog/core/renderer';
import { postSeo, serializeJsonLd } from '@/lib/blog/core/seo';
import { BlogWritingHelp } from '@/lib/blog/adapters/sidebar';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  if (!localeCodes.includes(locale as Locale)) notFound();
  const result = await getBlogPost(locale, slug);
  if (!result) notFound();
  return blogPostMetadata(result.post);
}

export default async function BlogArticle({ params }: Props) {
  const { locale: code, slug } = await params;
  if (!localeCodes.includes(code as Locale)) notFound();
  const locale = code as Locale;
  const result = await getBlogPost(locale, slug);
  if (!result) notFound();
  const { post, document, assets } = result;
  const copy = getBlogCopy(locale);
  const config = blogConfig();
  // Retain existing CTA access checks for legacy workflow-specific slugs.
  // New articles use the already-public cover-letter workflow.
  const action = findBlogPost(slug)?.action || '/dashboard';
  const workflow = action === '/dashboard' ? 'cover-letter' : action.split('/').pop()!;
  const [related, identity] = await Promise.all([
    post.category ? listBlogPosts(locale, { pageSize: 4, excludeId: post.id, category: post.category.slug, sort: 'created' }) : Promise.resolve({ posts: [], page: 1, hasNext: false }), requestIdentity(),
  ]);
  const enabled = canUseWorkflow(workflow, identity);
  const article = {
    title: post.title, intro: post.excerpt,
    sections: [],
  };
  const seo = postSeo(post, config);
  return <>
    <script id="blog-article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(seo.structuredData) }} />
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <aside className="space-y-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1" lang={locale}>
      <BlogTableOfContents document={document} locale={locale} sidebar />
      {enabled && <BlogWritingHelp locale={locale} label={copy.write} href={localizedPath(locale, action as Page)} />}
    </aside>
    <div className="min-w-0 lg:col-start-1 lg:row-start-1">
    <PageArticle post={article} locale={locale} contentLocale={locale} contentsLabel={copy.contents}
      headerContent={<><BlogPostMetadata post={post} locale={locale} document={document} /><BlogCover post={post} priority /></>}
      tableOfContents={false}>
      <BlogContent document={document} schemaVersion={post.contentSchemaVersion} assets={assets}
        mediaOrigins={config.mediaOrigins} styles={articleStyles} labels={copy} />
      <BlogByline post={post} />
    </PageArticle>
    </div>
    </div>
    {related.posts.length > 0 && <section aria-labelledby="related-guides" className="mt-12 space-y-8 border-t border-border pt-8">
      <h2 id="related-guides" className="section-title">{copy.latestRelated}</h2>
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {related.posts.map(item => <BlogPreview key={item.id} post={item} editorial />)}
      </div>
    </section>}
  </>;
}
