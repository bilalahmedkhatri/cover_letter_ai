import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className, label = 'Loading…' }: { className?: string; label?: string }) {
  return <span role="status" aria-label={label} className={cn('inline-flex items-center justify-center', className)}><LoaderCircle aria-hidden="true" className="size-5 animate-spin motion-reduce:animate-none" /><span className="sr-only">{label}</span></span>;
}
