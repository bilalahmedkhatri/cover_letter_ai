import 'server-only';
import Link from 'next/link';
import Image from 'next/image';
import { ContentCard } from '@/components/ui/content-card';
import { Button } from '@/components/ui/button';
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
  return <p className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm font-medium text-text-primary">
    <time dateTime={post.publishedAt} aria-label={copy.published}>{displayDate(post.publishedAt, locale)}</time>
    {post.updatedAt !== post.publishedAt && <time dateTime={post.updatedAt} aria-label={copy.updated}>{displayDate(post.updatedAt, locale)}</time>}
    {reading && <span>{new Intl.NumberFormat(locale).format(reading.minutes)} {copy.minRead}</span>}
    {post.category && <Link prefetch={false} href={`${blogPath(blogConfig(), locale)}?${new URLSearchParams({ category: post.category.slug })}`} className="hover:text-accent">{post.category.name}</Link>}
  </p>;

  // export function BlogByline({ post, locale }: { post: BlogPost; locale: Locale }) {
  //   const copy = getBlogCopy(locale);
  //   const avatar = mediaUrl(post.author.avatarUrl, blogConfig().mediaOrigins);

  //   // Author type me url na ho to bhi safe rahe
  //   const profileUrl = (post.author as { url?: string }).url;
  //   const viewProfileLabel =
  //     (copy as { viewProfile?: string }).viewProfile ?? 'View profile';

  //   const initials = post.author.name
  //     .split(' ')
  //     .filter(Boolean)
  //     .slice(0, 2)
  //     .map((part) => part[0]?.toUpperCase())
  //     .join('');

  //   const isUpdated = post.updatedAt !== post.publishedAt;

  //   return (
  //     <div className="mt-8 rounded-2xl border border-border bg-surface/60 p-5 sm:p-6">
  //       {/* Header: avatar + identity */}
  //       <div className="flex items-start gap-4">
  //         {avatar ? (
  //           <img
  //             src={avatar}
  //             alt={post.author.name}
  //             width={56}
  //             height={56}
  //             loading="lazy"
  //             className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-border"
  //           />
  //         ) : (
  //           <div
  //             aria-hidden="true"
  //             className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10 text-base font-semibold text-accent ring-2 ring-border"
  //           >
  //             {initials || '?'}
  //           </div>
  //         )}

  //         <div className="min-w-0 flex-1">
  //           <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
  //             <p className="text-base font-semibold text-text-primary">
  //               {post.author.name}
  //             </p>
  //             {post.author.designation && (
  //               <p className="text-sm text-text-secondary">
  //                 {post.author.designation}
  //               </p>
  //             )}
  //           </div>

  //           {profileUrl && (
  //             <a
  //               href={profileUrl}
  //               aria-label={`${viewProfileLabel}: ${post.author.name}`}
  //               className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:underline"
  //             >
  //               {viewProfileLabel}
  //               <span aria-hidden="true">→</span>
  //             </a>
  //           )}
  //         </div>
  //       </div>

  //       {/* Bio */}
  //       {post.author.description && (
  //         <p className="mt-4 text-sm leading-7 text-text-secondary">
  //           {post.author.description}
  //         </p>
  //       )}

  //       {/* Dates footer */}
  //       <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-4 text-xs text-text-secondary">
  //         <span>
  //           {copy.published}:{' '}
  //           <time dateTime={post.publishedAt}>
  //             {displayDate(post.publishedAt, locale)}
  //           </time>
  //         </span>
  //         {isUpdated && (
  //           <>
  //             <span aria-hidden="true">·</span>
  //             <span>
  //               {copy.updated}:{' '}
  //               <time dateTime={post.updatedAt}>
  //                 {displayDate(post.updatedAt, locale)}
  //               </time>
  //             </span>
  //           </>
  //         )}
  //       </div>
  //     </div>
  //   );

  // export function BlogByline({ post, locale }: { post: BlogPost; locale: Locale }) {
  //   const copy = getBlogCopy(locale);
  //   const avatar = mediaUrl(post.author.avatarUrl, blogConfig().mediaOrigins);

  //   const initials = post.author.name
  //     .split(" ")
  //     .filter(Boolean)
  //     .map((word) => word[0])
  //     .slice(0, 2)
  //     .join("")
  //     .toUpperCase();

  //   return (
  //     <aside className="mt-6 rounded-2xl border bg-white border-black/5 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
  //       <div className="flex items-start gap-4">
  //         {avatar ? (
  //           <img
  //             src={avatar}
  //             alt={post.author.name}
  //             width={56}
  //             height={56}
  //             loading="lazy"
  //             decoding="async"
  //             className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
  //           />
  //         ) : (
  //           <span
  //             aria-hidden="true"
  //             className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-text-primary ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/10"
  //           >
  //             {initials || "A"}
  //           </span>
  //         )}

  //         <div className="min-w-0 flex-1">
  //           <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
  //             <p className="text-base font-semibold text-text-primary">
  //               {post.author.name}
  //             </p>
  //             {post.author.designation && (
  //               <p className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-text-secondary dark:bg-white/10">
  //                 {post.author.designation}
  //               </p>
  //             )}
  //           </div>

  //           {post.author.description && (
  //             <p className="mt-2 text-sm leading-7 text-text-secondary">
  //               {post.author.description}
  //             </p>
  //           )}

  //           <p className="mt-3 text-xs text-text-secondary">
  //             {copy.published}:{" "}
  //             <time dateTime={post.publishedAt} className="font-medium text-text-primary">
  //               {displayDate(post.publishedAt, locale)}
  //             </time>

  //             {post.updatedAt && post.updatedAt !== post.publishedAt && (
  //               <>
  //                 <span aria-hidden="true"> · </span>
  //                 {copy.updated}:{" "}
  //                 <time dateTime={post.updatedAt} className="font-medium text-text-primary">
  //                   {displayDate(post.updatedAt, locale)}
  //                 </time>
  //               </>
  //             )}
  //           </p>
  //         </div>
  //       </div>
  //     </aside>
  //   );

}

