// Server-selected copy. Client components must import only types from this module.
import type { Locale } from '../types';
import { translations, type TranslationKeys } from './translations';
import { interfaceCopy } from './interfaceCopy';
import { landingContent } from './landingContent';
import { resourceCopy, resourceLabels, resourceNotice } from './resourceCopy';
import { pricingCopy, pricingLabel, pricingNotice } from './pricingCopy';
import { billingCopy } from './billingCopy';
import { businessLetterCopy } from './businessLetterCopy.mjs';
import { blogCopy } from './blogContent.mjs';
import { footerContext } from './footerContext';
import { getMetadata, legalLanguageNotice } from './seo';
import { publicWorkflows } from './workflow.mjs';
import type { Page } from './routing';
import type { DashboardCopy } from './dashboardCopy';

export function getLocaleData(locale: Locale) {
  const copy = interfaceCopy(locale);
  return {
    // Preserve the existing English fallback, but send just the selected language.
    messages: selectMessages(locale, ['about', 'privacy', 'terms', 'themeSwitch', 'footerLinks', 'footerHome', 'footerGenerator', 'footerLegal', 'footerAbout', 'footerPrivacy', 'footerTerms', 'footerCopyright', 'cookieBannerText', 'cookieLearnMore', 'cookieReject', 'cookieAccept', 'backToTop']),
    shell: {
      interface: { menu: copy.menu, start: copy.start, language: copy.language },
      resources: resourceLabels[locale],
      pricing: pricingLabel[locale],
      blog: blogCopy[locale].label,
      footer: footerContext[locale],
    },
  };
}
export type LocaleData = ReturnType<typeof getLocaleData>;

export type PageCopy = {
  dashboard?: DashboardCopy;
  messages?: Partial<Record<TranslationKeys, string>>;
  interface?: ReturnType<typeof interfaceCopy>;
  landing?: ReturnType<typeof landingContent>;
  resource?: Partial<ReturnType<typeof resourceCopy>>;
  pricing?: ReturnType<typeof pricingCopy>;
  pricingTeaser?: Pick<ReturnType<typeof pricingCopy>, 'teaser' | 'view'>;
  billing?: ReturnType<typeof billingCopy>;
  business?: typeof businessLetterCopy.en;
  resourceNotice?: string;
  pricingNotice?: string;
  legalNotice?: string;
  aboutDescription?: string;
};

export function getPageCopy(locale: Locale, page: Page): PageCopy {
  const copy: PageCopy = {};
  if (page === '/' || page === '/about') {
    copy.messages = selectMessages(locale, Object.keys(translations.en).filter(key => key.startsWith('landing')) as TranslationKeys[]);
  }
  if (['/about', '/privacy', '/terms'].includes(page)) {
    copy.messages = { ...copy.messages, ...selectMessages(locale, ['backToGenerator']) };
  }
  if (page === '/') {
    copy.interface = interfaceCopy(locale);
    copy.landing = landingContent(locale);
    const pricing = pricingCopy(locale);
    // Landing uses only the teaser; never serialize the entire pricing table here.
    copy.pricingTeaser = { teaser: pricing.teaser, view: pricing.view };
  }
  if (['/', '/features', '/guides', '/compare'].includes(page)) {
    const resource = resourceCopy(locale);
    const comparison = ['compareHeading', 'compareIntro', 'product', 'price', 'focus', 'ownPeriod', 'ownFocus', 'reziPeriod', 'reziFocus', 'tealPeriod', 'tealFocus', 'source', 'checked', 'fair'] as const;
    const keys: (keyof typeof resource)[] = page === '/' ? [...comparison, 'beforeSend', 'guideSection', 'guideSectionIntro', 'reviewSteps', 'viewGuides', 'generic', 'genericExample', 'specific', 'specificExample', 'exampleNote', 'viewCompare']
      : page === '/features' ? ['featuresTitle', 'featuresIntro', 'features', 'limitsTitle', 'limits', 'start']
      : page === '/guides' ? ['guidesTitle', 'guidesIntro', 'guides', 'useOutline', 'outlineNote', 'beforeSend', 'checks', 'start']
      : [...comparison, 'compareTitle', 'choiceTitle', 'choice', 'featuresTitle', 'start'];
    copy.resource = Object.fromEntries(keys.map(key => [key, resource[key]]));
    copy.resourceNotice = resourceNotice[locale];
    if (publicWorkflows.includes('email')) copy.business = businessLetterCopy[locale];
  }
  if (page === '/pricing' || page === '/dashboard/billing' || page === '/dashboard/settings') {
    copy.pricing = pricingCopy(locale);
    copy.billing = billingCopy(locale);
    copy.pricingNotice = pricingNotice[locale];
  }
  if (page === '/about') copy.aboutDescription = getMetadata(locale, page).description;
  if (page === '/terms') copy.legalNotice = legalLanguageNotice[locale];
  return copy;
}

function selectMessages(locale: Locale, keys: TranslationKeys[]) {
  return Object.fromEntries(keys.map(key => [key, translations[locale][key] || translations.en[key]])) as Partial<Record<TranslationKeys, string>>;
}
