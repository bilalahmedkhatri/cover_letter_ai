import { notFound } from 'next/navigation';
import { localeCodes } from '@/services/routing';
import { pageMetadata } from '@/lib/page-metadata';
import { listBlogPosts } from '@/lib/blog/data';
import { BlogPagination, BlogPreview } from '@/lib/blog/adapters/ui';
import { getBlogCopy } from '@/lib/blog/adapters/copy';
import type { Locale } from '@/types';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export const generateMetadata = ({ params }: Props) => pageMetadata(params, '/blog');

export default async function Blog({ params, searchParams }: Props) {
  const { locale: code } = await params;
  if (!localeCodes.includes(code as Locale)) notFound();
  const locale = code as Locale;
  const copy = getBlogCopy(locale);
  const query = await searchParams;
  const page = typeof query.page === 'string' && /^\d{1,5}$/.test(query.page) ? Number(query.page) : 1;
  const category = typeof query.category === 'string' ? query.category : undefined;
  const result = await listBlogPosts(locale, { page, category, pageSize: 12 });
  return <div className="space-y-12">
    <header className="max-w-5xl"><h1 className="editorial-title mt-4">{copy.title}</h1><p className="mt-6 text-lg leading-8 text-text-secondary">{copy.intro}</p></header>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.posts.map(post => <BlogPreview key={post.id} post={post} />)}</div>
    {!result.posts.length && <p className="rounded-lg border border-border bg-card p-4 text-sm text-text-secondary">{copy.empty}</p>}
    <BlogPagination locale={locale} page={result.page} hasNext={result.hasNext} category={category} totalPages={result.totalPages} />
  </div>;
}
