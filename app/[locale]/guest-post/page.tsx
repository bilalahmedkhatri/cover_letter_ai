import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { pageMetadata } from '@/lib/page-metadata';
import { localeCodes, localizedPath } from '@/services/routing';
import type { Locale } from '@/types';

type Props = { params: Promise<{ locale: string }> };
export const generateMetadata = ({ params }: Props) => pageMetadata(params, '/guest-post');

const topics = [
  ['Cover letters', 'Tailoring letters to job descriptions, strong openings and practical before-and-after examples.'],
  ['Job applications', 'Career changes, first jobs, explaining experience gaps and presenting transferable skills.'],
  ['Responsible AI writing', 'Useful prompts, checking facts, protecting personal information and editing AI drafts in your own voice.'],
  ['International applications', 'Country-specific application conventions and writing clearly for multilingual readers.'],
];
const benefits = [
  ['Reach relevant readers', 'Share practical advice with people preparing letters and job applications.'],
  ['Build your author profile', 'Accepted articles can include your name, a short bio and a relevant website reference.'],
  ['Share useful experience', 'Help readers with examples, first-hand lessons and well-supported guidance.'],
];
const guidelines = [
  'Submit original, unpublished work, normally at least 1,200 words. Pitch a shorter practical article if the topic warrants it.',
  'Give readers clear takeaways, useful examples, descriptive subheadings and short paragraphs.',
  'Support factual claims with reputable sources and working links. Remove personal or confidential information from examples.',
  'Include a short author bio and suggest a relevant existing AILetterGen article to link to.',
  'Disclose substantial AI assistance and check every claim. You remain responsible for originality, accuracy and permissions.',
];
const rejected = ['Plagiarized or previously published articles.', 'Keyword stuffing, filler or unrelated promotional pitches.', 'Fabricated experience, unsupported claims or promises of guaranteed hiring outcomes.', 'Excessive self-promotional links or undisclosed commercial relationships.'];
const guidelineGroups: [string, string[]][] = [['What we look for', guidelines], ['What gets rejected', rejected]];
const steps = [
  ['Pitch your idea', 'Email a working title, 3–5 outline points, your intended audience and a short bio.'],
  ['Editorial review', 'We assess relevance, originality and reader value. Acceptance and response times are not guaranteed.'],
  ['Write and submit', 'After your pitch is accepted, send the draft and any images with their source and usage permissions.'],
  ['Edit and publish', 'We may request revisions and edit for accuracy, clarity and style before agreeing publication.'],
];

export default async function GuestPostPage({ params }: Props) {
  const { locale: code } = await params;
  if (!localeCodes.includes(code as Locale)) notFound();
  const locale = code as Locale;
  return <main className="mx-auto max-w-screen-xl space-y-16 px-5 py-12 sm:px-8 lg:px-10" lang="en" dir="ltr">
    <header className="max-w-4xl space-y-6">
      <p className="eyebrow">Write for AILetterGen</p>
      <h1 className="editorial-title">Share your expertise. Help someone write a better application.</h1>
      <p className="text-lg leading-8 text-text-secondary">We welcome original guest articles about cover letters, job applications and responsible AI writing. Share practical ideas that readers can put to work.</p>
      <div className="flex flex-wrap gap-3"><Button asChild><a href="#pitch">Pitch your idea</a></Button><Button asChild variant="outline"><Link prefetch={false} href={localizedPath(locale, '/blog')}>Explore the blog</Link></Button></div>
      {locale !== 'en' && <p className="text-sm text-text-secondary">These contributor guidelines are currently available in English.</p>}
    </header>
    <section aria-labelledby="guest-benefits" className="space-y-6"><h2 id="guest-benefits" className="section-title">Why write for us?</h2><div className="grid gap-6 md:grid-cols-3">{benefits.map(([title, text]) => <Card key={title}><CardHeader><CardTitle><h3>{title}</h3></CardTitle></CardHeader><CardContent className="leading-7 text-text-secondary">{text}</CardContent></Card>)}</div></section>
    <section aria-labelledby="guest-topics" className="space-y-6"><h2 id="guest-topics" className="section-title">What we publish</h2><div className="grid gap-6 md:grid-cols-2">{topics.map(([title, text]) => <Card key={title}><CardHeader><CardTitle><h3>{title}</h3></CardTitle></CardHeader><CardContent className="leading-7 text-text-secondary">{text}</CardContent></Card>)}</div></section>
    <section aria-labelledby="guest-guidelines" className="space-y-6"><h2 id="guest-guidelines" className="section-title">Editorial guidelines</h2><div className="grid gap-6 md:grid-cols-2">{guidelineGroups.map(([title, items]) => <Card key={title}><CardHeader><CardTitle><h3>{title}</h3></CardTitle></CardHeader><CardContent><ul className="list-disc space-y-3 ps-5 leading-7 text-text-secondary">{items.map(item => <li key={item}>{item}</li>)}</ul></CardContent></Card>)}</div><p className="text-sm leading-7 text-text-secondary">Links are reviewed for relevance. Publication does not guarantee rankings or a dofollow link. Commercial placements must be disclosed and agreed separately.</p></section>
    <section aria-labelledby="guest-process" className="space-y-6"><h2 id="guest-process" className="section-title">How the process works</h2><ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([title, text], index) => <li key={title} className="space-y-3 border-t border-border pt-5"><p className="text-sm font-semibold text-accent">0{index + 1}</p><h3 className="font-semibold">{title}</h3><p className="text-sm leading-7 text-text-secondary">{text}</p></li>)}</ol></section>
    <section id="pitch" aria-labelledby="guest-pitch" className="mx-auto max-w-3xl scroll-mt-28 space-y-4 py-6 text-center">
      <h2 id="guest-pitch" className="section-title">Send your pitch</h2>
      <p className="leading-7 text-text-secondary">Email your pitch to <a className="break-all text-accent underline" href="mailto:bilalahmed@azeemlab.com">bilalahmed@azeemlab.com</a>.</p>
      <p className="text-sm leading-6 text-text-secondary"><strong>Pitch tip:</strong> Include a working title, 3–5 outline points, what readers will learn and a short author bio. Use “Guest post pitch: [your topic]” as your email subject.</p>
    </section>
  </main>;
}
