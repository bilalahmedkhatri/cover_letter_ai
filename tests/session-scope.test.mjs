import test from 'node:test';
import assert from 'node:assert/strict';
import { nextAccountSession } from '../services/sessionScope.mjs';

test('initial sign-in and same-user updates retain the workspace; later identity changes replace it', () => {
  const initial = { user: null, loading: true, hadUser: false, scope: 0 };
  const alice = { id: 'alice' }, bob = { id: 'bob' };
  const anonymous = nextAccountSession(initial, null);
  const signedIn = nextAccountSession(anonymous, alice);
  assert.equal(signedIn.scope, 0, 'Do not discard an anonymous brief on first sign-in');
  assert.equal(nextAccountSession(signedIn, { ...alice, name: 'Updated name' }).scope, 0);
  assert.equal(nextAccountSession(signedIn, bob).scope, 1);
  const signedOut = nextAccountSession(signedIn, null);
  assert.equal(signedOut.scope, 1);
  assert.equal(nextAccountSession(signedOut, bob).scope, 2);
  assert.equal(nextAccountSession(signedOut, alice).scope, 2, 'Re-login must not revive an old workspace');
  assert.equal(nextAccountSession(initial, alice).scope, 0);
});
