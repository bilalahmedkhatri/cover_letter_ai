import Content from '@/components/LandingPage';
import PublicPage from "@/components/PublicPage";
import { pageMetadata } from "@/lib/page-metadata";
import { notFound } from 'next/navigation';
import { localeCodes, localizedPath, siteOrigin } from '@/services/routing';
import { interfaceCopy } from '@/services/interfaceCopy';
import { serializeJsonLd } from '@/lib/serialize-json-ld';
import type { Locale } from '@/types';
export const generateMetadata = ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => pageMetadata(params, "/");
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: code } = await params;
  if (!localeCodes.includes(code as Locale)) notFound();
  const locale = code as Locale;
  const copy = interfaceCopy(locale);
  const url = siteOrigin + localizedPath(locale, '/');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${siteOrigin}/#website`, url: siteOrigin, name: 'ailettergen', inLanguage: localeCodes },
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: copy.hero.replace(/\s+/g, ' ').trim(),
        description: copy.intro, inLanguage: locale, isPartOf: { '@id': `${siteOrigin}/#website` } },
    ],
  };
  return <>
    <script id="landing-page-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    <PublicPage locale={locale} page="/"><Content/></PublicPage>
  </>;
}
