import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{blogPosts.map(post => <Card key={post.slug}>
      <CardHeader lang="en" dir="ltr"><Badge variant="secondary" className="w-fit">{post.category}</Badge><CardTitle><h2 className="mt-3 text-xl leading-8"><Link href={localizedPath(locale, `/blog/${post.slug}`)} className="hover:text-accent">{post.title}</Link></h2></CardTitle><CardDescription className="leading-7">{post.intro}</CardDescription></CardHeader>
      <CardFooter className="mt-auto"><Button asChild variant="outline"><Link href={localizedPath(locale, `/blog/${post.slug}`)}>{copy.read}<span className="sr-only">: {post.title}</span></Link></Button></CardFooter>
    </Card>)}</div>
  </div>;
}
