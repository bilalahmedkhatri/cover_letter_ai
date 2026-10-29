import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from './card';
import { Badge } from './badge';
import { Button } from './button';

type ContentCardProps = {
  href: string;
  title: string;
  category?: string;
  badges?: string[];
  description?: string;
  metadata?: ReactNode;
  media?: ReactNode;
  actionLabel?: string;
  headingLevel?: 2 | 3;
  variant?: 'default' | 'editorial' | 'blog';
  contentLang?: string;
  className?: string;
};

/** Shared linked preview for articles, resources and other content. */
export function ContentCard({ href, title, category, badges, description, metadata, media, actionLabel, headingLevel = 2, variant = 'default', contentLang, className }: ContentCardProps) {
  const editorial = variant === 'editorial';
  const blog = variant === 'blog';
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return <Link href={href} aria-label={title} className={cn('group block h-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background', className)}>
    <Card className={cn('h-full', blog && 'h-[28rem] gap-4 overflow-hidden pt-0', editorial && 'gap-0 rounded-none border-0 bg-transparent py-0 shadow-none')}>
      {media ?? (editorial && <div aria-hidden="true" className="aspect-[3/2] bg-card-secondary transition-colors group-hover:bg-accent/10" />)}
      <CardHeader lang={contentLang} dir={contentLang ? (contentLang === 'ar' ? 'rtl' : 'ltr') : undefined} className={cn(editorial && 'flex flex-1 flex-col items-start gap-3 px-0 pt-5')}>
        {blog ? <div className="flex h-14 min-w-0 flex-col items-start justify-center gap-1">
          {category && <Badge variant="secondary" className="max-w-full truncate">{category}</Badge>}
          {!!badges?.length && <div className="flex gap-2">{badges.map(badge => <Badge key={badge} variant="secondary" className="shrink-0 bg-accent/10 text-accent">{badge}</Badge>)}</div>}
        </div> : category && (editorial ? <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{category}</p> : <Badge variant="secondary" className="w-fit">{category}</Badge>)}
        <CardTitle><Heading className={cn('text-xl transition-colors group-hover:text-accent', blog ? 'line-clamp-3 break-words leading-8' : editorial ? 'font-bold leading-7' : 'mt-3 leading-8')}>{title}</Heading></CardTitle>
        {description && <CardDescription className="leading-7">{description}</CardDescription>}
        {editorial && metadata && <CardDescription className="mt-auto pt-5 text-sm font-medium">{metadata}</CardDescription>}
      </CardHeader>
      {!editorial && (metadata || actionLabel) && <CardFooter className="mt-auto justify-between gap-4">
        {metadata && <CardDescription lang={contentLang}>{metadata}</CardDescription>}
        {actionLabel && <Button asChild variant="outline"><span>{actionLabel}</span></Button>}
      </CardFooter>}
    </Card>
  </Link>;
}
