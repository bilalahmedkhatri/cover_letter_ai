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
  description?: string;
  metadata?: ReactNode;
  media?: ReactNode;
  actionLabel?: string;
  headingLevel?: 2 | 3;
  variant?: 'default' | 'editorial';
  contentLang?: string;
  className?: string;
};

/** Shared linked preview for articles, resources and other content. */
export function ContentCard({ href, title, category, description, metadata, media, actionLabel, headingLevel = 2, variant = 'default', contentLang, className }: ContentCardProps) {
  const editorial = variant === 'editorial';
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return <Link href={href} aria-label={title} className={cn('group block h-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background', className)}>
    <Card className={cn('h-full', editorial && 'gap-0 rounded-none border-0 bg-transparent py-0 shadow-none')}>
      {media ?? (editorial && <div aria-hidden="true" className="aspect-[3/2] bg-card-secondary transition-colors group-hover:bg-accent/10" />)}
      <CardHeader lang={contentLang} dir={contentLang ? (contentLang === 'ar' ? 'rtl' : 'ltr') : undefined} className={cn(editorial && 'flex flex-1 flex-col items-start gap-3 px-0 pt-5')}>
        {category && (editorial ? <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{category}</p> : <Badge variant="secondary" className="w-fit">{category}</Badge>)}
        <CardTitle><Heading className={cn('text-xl transition-colors group-hover:text-accent', editorial ? 'font-bold leading-7' : 'mt-3 leading-8')}>{title}</Heading></CardTitle>
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
