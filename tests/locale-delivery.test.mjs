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
hooks.deregister();
const locales = ['en', 'ru', 'es', 'fr', 'pt', 'nl', 'ar'];

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
