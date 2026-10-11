import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { billingPlans } from '../services/billingPlans.mjs';
import { createHandlers } from '../server/payments/handlers.mjs';
import { verifySignature, sortedPayload, validatePayment, paymentConfig, checkoutUrl } from '../server/payments/nowpayments.mjs';
import { session } from '../server/payments/http.mjs';
import { createStore } from '../server/payments/store.mjs';

const config = { apiKey: 'test-key', ipnKey: 'test-ipn-secret', origin: 'https://ailettergen.com', sandbox: false, enabled: true };
const orderId = 'a'.repeat(64);
const fixture = () => {
  const orders = new Map(); const accounts = new Map(); const seen = new Set(); const calls = [];
  let creates = 0;
  const store = {
    ready: true, getOrder: async id => structuredClone(orders.get(id) || null), getAccount: async id => accounts.get(id) || null,
    limit: async () => {},
    recordWebhook: async () => {}, finishWebhook: async () => {},
    createOrder: async order => { if (orders.has(order.id)) return null; orders.set(order.id, structuredClone(order)); return 'OK'; },
    saveOrder: async order => { orders.set(order.id, structuredClone(order)); },
    updateStatus: async (order, payment) => { if (!orders.get(order.id).fulfilledAt) Object.assign(orders.get(order.id), { status: payment.payment_status, paymentId: String(payment.payment_id) }); },
    settle: async (order, payment, now) => {
      if (orders.get(order.id).fulfilledAt || seen.has(String(payment.payment_id))) return 'duplicate';
      seen.add(String(payment.payment_id));
      Object.assign(orders.get(order.id), { status: 'finished', fulfilledAt: now });
      accounts.set(order.owner, { credits: (accounts.get(order.owner)?.credits || 0) + order.credits, expiresAt: now + 2592000000 });
      return 'fulfilled';
    },
  };
  const payment = { payment_id: 123, invoice_id: 99, order_id: orderId, price_currency: 'usd', price_amount: 10,
    payment_status: 'finished', pay_amount: '10.00', actually_paid: '10' };
  const provider = { request: async (path, data) => {
    calls.push({ path, data });
    if (path === '/invoice') { creates += 1; return { id: 99, invoice_url: 'https://nowpayments.io/payment/?iid=99' }; }
    return structuredClone(payment);
  } };
  const user = session(new Request(config.origin), config, true);
  const cookie = user.cookie.split(';')[0];
  const order = { id: orderId, owner: user.owner, invoiceId: '99', plan: 'starter', price: 10, credits: 100, status: 'waiting' };
  orders.set(orderId, order);
  return { orders, accounts, store, provider, payment, calls, user, cookie, order,
    handlers: createHandlers({ config, store, provider, now: () => 1000 }), creates: () => creates };
};
function ipn(event, signature) {
  const sig = signature || createHmac('sha512', config.ipnKey).update(JSON.stringify(sortedPayload(event))).digest('hex');
  return new Request(config.origin + '/api/nowpayments/ipn', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-nowpayments-sig': sig }, body: JSON.stringify(event) });
}
function checkout(cookie, overrides = {}, origin = config.origin) {
  return new Request(config.origin + '/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, Cookie: cookie },
    body: JSON.stringify({ plan: 'starter', requestId: '12345678-1234-1234-1234-123456789012', locale: 'ru', ...overrides }) });
}

