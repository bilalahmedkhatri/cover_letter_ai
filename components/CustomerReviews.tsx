import React, { useEffect, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import type { landingReviewCopy } from '@/services/landingHelperCopy';
type Review = { name: string; rating: number; content: string };
export default function CustomerReviews({ copy }: { copy: ReturnType<typeof landingReviewCopy> }) {
  const { locale } = useLocale(); const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => { const controller = new AbortController(); fetch('/api/reviews', { signal: controller.signal }).then(r => r.json()).then(data => setReviews(Array.isArray(data.reviews) ? data.reviews : [])).catch(() => {}); return () => controller.abort(); }, []);
  return <section id="reviews" className="scroll-mt-28 rounded-2xl border border-border bg-card p-7 sm:p-10" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}><p className="eyebrow">{copy.label}</p><h2 className="section-title mt-4">{copy.title}</h2>{reviews.length ? <div className="mt-8 grid gap-5 md:grid-cols-3">{reviews.map((review, index) => <figure key={index} className="rounded-xl border border-border bg-background p-6"><p aria-label={`${review.rating} / 5`} className="text-accent">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</p><blockquote className="mt-4 whitespace-pre-wrap text-sm leading-7">{review.content}</blockquote><figcaption className="mt-5 font-semibold">{review.name}</figcaption></figure>)}</div> : <p className="mt-5 max-w-2xl leading-8 text-text-secondary">{copy.empty}</p>}</section>;
}
