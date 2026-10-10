import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { localeCodes, publicPages, localizedPath, siteOrigin } from '../services/routing.ts';

test('every sitemap route has usable HTML and exactly one canonical, title and description', () => {
  for (const locale of localeCodes) {
    const titles = new Set();
    for (const page of publicPages) {
      const route = localizedPath(locale, page);
      const html = readFileSync(`dist${route}/index.html`, 'utf8');
      assert.ok(html.includes(`<html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">`), route);
      assert.equal((html.match(/<title>/g) || []).length, 1, route);
      assert.equal((html.match(/<meta name="description"/g) || []).length, 1, route);
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1, route);
      assert.ok(html.includes(`rel="canonical" href="${siteOrigin}${route}"`), route);
      assert.ok(html.includes('id="root" data-prerendered><div'), route);
      assert.ok(html.includes('<main') && html.includes('<h1'), route);
      assert.ok(html.includes('id="app-theme-styles"'), route);
      assert.ok(!html.includes('og-image.png') && !html.includes('<!--seo-head-->'), route);
      const title = html.match(/<title>(.*?)<\/title>/s)[1];
      assert.ok(!titles.has(title), `duplicate page title: ${route}`);
      titles.add(title);
      if (page === '/privacy' || page === '/terms') {
        assert.ok(html.includes('lang="en" dir="ltr"'), route);
        assert.ok(!html.includes('hreflang='), 'Do not claim English legal text is translated');
        assert.ok(!html.includes('Last updated:'), 'Do not invent policy modification dates');
      } else {
        assert.equal((html.match(/hreflang=/g) || []).length, 8, route);
      }
      if (page === '/') assert.ok(html.includes('<details') && html.includes('<summary'), 'FAQs must work without JavaScript');
    }
  }
});

test('Russian description and social metadata are Russian in the initial response', () => {
  const html = readFileSync('dist/ru/index.html', 'utf8');
  assert.match(html, /name="description" content="Создайте/);
  assert.match(html, /property="og:locale" content="ru_RU"/);
});

test('hosting maps language URLs to their generated files', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  assert.deepEqual(config.rewrites.map(rule => rule.destination), ['/:locale/index.html', '/:locale/:page/index.html']);
});
