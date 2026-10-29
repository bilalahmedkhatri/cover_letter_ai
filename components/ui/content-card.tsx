import type { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from './card';
import { Badge } from './badge';

type ContentCardProps = {
  href: string;
  title: string;
  category?: string;
  badges?: string[];
  metadata?: ReactNode;
  media?: ReactNode;
  headingLevel?: 2 | 3;
  variant?: 'blog' | 'related-blog';
  contentLang?: string;
};

/** Shared linked preview for articles, resources and other content. */
export function ContentCard({ href, title, category, badges, metadata, media, headingLevel = 2, variant = 'blog', contentLang }: ContentCardProps) {
  const blog = variant === 'blog';
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return <Link href={href} aria-label={title} lang={contentLang} dir={contentLang ? (contentLang === 'ar' ? 'rtl' : 'ltr') : undefined} className="group block h-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background">
    <Card className="h-full gap-0 overflow-hidden pt-0 pb-5">
      {media}
      <CardHeader className="gap-3 px-5 pt-4">
        {blog && (category || !!badges?.length) ? <div className="flex min-w-0 flex-wrap items-center gap-2">
          {category && <Badge variant="secondary" className="max-w-full truncate">{category}</Badge>}
          {!!badges?.length && <div className="flex gap-2">{badges.map(badge => <Badge key={badge} variant="secondary" className="shrink-0 bg-accent/10 text-accent">{badge}</Badge>)}</div>}
        </div> : null}
        <CardTitle><Heading className="text-md line-clamp-3 break-words leading-snug transition-colors group-hover:text-accent">{title}</Heading></CardTitle>
      </CardHeader>
      {blog && metadata && <CardFooter className="mt-auto px-5 pt-4">
        <CardDescription>{metadata}</CardDescription>
      </CardFooter>}
    </Card>
  </Link>;
}
