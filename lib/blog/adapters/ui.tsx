import 'server-only';
import Link from 'next/link';
import Image from 'next/image';
import { ContentCard } from '@/components/ui/content-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Locale } from '@/types';
import type { BlogPost } from '../core/types';
import type { ContentStyle } from '../core/renderer';
import { blogPath, mediaUrl } from '../core/urls';
import { blogConfig } from './config';
import { getBlogCopy } from './copy';
import { articleHeadings, articleReadingTime } from '../core/article';
import type { DocNode } from '../core/document';

export const articleStyles: ContentStyle = {
  root: 'space-y-5 break-words', paragraph: 'mt-4 leading-8 text-text-secondary',
  heading: 'scroll-mt-28 mt-10 text-xl font-semibold leading-8 text-text-primary',
  link: 'text-accent underline underline-offset-4', list: 'list-decimal ps-7 space-y-2 text-text-secondary leading-8',
  blockquote: 'border-s-4 border-accent ps-6 my-8', code: 'overflow-x-auto rounded-xl bg-card-secondary p-5 text-sm',
  rule: 'my-8 border-border', figure: 'my-8 overflow-hidden rounded-xl border border-border bg-card',
  image: 'w-full h-auto', video: 'w-full h-auto', audio: 'w-full', caption: 'px-5 py-3 text-sm text-text-secondary',
  embed: 'aspect-video w-full my-8 rounded-xl',
  tableRegion: 'my-8 max-w-full overflow-x-auto rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-accent',
  table: 'w-full min-w-[32rem] border-collapse text-sm', row: 'border-b border-border',
  cell: 'border-e border-border p-4 align-top [&>p]:text-sm [&>p]:leading-7',
  headerCell: 'border-e border-border bg-card-secondary p-4 font-semibold align-top [&>p]:text-sm [&>p]:leading-7',
};

export const displayDate = (value: string, locale: Locale) => new Intl.DateTimeFormat(locale, {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
}).format(new Date(value));

export function BlogCover({ post, priority = false }: { post: BlogPost; priority?: boolean }) {
  const cover = post.cover;
  const src = cover?.mediaType.startsWith('image/') && cover.mediaType !== 'image/svg+xml'
    ? mediaUrl(cover.publicUrl, blogConfig().mediaOrigins) : undefined;
  if (!cover || !src) return null;
  return <figure className="my-8 overflow-hidden rounded-xl border border-border">
    <Image src={src} alt={cover.alt || post.title} width={cover.width || 1200} height={cover.height || 800}
      priority={priority} sizes="(max-width: 768px) 100vw, 896px" className="h-auto w-full" />
    {cover.caption && <figcaption className="bg-card px-5 py-3 text-sm text-text-secondary">{cover.caption}</figcaption>}
  </figure>;
}

export function BlogByline({ post }: { post: BlogPost }) {
  const avatar = mediaUrl(post.author.avatarUrl, blogConfig().mediaOrigins);
  return <div className="mt-10 space-y-3 rounded-2xl border bg-white border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03] sm:p-6 text-sm text-text-secondary">
    <div className="flex items-center gap-3">
      {avatar && <img src={avatar} alt={post.author.name} width={40} height={40} loading="lazy" className="h-10 w-10 rounded-full object-cover" />}
      <div><p className="font-semibold text-text-primary">{post.author.name}</p>{post.author.designation && <p>{post.author.designation}</p>}</div>
    </div>
    {post.author.description && <p className="leading-7">{post.author.description}</p>}
  </div>;

  // Previous profile layout references are retained below.
}

export function BlogPostMetadata({ post, locale, document }: { post: BlogPost; locale: Locale; document: DocNode | null }) {
  const copy = getBlogCopy(locale);
  const reading = articleReadingTime(document);
  const isUpdated = new Date(post.updatedAt).getTime() > new Date(post.publishedAt).getTime();
  const visibleDate = isUpdated ? post.updatedAt : post.publishedAt;
  return <p className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm font-medium text-text-primary">
    <time dateTime={visibleDate} aria-label={isUpdated ? copy.updated : copy.published}>{displayDate(visibleDate, locale)}</time>
    {reading && <span>{new Intl.NumberFormat(locale).format(reading.minutes)} {copy.minRead}</span>}
    {post.category && <Link prefetch={false} href={`${blogPath(blogConfig(), locale)}?${new URLSearchParams({ category: post.category.slug })}`} className="hover:text-accent">{post.category.name}</Link>}
  </p>;
}

