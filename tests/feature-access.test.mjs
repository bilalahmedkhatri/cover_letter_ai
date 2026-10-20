import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { availableWorkflows } from '../server/feature-access.mjs';
import { createAIHandler } from '../server/ai/handler.mjs';
import { createAccountStore } from '../server/accounts/store.mjs';
const env = { NODE_ENV: 'production', BILLING_SITE_URL: 'https://app.example' };
const user = { id: 'account', email: 'bilal.cloudscourt@gmail.com', emailVerified: true };
const brief = { kind: 'cover-letter', name: 'Alex', recipient: '', resumeText: '', skills: '', experience: '', url: '', description: 'Write a short letter from my verified experience.', language: 'English', tone: 'Formal', length: 'short' };

test('only verified developer identity or authenticated local development can use unreleased workflows', () => {
  assert.deepEqual(availableWorkflows(null, env), ['cover-letter']);
  for (const identity of [{ id: 'other', email: 'visitor@example.com', emailVerified: true }, { ...user, emailVerified: false }, { ...user, emailVerified: undefined }, { email: user.email, emailVerified: true }]) assert.deepEqual(availableWorkflows(identity, env), ['cover-letter']);
  assert.equal(availableWorkflows(user, env).length, 4);
  assert.equal(availableWorkflows({ ...user, email: 'BILAL.CLOUDSCOURT@GMAIL.COM' }, env).length, 4);
  assert.equal(availableWorkflows({ id: 'local' }, { NODE_ENV: 'development' }).length, 4);
  assert.deepEqual(availableWorkflows({ id: 'other' }, { ...env, VERCEL_ENV: 'preview' }), ['cover-letter']);
});

test('forged private workflow requests stop before history storage and AI calls', async () => {
  for (const kind of ['university', 'email', 'research']) {
    const handler = createAIHandler({ research: kind === 'research', env, identity: async () => ({ id: 'ordinary' }), storeFactory: () => { throw new Error('Storage must not run'); }, generate: () => { throw new Error('AI must not run'); } });
    const body = kind === 'research' ? { url: 'https://example.edu', questions: 'Check current requirements.', language: 'English', programme: 'Computing' } : { ...brief, kind };
    const response = await handler(new Request('https://app.example/api/generate', { method: 'POST', headers: { origin: 'https://app.example', 'Content-Type': 'application/json', 'x-developer-access': 'true' }, body: JSON.stringify({ ...body, email: user.email, emailVerified: true, developer: true }) }));
    assert.equal(response.status, 404, kind);
    assert.equal((await response.json()).error, 'Feature not found.');
  }
});

test('developer requests use existing generation and normal cover-letter requests remain public', async () => {
  for (const [identity, kind] of [[user, 'university'], [{ id: 'ordinary' }, 'cover-letter']]) {
    let generated = 0;
    const handler = createAIHandler({ env, identity: async () => identity, storeFactory: () => ({ startConversation: async () => ({ state: 'created', chat_id: randomUUID(), message_id: randomUUID() }), conversation: async () => ({ messages: [] }), finishConversation: async () => true }), generate: async () => { generated++; return { text: 'A response', sources: [] }; } });
    const response = await handler(new Request('https://app.example/api/generate', { method: 'POST', headers: { origin: 'https://app.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ ...brief, kind }) }));
    assert.equal(response.status, 200); assert.equal(generated, 1);
  }
});

test('private history remains hidden on list, direct reads, rename, delete and append after access is lost', async () => {
  const db = new PGlite();
  try {
    for (const migration of ['202610120002_accounts', '202610160001_chat_history', '202610190001_conversation_titles','202610200001_generation_abuse_guards']) await db.exec(await readFile(`prisma/migrations/${migration}/migration.sql`, 'utf8'));
    const store = createAccountStore(env, async (text, args) => (await db.query(text, args)).rows);
    const started = await store.startConversation(user, { workflow: 'email', requestId: randomUUID(), input: brief });
    const ordinary = { id: user.id };
    assert.equal((await store.conversations(ordinary)).items.length, 0);
    assert.equal((await store.conversations(user)).items.length, 1);
    for (const action of [() => store.conversation(ordinary, started.chat_id), () => store.renameConversation(ordinary, started.chat_id, 'Hidden'), () => store.removeConversation(ordinary, started.chat_id), () => store.startConversation(ordinary, { workflow: 'email', requestId: randomUUID(), input: brief })]) await assert.rejects(action, error => error.status === 404);
    assert.equal((await store.conversation(user, started.chat_id)).messages.length, 2);
  } finally { await db.close(); }
});
