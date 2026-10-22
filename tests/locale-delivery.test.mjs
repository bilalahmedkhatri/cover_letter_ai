import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Load the existing TS copy helpers in Node without involving Next or a provider.
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && !extname(specifier)) {
      const candidate = new URL(specifier + '.ts', context.parentURL);
      if (existsSync(candidate)) return next(candidate.href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith('file:') && url.endsWith('.ts')) return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText,
    };
    return next(url, context);
  },
});
const { getLocaleData, getPageCopy } = await import('../services/locale-data.ts');
const { translations } = await import('../services/translations.ts');
const { pricingCopy } = await import('../services/pricingCopy.ts');
const { resourceCopy } = await import('../services/resourceCopy.ts');
const { landingContent } = await import('../services/landingContent.ts');
const { dashboardCopy } = await import('../services/dashboardCopy.ts');
const { languageLabel, paymentStatusLabels } = await import('../services/dashboardLabels.ts');
const { privacyPolicyCopy } = await import('../services/privacyPolicyCopy.ts');
const { privacyGuideCopy } = await import('../services/privacyGuideCopy.ts');
const { getMetadata, alternateLocales } = await import('../services/seo.ts');
hooks.deregister();
const locales = ['en', 'ru', 'es', 'fr', 'pt', 'nl', 'ar'];

test('privacy has complete policy and reference copy in every locale without English fallback notices', () => {
  const englishPolicy = privacyPolicyCopy.en;
  const englishGuide = privacyGuideCopy('en');
  for (const locale of locales) {
    const policy = privacyPolicyCopy[locale];
    const guide = privacyGuideCopy(locale);
    assert.equal(policy.sections.length, 7, locale);
    assert.ok(policy.title && policy.back, locale);
    assert.deepEqual(guide.sections.map(section => section.id), englishGuide.sections.map(section => section.id));
    assert.equal(guide.sections.length, 14, locale);
    assert.ok(guide.reference && guide.contents && guide.title && guide.intro, locale);
    for (const [index, section] of policy.sections.entries()) {
      const original = englishPolicy.sections[index];
      assert.deepEqual(Object.keys(section).sort(), Object.keys(original).sort(), `${locale}: policy ${index}`);
      assert.equal(section.items?.length, original.items?.length, `${locale}: list ${index}`);
      for (const value of [section.title, section.intro, section.body, ...(section.items ?? [])].filter(Boolean)) assert.ok(value.trim());
      if (locale !== 'en' && section.body) assert.notEqual(section.body, original.body, `${locale}: policy ${index}`);
    }
    // Preserve the data-processing and contact disclosures in each policy.
    for (const name of ['Neon', 'Neon Auth', 'Google Gemini', 'NOWPayments', 'support@ailettergen.com']) {
      assert.ok(JSON.stringify(policy).includes(name), `${locale}: ${name}`);
    }
    for (const [index, section] of guide.sections.entries()) {
      assert.equal(section.link, englishGuide.sections[index].link, `${locale}: destination ${index}`);
      assert.ok(guide.links[section.link], `${locale}: link label ${section.id}`);
      assert.equal(section.paragraphs.length, 2, `${locale}: paragraphs ${section.id}`);
      if (locale !== 'en') {
        assert.notEqual(section.title, englishGuide.sections[index].title);
        for (const paragraph of section.paragraphs) {
          assert.ok(paragraph.trim());
          assert.ok(!englishGuide.sections[index].paragraphs.includes(paragraph), `${locale}: untranslated ${section.id}`);
        }
      }
    }
    assert.equal(getPageCopy(locale, '/privacy').legalNotice, undefined);
    assert.ok(getPageCopy(locale, '/terms').legalNotice);
    assert.equal(getMetadata(locale, '/privacy').canonical, `https://ailettergen.com/${locale}/privacy`);
  }
  assert.deepEqual(new Set(alternateLocales('/privacy')), new Set(locales));
  assert.deepEqual(alternateLocales('/terms'), []);
});