export function BlogTableOfContents({ document, locale, sidebar = false }: { document: DocNode | null; locale: Locale; sidebar?: boolean }) {
  const headings = articleHeadings(document);
  if (!headings.length) return null;
  const copy = getBlogCopy(locale);
  const firstLevel = Math.min(...headings.map(heading => heading.level));
  return <nav aria-labelledby="blog-contents-title" className={`${sidebar ? 'max-h-[50vh] overflow-y-auto p-5' : 'my-8 p-6'} rounded-xl border border-border bg-card`} data-blog-toc>
    <h2 id="blog-contents-title" className="font-semibold text-text-primary">{copy.contents}</h2>
    <ol className={`mt-4 grid list-inside list-decimal gap-3 text-sm ${sidebar ? '' : 'sm:grid-cols-2'}`}>
      {headings.map(heading => <li key={heading.id} style={{ paddingInlineStart: `${Math.max(0, heading.level - firstLevel)}rem` }}>
        <a href={`#${heading.id}`} className="underline decoration-border underline-offset-4 hover:text-accent">{heading.title}</a>
      </li>)}
    </ol>
  </nav>;
}

export function BlogPreview({ post, editorial = false }: { post: BlogPost; editorial?: boolean }) {
  const locale = post.locale as Locale;
  const cover = post.cover;
  const src = cover?.mediaType.startsWith('image/') && cover.mediaType !== 'image/svg+xml'
    ? mediaUrl(cover.publicUrl, blogConfig().mediaOrigins) : undefined;
  // Optional editorial labels; never infer popularity or trending from publication order.
  const badges = Array.isArray(post.metadata.badges)
    ? [...new Set(post.metadata.badges.filter((value): value is string =>
      typeof value === 'string' && ['latest', 'popular', 'trending'].includes(value.toLowerCase()))
      .map(value => value.toLowerCase()))] : [];
  return <ContentCard href={blogPath(blogConfig(), locale, post.slug)} title={post.title} category={editorial ? undefined : post.category?.name}
    badges={editorial ? undefined : badges} metadata={editorial ? undefined : <time dateTime={post.publishedAt}>{displayDate(post.publishedAt, locale)}</time>}
    media={<div className="relative h-48 shrink-0 overflow-hidden bg-card-secondary">
      {src && cover && <Image src={src} alt={cover.alt || post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />}
      {editorial && post.category && <Badge variant="secondary" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="absolute start-3 top-3 z-10 max-w-[calc(100%-1.5rem)] truncate shadow-sm">{post.category.name}</Badge>}
    </div>}
    headingLevel={editorial ? 3 : 2} variant={editorial ? 'related-blog' : 'blog'} contentLang={locale} />;
}

export function BlogPagination({ locale, page, hasNext, category, totalPages }: { locale: Locale; page: number; hasNext: boolean; category?: string; totalPages?: number }) {
  const copy = getBlogCopy(locale);
  if (page === 1 && !hasNext) return null;
  const firstPage = Math.floor((page - 1) / 10) * 10 + 1;
  const lastPage = Math.min(firstPage + 9, totalPages ?? page + (hasNext ? 1 : 0));
  const pages = Array.from({ length: Math.max(0, lastPage - firstPage + 1) }, (_, index) => firstPage + index);
  const href = (number: number) => {
    const query = new URLSearchParams({ page: String(number) });
    if (category !== undefined) query.set('category', category);
    return `${blogPath(blogConfig(), locale)}?${query}`;
  };
  return <nav aria-label={copy.pagination} className="flex flex-wrap items-center justify-center gap-2">
    {page > 1 && <Button asChild variant="outline"><Link prefetch={false} href={href(page - 1)} rel="prev">{copy.previous}</Link></Button>}
    {pages.map(number => number === page
      ? <span key={number} aria-current="page" className="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-accent px-3 text-sm font-medium text-accent-foreground">{new Intl.NumberFormat(locale).format(number)}</span>
      : <Button key={number} asChild variant="outline" size="sm"><Link prefetch={false} href={href(number)}>{new Intl.NumberFormat(locale).format(number)}</Link></Button>)}
    {hasNext && <Button asChild variant="outline"><Link prefetch={false} href={href(page + 1)} rel="next">{copy.next}</Link></Button>}
  </nav>;
}
