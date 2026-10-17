import test from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../app/llms.txt/route.ts';
import sitemap from '../app/sitemap.ts';
import { canonicalLocale,contentLocales } from '../services/routing.ts';

test('untranslated page aliases consolidate to real content languages',()=>{
  for(const page of ['/features','/pricing','/guides','/compare']){
    assert.equal(canonicalLocale('es',page),'en');
    assert.equal(canonicalLocale('ru',page),'ru');
    assert.deepEqual(contentLocales(page),['en','ru']);
  }
  for(const page of ['/privacy','/terms','/blog/university-motivation-letter'])assert.equal(canonicalLocale('ru',page),'en');
  assert.equal(canonicalLocale('ar','/'),'ar');
});

test('llms.txt stays synchronized with the public sitemap and accurately separates planned tools',async()=>{
  const response=GET();assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^text\/plain/);
  const text=await response.text();
  const links=[...text.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(match=>match[1]);
  assert.deepEqual(links.sort(),sitemap().map(entry=>entry.url).sort());
  assert.equal(new Set(links).size,links.length);
  assert.ok(links.every(link=>!/(dashboard|api\/|login|account)/.test(link)));
  assert.match(text,/Currently public: Job cover letter/);
  assert.match(text,/in development and are not generally available/);
  assert.doesNotMatch(text,/API_KEY|COOKIE_SECRET|bilal\./);
});
