import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createAccountStore } from '../server/accounts/store.mjs';
import { createAccountHandlers } from '../server/accounts/handlers.mjs';
import { createIdentity } from '../server/accounts/auth.mjs';
import { pageArticles, articleCharacterCount, articleSections } from '../services/pageArticles.mjs';
import { publicPages, allPages, resolveRoute } from '../services/routing.ts';

let db; let store;
const alice = { id: 'test-alice', name: 'Alice' }; const bob = { id: 'test-bob', name: 'Bob' };
before(async () => {
  db = new PGlite();
  for (const migration of ['202610110001_billing','202610120001_generation_allowances','202610120002_accounts']) await db.exec(await readFile(`prisma/migrations/${migration}/migration.sql`, 'utf8'));
  store = createAccountStore({ DATABASE_URL: 'test-only' }, async (text, args) => (await db.query(text, args)).rows);
});
after(async () => db.close());

test('cloud documents remain isolated on reads, overwrites and deletes', async () => {
  const id = randomUUID(); const document = { id, kind: 'letter', title: 'Application', content: 'Private draft', context: {} };
  await store.document(alice, document);
  assert.equal((await store.overview(alice)).documents.length, 1);
  assert.equal((await store.overview(bob)).documents.length, 0);
  await assert.rejects(store.document(bob, { ...document, content: 'Changed' }), /Unable to save/);
  await assert.rejects(store.remove(bob, id), /not found/);
  assert.equal((await store.overview(alice)).documents[0].content, 'Private draft');
  await store.remove(alice, id);
  assert.equal((await store.overview(alice)).documents.length, 0);
});
test('long multilingual drafts fit the documented limits',async()=>{
 const id=randomUUID();const content='П'.repeat(20000);
 const handlers=createAccountHandlers({identity:async()=>alice,store,env:{}});
 const response=await handlers.account(new Request('https://ailettergen.com/api/account',{method:'POST',headers:{origin:'https://ailettergen.com','content-type':'application/json'},body:JSON.stringify({action:'document',id,kind:'letter',title:'Long multilingual draft',content,context:{experience:'П'.repeat(6000),skills:'Д'.repeat(4000)}})}));
 assert.equal(response.status,200);assert.equal((await store.overview(alice)).documents.find(d=>d.id===id).content,content);await store.remove(alice,id);
});
test('new reviews are pending; only consented published feedback is public', async () => {
  const id = randomUUID();
  await store.review(alice, { id, name: 'A', rating: 4, content: 'A real test of the editing workflow.' });
  assert.deepEqual(await store.reviews(), []);
  await db.query("UPDATE app.reviews SET status='published' WHERE id=$1", [id]);
  assert.equal((await store.reviews()).length, 1);
  await store.review(alice, { id, name: 'A', rating: 3, content: 'An edited review must return to moderation.' });
  assert.deepEqual(await store.reviews(), []);
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
test('every public nonlanding page has 10,000+ visible reference characters and working internal destinations', () => {
  assert.deepEqual(Object.keys(pageArticles).filter(page=>!page.startsWith('/dashboard')).sort(), publicPages.filter(page => page !== '/').sort());
  for (const page of Object.keys(pageArticles)) {
    assert.ok(articleCharacterCount(page) >= 10000, page);
    for (const section of articleSections(page)) assert.notEqual(resolveRoute('/en' + section.link).page, '/404', `${page}: ${section.link}`);
  }
  assert.ok(allPages.includes('/login') && allPages.includes('/account'));
  assert.ok(!publicPages.includes('/login') && !publicPages.includes('/account'));
});
