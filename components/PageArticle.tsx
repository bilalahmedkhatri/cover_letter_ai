import React from 'react';
import type { Locale } from '../types';
import 'server-only';
import { localizedPath, type Page } from '../services/routing';
import { pageArticles, articleSections } from '../services/pageArticles.mjs';
import { privacyGuideCopy } from '../services/privacyGuideCopy';
import { compareGuide } from '../services/compareGuide';
import { writingGuide } from '../services/writingGuide';
type Article = { title: string; intro: string; sections: { id: string; title: string; paragraphs: string[]; link: string; anchor?: string }[] };
export default function PageArticle({ page, post, locale, contentLocale, contentsLabel, referenceLabel, headerContent, tableOfContents, children }: {
  page?: Page; post?: Article; locale: Locale; contentLocale?: Locale; contentsLabel?: string; referenceLabel?: string;
  headerContent?: React.ReactNode; tableOfContents?: React.ReactNode; children?: React.ReactNode;
}) {
  const privacy = !post && page === '/privacy' ? privacyGuideCopy(locale) : null;
  const comparison = !post ? page === '/compare' ? compareGuide(locale) : page === '/guides' ? writingGuide(locale) : null : null;
  const article = post ?? privacy ?? comparison ?? pageArticles[page!]; if (!article) return null;
  const sections: Article['sections'] = post?.sections ?? privacy?.sections ?? comparison?.sections ?? articleSections(page);
  const language = contentLocale ?? (privacy || comparison ? locale : 'en');
  const contents = contentsLabel ?? privacy?.contents ?? comparison?.contents ?? 'In this guide';
  const Heading = post ? 'h1' : 'h2';
  return <article data-page-article className={`mx-auto max-w-4xl ${post ? 'pt-6' : 'mt-20 border-t border-border pt-12'}`} lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
    {!contentLocale && !privacy && !comparison && locale !== 'en' && <p className="mb-5 rounded-lg border border-border bg-card p-3 text-sm text-text-secondary">{locale === 'ru' ? 'Подробное руководство пока доступно на английском языке.' : 'This detailed guide is currently available in English.'}</p>}
    {!post && <p className="eyebrow">{referenceLabel ?? privacy?.reference ?? comparison?.reference ?? 'Practical reference'}</p>}<Heading className={`${post ? 'editorial-title' : 'section-title'} mt-4`}>{article.title}</Heading><p className="mt-5 leading-8 text-text-secondary">{article.intro}</p>
    {headerContent}
    {tableOfContents ?? (sections.length > 0 && <nav aria-label={contents} className="my-8 rounded-xl border border-border bg-card p-6"><h3 className="font-semibold">{contents}</h3><ol className="mt-4 grid list-inside list-decimal gap-3 text-sm sm:grid-cols-2">{sections.map(section => <li key={section.id}><a className="underline decoration-border underline-offset-4 hover:text-accent" href={'#' + (section.anchor || 'reference-' + section.id)}>{section.title}</a></li>)}</ol></nav>)}
    <div className="space-y-10">{children ?? sections.map(section => <section key={section.id} id={'reference-' + section.id} className="scroll-mt-28"><h3 className="text-xl font-semibold leading-8">{section.title}</h3>{section.paragraphs.map((paragraph, index) => <p key={index} className="mt-4 leading-8 text-text-secondary">{paragraph}</p>)}<a className="mt-4 inline-block text-sm font-medium text-accent underline underline-offset-4" href={localizedPath(locale, section.link as Page)}>{comparison ? comparison.link : privacy ? privacy.links[section.link] : section.link === '/dashboard' ? 'Open the writing workspace' : section.link === '/account' ? 'Manage your writing account' : `Read ${section.link.slice(1)} →`}</a></section>)}</div>
  </article>;
}
