import { notFound } from 'next/navigation';
import { ContentCard } from '@/components/ui/content-card';
import { blogCopy, blogPosts } from '@/services/blogContent.mjs';
import { localeCodes, localizedPath } from '@/services/routing';
import { pageMetadata } from '@/lib/page-metadata';
import type { Locale } from '@/types';
type Props = { params: Promise<{ locale: string }> };
export const generateMetadata = ({ params }: Props) => pageMetadata(params, '/blog');
export default async function Blog({ params }: Props) {
  const { locale: code } = await params;
  if (!localeCodes.includes(code as Locale)) notFound();
  const locale = code as Locale;
  const copy = blogCopy[locale];
  return <div className="space-y-12">
    <header className="max-w-3xl"><p className="eyebrow">{copy.label}</p><h1 className="editorial-title mt-4">{copy.title}</h1><p className="mt-6 text-lg leading-8 text-text-secondary">{copy.intro}</p></header>
    {copy.notice && <p className="rounded-lg border border-border bg-card p-4 text-sm text-text-secondary">{copy.notice}</p>}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{blogPosts.map(post => <ContentCard key={post.slug} href={localizedPath('en', `/blog/${post.slug}`)} title={post.title} category={post.category} description={post.intro} actionLabel={copy.read} contentLang="en" />)}</div>
  </div>;
}