test('nested signature verifies but a changed amount and invalid signatures fail', () => {
  const payload = { z: 'last', amount: 10, nested: { b: 2, a: 1 } };
  const signed = createHmac('sha512', config.ipnKey).update('{"amount":10,"nested":{"a":1,"b":2},"z":"last"}').digest('hex');
  assert.equal(verifySignature(payload, signed, config.ipnKey), true);
  assert.equal(verifySignature({ ...payload, amount: 1 }, signed, config.ipnKey), false);
  for (const invalid of [undefined, '', '00', 'z'.repeat(128)]) assert.equal(verifySignature(payload, invalid, config.ipnKey), false);
});
test('invalid signature is rejected before provider or storage credit operations', async () => {
  const f = fixture();
  assert.equal((await f.handlers.ipn(ipn(f.payment, '0'.repeat(128)))).status, 401);
  assert.equal(f.calls.length, 0); assert.equal(f.accounts.size, 0);
});
test('callback status cannot override the authoritative pending provider status', async () => {
  const f = fixture(); f.payment.payment_status = 'confirming';
  const event = { ...f.payment, payment_status: 'finished' };
  assert.equal((await f.handlers.ipn(ipn(event))).status, 200);
  assert.equal(f.accounts.size, 0); assert.equal(f.orders.get(orderId).status, 'confirming');
});
test('concurrent valid callbacks and retries grant only one plan allocation', async () => {
  const f = fixture();
  const responses = await Promise.all(Array.from({ length: 8 }, () => f.handlers.ipn(ipn(f.payment))));
  assert.ok(responses.every(response => response.status === 200));
  assert.equal(f.accounts.get(f.user.owner).credits, 100);
});
test('mismatched invoice, price, order, currency or payment identifier never credits', async () => {
  for (const changes of [{ invoice_id: 100 }, { price_amount: 1 }, { order_id: 'b'.repeat(64) }, { price_currency: 'eur' }, { payment_id: 124 }]) {
    const f = fixture(); const event = structuredClone(f.payment); Object.assign(f.payment, changes);
    assert.equal((await f.handlers.ipn(ipn(event))).status, 409);
    assert.equal(f.accounts.size, 0);
  }
});
test('partial amount cannot activate even if provider reports finished', async () => {
  const f = fixture(); f.payment.actually_paid = '9.999999999999999999';
  assert.equal((await f.handlers.ipn(ipn(f.payment))).status, 409);
  assert.equal(f.accounts.size, 0);
});
test('only finished qualifies; exact decimal comparison supports string amounts', () => {
  const f = fixture();
  assert.equal(validatePayment(f.payment, f.order), true);
  assert.equal(validatePayment({ ...f.payment, payment_status: 'confirmed' }, f.order), false);
  assert.throws(() => validatePayment({ ...f.payment, actually_paid: 'NaN' }, f.order));
  assert.throws(() => validatePayment({ ...f.payment, pay_amount: '0' }, f.order));
});
test('delayed pending callback cannot downgrade a fulfilled order', async () => {
  const f = fixture(); await f.handlers.ipn(ipn(f.payment)); f.payment.payment_status = 'waiting';
  await f.handlers.ipn(ipn(f.payment));
  assert.equal(f.orders.get(orderId).status, 'finished'); assert.equal(f.accounts.get(f.user.owner).credits, 100);
});
test('prices and credits are server-owned; browser-supplied amounts are ignored', async () => {
  const f = fixture();
  const response = await f.handlers.checkout(checkout(f.cookie, { price: 0.01, credits: 99999, plan: 'pro' }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.order.price, 28); assert.equal(result.order.credits, 2100);
  assert.equal(f.calls[0].data.price_amount, 28);
  assert.equal(f.calls[0].data.ipn_callback_url, config.origin + '/api/nowpayments/ipn');
  assert.ok(f.calls[0].data.success_url.includes('/ru/dashboard'));
});
test('parallel checkout retries create at most one provider invoice', async () => {
  const f = fixture();
  await Promise.all([f.handlers.checkout(checkout(f.cookie)), f.handlers.checkout(checkout(f.cookie))]);
  assert.equal(f.creates(), 1);
  await f.handlers.checkout(checkout(f.cookie)); assert.equal(f.creates(), 1);
});
test('unknown plans, cross-origin requests, missing sessions and disabled checkout fail closed', async () => {
  const f = fixture();
  assert.equal((await f.handlers.checkout(checkout(f.cookie, { plan: '__proto__' }))).status, 400);
  assert.equal((await f.handlers.checkout(checkout(f.cookie, {}, 'https://attacker.example'))).status, 403);
  assert.equal((await f.handlers.checkout(checkout(''))).status, 401);
  const disabled = createHandlers({ config: { ...config, enabled: false }, store: f.store, provider: f.provider });
  assert.equal((await disabled.checkout(checkout(f.cookie))).status, 503);
  assert.equal(f.creates(), 0);
});
test('another browser cannot read an order or trigger provider reconciliation', async () => {
  const f = fixture();
  const other = session(new Request(config.origin), config, true).cookie.split(';')[0];
  const response = await f.handlers.status(new Request(config.origin + '/api/billing/status?order=' + orderId, { headers: { Cookie: other } }));
  assert.equal(response.status, 404); assert.equal(f.calls.length, 0);
});
test('status cannot grant from a success URL; expiry reports zero usable credits', async () => {
  const f = fixture(); f.accounts.set(f.user.owner, { credits: 100, expiresAt: 999 });
  const response = await f.handlers.status(new Request(config.origin + '/api/billing/status?order=' + orderId, { headers: { Cookie: f.cookie } }));
  const result = await response.json();
  assert.equal(result.account.credits, 0); assert.equal(result.account.active, false);
  assert.equal(result.order.fulfilledAt, null); assert.equal(f.calls.length, 0);
});
test('storage outage returns retryable webhook error without a success acknowledgement', async () => {
  const f = fixture(); f.store.settle = async () => { throw new Error('database offline'); };
  assert.equal((await f.handlers.ipn(ipn(f.payment))).status, 500);
  assert.equal(f.accounts.size, 0);
});
test('storage adapter calls the atomic database function and hides connection errors', async () => {
  const calls = [];
  const env = { DATABASE_URL: 'postgresql://test-only' };
  const store = createStore(env, async (sql, params) => { calls.push({ sql, params }); return [{ result: 'fulfilled' }]; });
  const f = fixture(); assert.equal(await store.settle(f.order, f.payment, 1000), 'fulfilled');
  assert.ok(calls[0].sql.startsWith('SELECT billing.fulfill_order(')); assert.equal(calls[0].params[0], 'live');
  const broken = createStore(env, async () => { throw new Error(env.DATABASE_URL); });
  await assert.rejects(() => broken.getOrder(orderId), error => !error.message.includes(env.DATABASE_URL));
});
test('redirects reject lookalikes and sandbox data stays separate from live', () => {
  for (const url of ['https://nowpayments.io.attacker.example/', 'http://nowpayments.io/', 'https://attacker@nowpayments.io/']) assert.throws(() => checkoutUrl(url, false));
  assert.equal(paymentConfig({ NOWPAYMENTS_SANDBOX: 'true' }).apiUrl, 'https://api-sandbox.nowpayments.io/v1');
  assert.equal(billingPlans.pro.credits, 2100);
});
