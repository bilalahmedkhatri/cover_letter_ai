const fs = require('node:fs');
function edit(file, changes) {
  let source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  for (const [from, to] of changes) {
    if (!source.includes(from)) throw new Error(`${file}: missing ${from}`);
    source = source.replace(from, to);
  }
  fs.writeFileSync(file, source);
}
edit('contexts/LocaleContext.tsx', [
  ["createContext, useState, useContext", "createContext, useContext"],
  ["import { translations, TranslationKeys }", "import type { TranslationKeys }"],
  ["import { Locale }", "import type { Locale }"],
  ["import { resolveRoute } from '../services/routing';", "import type { LocaleData } from '../services/locale-data';"],
  ["import { useRoutePath } from './RouteContext';", ""],
  ["  setLocale: React.Dispatch<React.SetStateAction<Locale>>;", "  shell: LocaleData['shell'];"],
  ["export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {\n  const pathname = useRoutePath();\n  const [locale, setLocale] = useState<Locale>(() => resolveRoute(pathname).locale);\n  useEffect(() => { setLocale(resolveRoute(pathname).locale); }, [pathname]);", "export const LocaleProvider = ({ children, locale, data }: { children: ReactNode; locale: Locale; data: LocaleData }) => {"],
  ["translations[locale][key] || translations['en'][key]", "data.messages[key]"],
  ["value={{ locale, setLocale, t }}", "value={{ locale, shell: data.shell, t }}"],
]);
edit('components/AppProviders.tsx', [
  ['export default function AppProviders({\n  children,', "import type { Locale } from '@/types';\nimport type { LocaleData } from '@/services/locale-data';\nexport default function AppProviders({\n  children, locale, localeData,"],
  ['  children: React.ReactNode;', '  children: React.ReactNode; locale: Locale; localeData: LocaleData;'],
  ['<LocaleProvider>', '<LocaleProvider locale={locale} data={localeData}>'],
]);
edit('app/[locale]/layout.tsx', [
  ['export default async function', "import { getLocaleData } from '@/lib/locale-data';\nexport default async function"],
  ['<AppProviders>', '<AppProviders locale={locale as (typeof localeCodes)[number]} localeData={getLocaleData(locale as (typeof localeCodes)[number])}>'],
]);
edit('components/Header.tsx', [
  ['import { resourceLabels } from "../services/resourceCopy";\n', ''],
  ['import { blogCopy } from "../services/blogContent.mjs";\n', ''],
  ['import { interfaceCopy } from "../services/interfaceCopy";\n', ''],
  ['import { pricingLabel } from "../services/pricingCopy";\n', ''],
  ['const { locale, t } = useLocale();', 'const { locale, t, shell } = useLocale();'],
  ['const copy = interfaceCopy(locale);', 'const copy = shell.interface;'],
  ['const resources = resourceLabels[locale];', 'const resources = shell.resources;'],
  ['blogCopy[locale].label', 'shell.blog'],
  ['pricingLabel[locale]', 'shell.pricing'],
]);
edit('components/Footer.tsx', [
  ["import { resourceLabels } from '../services/resourceCopy';\n", ''],
  ["import { footerContext } from '../services/footerContext';\n", ''],
  ["import { pricingLabel } from '../services/pricingCopy';\n", ''],
  ["import { blogCopy } from '../services/blogContent.mjs';\n", ''],
  ['const { t, locale } = useLocale();', 'const { t, locale, shell } = useLocale();'],
  ['footerContext[locale]', 'shell.footer'], ['pricingLabel[locale]', 'shell.pricing'],
  ['blogCopy[locale].label', 'shell.blog'], ['resourceLabels[locale][index]', 'shell.resources[index]'],
]);
edit('components/LanguageSelector.tsx', [
  ["import { interfaceCopy } from '../services/interfaceCopy';", "import Link from 'next/link';"],
  ['const { locale } = useLocale();', 'const { locale, shell } = useLocale();'],
  ['interfaceCopy(locale).language', 'shell.interface.language'],
  ['<a href=', '<Link prefetch={false} href='], ['</a>', '</Link>'],
]);
edit('components/LandingPage.tsx', [
  ["import { interfaceCopy } from '../services/interfaceCopy';", "import { usePageCopy } from '@/contexts/PageCopyContext';"],
  ["import { pricingCopy } from '../services/pricingCopy';\n", ''],
  ["import { landingContent } from '../services/landingContent';\n", ''],
  ['const copy = interfaceCopy(locale);\n  const content = landingContent(locale);', 'const pageCopy = usePageCopy();\n  const copy = pageCopy.interface!;\n  const content = pageCopy.landing!;'],
  ['pricingCopy(locale).teaser', 'pageCopy.pricingTeaser!.teaser'], ['pricingCopy(locale).view', 'pageCopy.pricingTeaser!.view'],
]);
edit('components/ResourcePages.tsx', [
  ["import { resourceCopy, resourceNotice, type ResourcePage } from '../services/resourceCopy';", "import type { ResourcePage } from '../services/resourceCopy';\nimport { usePageCopy } from '@/contexts/PageCopyContext';"],
  ['const c = resourceCopy(locale);', 'const c = usePageCopy().resource!;'],
  ['const c = resourceCopy(locale);', 'const pageCopy = usePageCopy();\n  const c = pageCopy.resource!;'],
  ['const c = resourceCopy(locale);', 'const pageCopy = usePageCopy();\n  const c = pageCopy.resource!;'],
  ['resourceNotice[locale]', 'pageCopy.resourceNotice'], ['resourceNotice[locale]', 'pageCopy.resourceNotice'],
  ['resourceNotice[locale]', 'pageCopy.resourceNotice'], ['resourceNotice[locale]', 'pageCopy.resourceNotice'],
]);
edit('components/PricingPage.tsx', [
  ["import { pricingCopy, pricingLabel, pricingNotice } from '../services/pricingCopy';", "import { usePageCopy } from '@/contexts/PageCopyContext';"],
  ['const { locale } = useLocale();', 'const { locale, shell } = useLocale();'],
  ['const copy = pricingCopy(locale);', 'const pageCopy = usePageCopy();\n  const copy = pageCopy.pricing!;'],
  ['pricingNotice[locale]', 'pageCopy.pricingNotice'], ['pricingNotice[locale]', 'pageCopy.pricingNotice'], ['pricingLabel[locale]', 'shell.pricing'],
]);
edit('components/billing/BillingPanel.tsx', [
  ["import { billingCopy } from '../../services/billingCopy';", "import { usePageCopy } from '@/contexts/PageCopyContext';"],
  ["import { pricingCopy } from '../../services/pricingCopy';\n", ''],
  ['const copy = billingCopy(locale);\n  const pricing = pricingCopy(locale);', 'const pageCopy = usePageCopy();\n  const copy = pageCopy.billing!;\n  const pricing = pageCopy.pricing!;'],
]);
edit('components/BusinessLetterContent.tsx', [
  ["import { businessLetterCopy } from '../services/businessLetterCopy.mjs';", "import { usePageCopy } from '@/contexts/PageCopyContext';"],
  ['const copy = businessLetterCopy[locale];', 'const copy = usePageCopy().business;'],
  ["if(!publicWorkflows.includes('email'))return null;", "if(!publicWorkflows.includes('email') || !copy)return null;"],
]);
edit('components/AboutUs.tsx', [
  ["import { getMetadata } from '../services/seo';", "import { usePageCopy } from '@/contexts/PageCopyContext';"],
  ['const { t, locale } = useLocale();', 'const { t, locale } = useLocale();\n  const { aboutDescription } = usePageCopy();'],
  ["getMetadata(locale, '/about').description", 'aboutDescription'],
]);
for(const file of ['components/PrivacyPolicy.tsx','components/TermsOfService.tsx']) edit(file,[
  ["import { legalLanguageNotice } from '../services/seo';", "import { usePageCopy } from '@/contexts/PageCopyContext';"],
  ['const { t, locale } = useLocale();', 'const { t, locale } = useLocale();\n  const { legalNotice } = usePageCopy();'],
  ['legalLanguageNotice[locale]', 'legalNotice'],
]);
for(const file of ['LandingPage','ResourcePages','PricingPage','BusinessLetterContent','AboutUs','PrivacyPolicy','TermsOfService','LoginPage']) {
  const path=`components/${file}.tsx`; const source=fs.readFileSync(path,'utf8');
  if (!source.startsWith("'use client'") && !source.startsWith('"use client"')) fs.writeFileSync(path, "'use client';\n"+source);
}
edit('components/PageArticle.tsx', [
  ["'use client';\n", ''],
  ["import { useLocale } from '../contexts/LocaleContext';", "import type { Locale } from '../types';\nimport 'server-only';"],
  ['{ page, post }: { page?: Page; post?: Article }', '{ page, post, locale }: { page?: Page; post?: Article; locale: Locale }'],
  ['const { locale } = useLocale(); const article', 'const article'],
]);
edit('app/[locale]/blog/[slug]/page.tsx', [['<PageArticle post={article}/>', '<PageArticle post={article} locale={locale}/>']]);
for (const page of ['', 'about','pricing','features','guides','compare','privacy','terms']) {
  const path=`app/[locale]/${page ? page+'/' : ''}page.tsx`;
  edit(path,[['export default function Page() {', 'export default async function Page({ params }: { params: Promise<{ locale: string }> }) {\n  const { locale } = await params;'],['<PublicPage page=', '<PublicPage locale={locale} page=']]);
}
edit('app/[locale]/login/page.tsx', [['<PublicPage page=', '<PublicPage locale={locale} page=']]);
