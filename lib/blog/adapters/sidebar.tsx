import 'server-only';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Locale } from '@/types';
import { Button } from '@/components/ui/button';

const helpCopy: Record<Locale, { title: string; description: string }> = {
  en: { title: 'Put this advice into practice', description: 'Use your experience and the job requirements to draft a tailored cover letter. Review the result before sending.' },
  es: { title: 'Pon estos consejos en práctica', description: 'Usa tu experiencia y los requisitos del puesto para redactar una carta de presentación personalizada. Revísala antes de enviarla.' },
  fr: { title: 'Passez à la pratique', description: 'Utilisez votre expérience et les exigences du poste pour rédiger une lettre de motivation adaptée. Relisez-la avant de l’envoyer.' },
  ru: { title: 'Примените советы на практике', description: 'Создайте сопроводительное письмо с учётом вашего опыта и требований вакансии. Проверьте результат перед отправкой.' },
  nl: { title: 'Breng deze tips in de praktijk', description: 'Gebruik je ervaring en de functie-eisen om een gerichte sollicitatiebrief te schrijven. Controleer het resultaat voordat je het verstuurt.' },
  pt: { title: 'Coloque estas dicas em prática', description: 'Use sua experiência e os requisitos da vaga para criar uma carta de apresentação personalizada. Revise antes de enviar.' },
  ar: { title: 'طبّق هذه النصائح عمليًا', description: 'استخدم خبرتك ومتطلبات الوظيفة لصياغة خطاب تقديم مناسب. راجع النتيجة قبل الإرسال.' },
};

// A reusable sidebar slot for first-party help or a future clearly labelled promotion.
export function BlogSidebarCard({ title, children, action, disclosure }: {
  title: string; children: ReactNode; action?: ReactNode; disclosure?: string;
}) {
  return <section className="space-y-4 rounded-xl border border-border bg-card p-5">
    {disclosure && <p className="text-xs font-medium text-text-secondary">{disclosure}</p>}
    <h2 className="text-base font-semibold leading-snug text-text-primary">{title}</h2>
    <div className="text-sm leading-6 text-text-secondary">{children}</div>
    {action}
  </section>;
}

export function BlogWritingHelp({ locale, label, href }: { locale: Locale; label: string; href: string }) {
  const copy = helpCopy[locale];
  return <BlogSidebarCard title={copy.title} action={<Button asChild className="h-auto w-full whitespace-normal text-center"><Link prefetch={false} href={href}>{label}</Link></Button>}>
    <p>{copy.description}</p>
  </BlogSidebarCard>;
}