export function BlogTableOfContents({ document, locale }: { document: DocNode | null; locale: Locale }) {
  const headings = articleHeadings(document);
  if (!headings.length) return null;
  const copy = getBlogCopy(locale);
  const firstLevel = Math.min(...headings.map(heading => heading.level));
  return <nav aria-labelledby="blog-contents-title" className="my-8 rounded-xl border border-border bg-card p-6" data-blog-toc>
    <h2 id="blog-contents-title" className="font-semibold text-text-primary">{copy.contents}</h2>
    <ol className="mt-4 grid list-inside list-decimal gap-3 text-sm sm:grid-cols-2">
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
  return <ContentCard href={blogPath(blogConfig(), locale, post.slug)} title={post.title} category={post.category?.name}
    badges={badges} metadata={<time dateTime={post.publishedAt}>{displayDate(post.publishedAt, locale)}</time>}
    media={<div className="relative h-48 shrink-0 overflow-hidden bg-card-secondary">
      {src && cover && <Image src={src} alt={cover.alt || post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />}
    </div>}
    headingLevel={editorial ? 3 : 2} variant="blog" contentLang={locale} />;
}

export function BlogPagination({ locale, page, hasNext, category }: { locale: Locale; page: number; hasNext: boolean; category?: string }) {
  const copy = getBlogCopy(locale);
  if (page === 1 && !hasNext) return null;
  const href = (number: number) => {
    const query = new URLSearchParams({ page: String(number) });
    if (category !== undefined) query.set('category', category);
    return `${blogPath(blogConfig(), locale)}?${query}`;
  };
  return <nav aria-label={copy.pagination} className="flex items-center justify-center gap-4">
    {page > 1 && <Button asChild variant="outline"><Link prefetch={false} href={href(page - 1)} rel="prev">{copy.previous}</Link></Button>}
    <span aria-current="page" className="text-sm text-text-secondary">{new Intl.NumberFormat(locale).format(page)}</span>
    {hasNext && <Button asChild variant="outline"><Link prefetch={false} href={href(page + 1)} rel="next">{copy.next}</Link></Button>}
  </nav>;
}
