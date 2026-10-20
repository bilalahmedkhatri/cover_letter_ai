import test from 'node:test';
import assert from 'node:assert/strict';
import { redactAnalyticsEvent } from '../services/analyticsPrivacy.mjs';

test('telemetry removes all URL query and fragment data without modifying the current browser URL', () => {
  const original = { type: 'pageview', url: 'https://app.example/fr/login?token=secret&chat=private&unknown=personal#code' };
  const result = redactAnalyticsEvent(original);
  assert.equal(result.url, 'https://app.example/fr/login');
  assert.equal(result.type, 'pageview');
  assert.ok(original.url.includes('token=secret'));
  assert.equal(redactAnalyticsEvent({ type: 'event', url: 'https://app.example/en?code=test' }).url, 'https://app.example/en');
  assert.equal(redactAnalyticsEvent({ url: 'invalid' }), null);
});
