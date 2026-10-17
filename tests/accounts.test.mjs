import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createAccountStore } from '../server/accounts/store.mjs';
import { createAccountHandlers } from '../server/accounts/handlers.mjs';
import { createIdentity } from '../server/accounts/auth.mjs';
import { pageArticles, articleCharacterCount, articleSections } from '../services/pageArticles.mjs';
import { blogPosts } from '../services/blogContent.mjs';
import { publicPages, allPages, resolveRoute } from '../services/routing.ts';

let db; let store;
const alice = { id: 'test-alice', name: 'Alice' }; const bob = { id: 'test-bob', name: 'Bob' };
before(async () => {
  db = new PGlite();
  for (const migration of ['202610110001_billing','202610120001_generation_allowances','202610120002_accounts','202610160002_remove_saved_drafts']) await db.exec(await readFile(`prisma/migrations/${migration}/migration.sql`, 'utf8'));
  store = createAccountStore({ DATABASE_URL: 'test-only' }, async (text, args) => (await db.query(text, args)).rows);
});
after(async () => db.close());

test('existing published reviews remain available only with consent', async () => {
  const id = randomUUID();
  await db.query("INSERT INTO app.reviews(id,user_id,display_name,rating,content,publish_consent) VALUES($1,$2,'A',4,'An existing consented review.',true)", [id,alice.id]);
  assert.deepEqual(await store.reviews(), []);
  await db.query("UPDATE app.reviews SET status='published' WHERE id=$1", [id]);
  assert.equal((await store.reviews()).length, 1);
  await db.query("UPDATE app.reviews SET status='rejected' WHERE id=$1", [id]);
  assert.deepEqual(await store.reviews(), []);
});
test('removed draft and feedback actions are rejected; their pages no longer resolve', async () => {
  const handlers=createAccountHandlers({identity:async()=>alice,store,env:{}});
  for (const action of ['document','delete','review']) {
    const response=await handlers.account(new Request('https://ailettergen.com/api/account',{method:'POST',headers:{origin:'https://ailettergen.com','content-type':'application/json'},body:JSON.stringify({action,id:randomUUID()})}));
    assert.equal(response.status,400);
    assert.match((await response.json()).error,/Unknown account action/);
  }
  const overview=await store.overview(alice);
  assert.equal('documents' in overview,false);
  assert.equal((await db.query("SELECT to_regclass('app.documents') AS name")).rows[0].name,null);
  for(const locale of ['en','ru','ar'])for(const route of ['drafts','feedback'])assert.equal(resolveRoute(`/${locale}/dashboard/${route}`).page,'/404');
});

test('account profile saves preferences separately for each identity', async () => {
  await store.profile(alice, { name: 'Alice', skills: 'Research', experience: 'Student project', language: 'Russian', tone: 'Formal' });
  assert.equal((await store.overview(alice)).profile.language, 'Russian');
  assert.equal((await store.overview(bob)).profile.language, 'English');
});
test('protected account API rejects unauthenticated access', async () => {
  const handlers = createAccountHandlers({ env: {}, store });
  assert.equal((await handlers.account(new Request('https://ailettergen.com/api/account'))).status, 401);
  await assert.rejects(createIdentity({})(new Request('https://ailettergen.com', { headers: { authorization: 'Bearer malformed' } })), /not configured/);
});
test('mutations reject other origins, missing consent and oversized or invalid data', async () => {
  const handlers = createAccountHandlers({ identity: async () => alice, store, env: {} });
  const request = (input, origin = 'https://ailettergen.com') => new Request('https://ailettergen.com/api/account', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  assert.equal((await handlers.account(request({ action: 'profile' }, 'https://other.example'))).status, 403);
  assert.equal((await handlers.account(request({ action: 'review', id: randomUUID(), name: 'A', content: 'Long enough honest review', rating: 5, consent: false }))).status, 400);
  assert.equal((await handlers.account(request({ action: 'document', id: randomUUID(), title: ' ', kind: 'letter', content: 'text' }))).status, 400);
  assert.equal((await handlers.account(request({ action: 'profile', name: '', skills: '', experience: '', language: 'Fake', tone: 'Formal' }))).status, 400);
});
test('public reference pages and blog articles have 10,000+ characters and working destinations', () => {
  assert.deepEqual(Object.keys(pageArticles).filter(page=>!page.startsWith('/dashboard')).sort(), publicPages.filter(page => page !== '/' && page !== '/blog').sort());
  for (const page of Object.keys(pageArticles)) {
    assert.ok(articleCharacterCount(page) >= 10000, page);
    for (const section of articleSections(page)) assert.notEqual(resolveRoute('/en' + section.link).page, '/404', `${page}: ${section.link}`);
  }
  assert.ok(publicPages.includes('/blog') && blogPosts.length > 0);
  for (const post of blogPosts) {
    const sections = articleSections(post.ids);
    assert.ok([post.title, post.intro, ...sections.flatMap(section => [section.title, ...section.paragraphs])].join(' ').length >= 10000, post.slug);
    for (const link of [post.action, ...sections.map(section => section.link)]) assert.notEqual(resolveRoute('/en' + link).page, '/404', `${post.slug}: ${link}`);
  }
  assert.ok(allPages.includes('/login') && allPages.includes('/account'));
  assert.ok(!publicPages.includes('/login') && !publicPages.includes('/account'));
});