test('selected locale preserves existing copy without shipping other language dictionaries', () => {
  for (const locale of locales) {
    const data = getLocaleData(locale);
    assert.equal(data.messages.about, translations[locale].about);
    assert.equal(data.messages.cookieBannerText, translations[locale].cookieBannerText);
    assert.equal(data.messages.landingFAQ1Title, undefined);
    assert.equal(data.shell.interface.hero, undefined);
    for (const other of locales) assert.equal(data[other], undefined);
    assert.ok(Object.keys(data.messages).length < Object.keys(translations.en).length / 2);
    const landing = getPageCopy(locale, '/');
    assert.deepEqual(landing.landing, landingContent(locale));
    assert.equal(landing.messages.landingFAQ1Title, translations[locale].landingFAQ1Title);
    assert.equal(landing.messages.backToGenerator, undefined);
  }
});

test('route payloads preserve values while excluding unrelated pricing, guides and landing content', () => {
  for (const locale of locales) {
    const landing = getPageCopy(locale, '/');
    assert.equal(landing.pricing, undefined);
    assert.deepEqual(landing.pricingTeaser, { teaser: pricingCopy(locale).teaser, view: pricingCopy(locale).view });
    assert.equal(landing.resource.guides, undefined);
    assert.equal(landing.resource.features, undefined);
    const pricing = getPageCopy(locale, '/pricing');
    assert.deepEqual(pricing.pricing, pricingCopy(locale));
    assert.equal(pricing.resource, undefined);
    assert.equal(pricing.landing, undefined);
    assert.deepEqual(getPageCopy(locale, '/login'), {});
    for (const route of ['/features', '/guides', '/compare']) {
      const selected = getPageCopy(locale, route);
      for (const [key, value] of Object.entries(selected.resource)) assert.deepEqual(value, resourceCopy(locale)[key]);
      assert.equal(selected.landing, undefined);
      assert.equal(selected.pricing, undefined);
    }
    assert.equal(getPageCopy(locale, '/features').resource.guides, undefined);
    assert.equal(getPageCopy(locale, '/guides').resource.features, undefined);
    assert.equal(getPageCopy(locale, '/compare').resource.guides, undefined);
    assert.equal(getPageCopy(locale, '/privacy').aboutDescription, undefined);
  }
});


test('dashboard copy covers every selected locale and keeps public payloads small', () => {
  const english = dashboardCopy('en');
  for (const locale of locales) {
    const selected = dashboardCopy(locale);
    assert.deepEqual(Object.keys(selected), Object.keys(english));
    for (const [key, value] of Object.entries(selected)) {
      assert.ok(typeof value === 'string' && value.trim(), `${locale}: ${key}`);
    }
    if (locale !== 'en') {
      for (const key of ['Write Confidently', 'Job cover letter', 'Output language', 'Waiting for payment', 'New Chat', 'Free']) {
        assert.notEqual(selected[key], english[key], `${locale}: ${key}`);
      }
    }
    assert.equal(getLocaleData(locale).dashboard, undefined);
    assert.equal(getPageCopy(locale, '/').dashboard, undefined);
  }
});

test('display translations preserve gateway language and payment status values', () => {
  assert.equal(languageLabel('ru', 'Russian'), 'русский');
  assert.equal(languageLabel('fr', 'Russian'), 'russe');
  assert.equal(languageLabel('ar', 'French'), 'الفرنسية');
  assert.equal(languageLabel('en', 'Unknown'), 'Unknown');
  const expected = ['creating', 'waiting', 'confirming', 'confirmed', 'sending', 'partially_paid', 'finished', 'failed', 'refunded', 'expired'];
  for (const status of expected) {
    assert.ok(paymentStatusLabels[status]);
    for (const locale of locales) assert.ok(dashboardCopy(locale)[paymentStatusLabels[status]]);
  }
  assert.equal(paymentStatusLabels.waiting, 'Waiting for payment');
});
