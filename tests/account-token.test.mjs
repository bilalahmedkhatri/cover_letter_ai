import test from 'node:test';
import assert from 'node:assert/strict';
import { accountToken, usableJwt } from '../services/accountToken.mjs';
const jwt = (exp = Date.now()/1000 + 300) => ['header', Buffer.from(JSON.stringify({exp})).toString('base64url'), 'signature'].join('.');

test('managed session JWT works even when the extra token endpoint is unavailable', async () => {
  const token = jwt(); let called = false;
  assert.equal(await accountToken({getSession: async () => ({data:{session:{token}}}),token: async () => {called=true;throw new TypeError('Failed to fetch');}}),token);
  assert.equal(called,false);
});
test('opaque session IDs and expired JWTs require a fresh signed token', async () => {
  for (const oldToken of ['session-id',jwt(1)]) {
    const token=jwt();
    assert.equal(await accountToken({getSession: async () => ({data:{session:{token:oldToken}}}),token: async () => ({data:{token}})}),token);
  }
});
test('unusable tokens fail closed and transport failures remain identifiable', async () => {
  assert.equal(usableJwt('not.a.jwt'),false);
  await assert.rejects(accountToken({getSession:async()=>({data:null}),token:async()=>({data:{token:'opaque-session'}})}),/sign in again/);
  await assert.rejects(accountToken({getSession:async()=>{throw new TypeError('Failed to fetch');}}),TypeError);
});
