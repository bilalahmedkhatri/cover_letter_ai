import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveRoute, localizedPath, localeCodes, publicPages, siteOrigin } from '../services/routing.ts';

test('legacy URLs always resolve to English and are idempotent', () => {
  for (const page of publicPages) {
    const route = resolveRoute(page);
    assert.equal(route.locale, 'en');
    assert.equal(route.path, page === '/' ? '/en' : '/en' + page);
    assert.deepEqual(resolveRoute(route.path), route);
  }
});

test('all supported language routes preserve their language and page', () => {
  for (const locale of localeCodes) {
    for (const page of publicPages) {
      const path = localizedPath(locale, page);
      assert.deepEqual(resolveRoute(path), { locale, page, path });
      assert.deepEqual(resolveRoute(path + '/'), { locale, page, path });
    }
  }
});

test('unknown URLs and missing assets never become valid localized pages', () => {
  for (const path of ['/missing', '/de', '/en/missing', '/ru/missing', '/og-image.png', '/assets/missing.js']) {
    const route = resolveRoute(path);
    assert.equal(route.page, '/404');
    assert.equal(route.path, path);
  }
});

test('the sitemap contains exactly the canonical public language URLs', () => {
  const xml = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  const expected = localeCodes.flatMap(locale => publicPages.map(page => siteOrigin + localizedPath(locale, page)));
  assert.equal(new Set(urls).size, urls.length);
  assert.deepEqual(urls.slice().sort(), expected.sort());
  for (const url of urls) {
    assert.equal(resolveRoute(new URL(url).pathname).path, new URL(url).pathname);
  }
  assert.ok(!xml.includes('<lastmod>'), 'Do not publish guessed last-modification dates');
});
