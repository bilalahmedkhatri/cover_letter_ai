import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { billingPlans } from '../services/billingPlans.mjs';
import { runMeteredGeneration } from '../server/ai/metered-generation.mjs';
import { createStore } from '../server/payments/store.mjs';

let db; let live; let sandbox;
const instant = Date.UTC(2026, 9, 11);
const id = () => randomBytes(32).toString('hex');
let invoice = 9000; let payment = 10000;
before(async () => {
  db = new PGlite();
  await db.exec(await readFile('prisma/migrations/202610110001_billing/migration.sql', 'utf8'));
  await db.exec(await readFile('prisma/migrations/202610120001_generation_allowances/migration.sql', 'utf8'));
  await db.exec(await readFile('prisma/migrations/202610150001_free_generation_quota/migration.sql', 'utf8'));
  const query = async (text, params) => (await db.query(text, params)).rows;
  live = createStore({ DATABASE_URL: 'test-only' }, query);
  sandbox = createStore({ DATABASE_URL: 'test-only', NOWPAYMENTS_SANDBOX: 'true' }, query);
});
after(async () => { await db.close(); });
async function order(store, owner = id(), plan = 'starter', orderId = id()) {
  const price = { starter: 10, plus: 20, pro: 28 }[plan];
  const credits = billingPlans[plan].credits;
  const result = { id: orderId, owner, plan, price, credits, createdAt: instant, invoiceId: String(++invoice), invoiceUrl: 'https://nowpayments.io/payment/?iid=' + invoice };
  assert.ok(await store.createOrder(result)); await store.saveOrder(result); return result;
}
const paid = o => ({ payment_id: String(++payment), invoice_id: o.invoiceId, price_amount: o.price, pay_currency: 'usdtbsc', pay_amount: '10.123456789123456789', actually_paid: '10.123456789123456789' });

test('migration builds thirteen billing tables and seeds exact plan prices/allocations', async () => {
  const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='billing'");
  assert.equal(tables.rows.length, 13);
  const plans = (await db.query('SELECT id,price_cents,credits FROM billing.plans ORDER BY price_cents')).rows;
  assert.deepEqual(plans, [{ id: 'starter', price_cents: 1000, credits: 120 }, { id: 'plus', price_cents: 2000, credits: 630 }, { id: 'pro', price_cents: 2800, credits: 2100 }]);
});
test('authenticated billing owner stays stable across devices and separate between users and environments', async () => {
  const first = await live.authenticatedOwner('account-alice', id());
  assert.equal(await live.authenticatedOwner('account-alice', id()), first);
  assert.notEqual(await live.authenticatedOwner('account-bob', id()), first);
  assert.notEqual(await sandbox.authenticatedOwner('account-alice', id()), first);
});

test('real PostgreSQL function grants exactly once for eight simultaneous retries', async () => {
  const o = await order(live); const p = paid(o);
  const results = await Promise.all(Array.from({ length: 8 }, () => live.settle(o, p, instant)));
  assert.equal(results.filter(value => value === 'fulfilled').length, 1);
  assert.equal(results.filter(value => value === 'duplicate').length, 7);
  assert.equal((await live.getAccount(o.owner)).credits, 120);
  assert.equal((await live.getOrder(o.id)).status, 'finished');
  const receipts = (await db.query('SELECT count(*)::int AS count FROM billing.credit_ledger WHERE order_id=$1', [o.id])).rows;
  assert.equal(receipts[0].count, 1);
});
test('distinct purchases stack atomically and create separate subscription periods', async () => {
  const owner = id(); const a = await order(live, owner); const b = await order(live, owner, 'plus');
  await Promise.all([live.settle(a, paid(a), instant), live.settle(b, paid(b), instant)]);
  const balance = await live.getAccount(owner);
  assert.equal(balance.credits, 750); assert.equal(balance.expiresAt, instant + 60 * 86400000);
  const periods = (await db.query('SELECT count(*)::int AS count FROM billing.subscriptions WHERE customer_id=$1', [owner])).rows;
  assert.equal(periods[0].count, 2);
});
test('expired credits are removed with a ledger entry before granting a new purchase', async () => {
  const owner = id(); const a = await order(live, owner); await live.settle(a, paid(a), instant);
  const b = await order(live, owner, 'plus'); await live.settle(b, paid(b), instant + 31 * 86400000);
  assert.equal((await live.getAccount(owner)).credits, 630);
  const changes = (await db.query('SELECT kind,delta FROM billing.credit_ledger WHERE customer_id=$1 ORDER BY created_at,delta', [owner])).rows;
  assert.deepEqual(changes, [{ kind: 'purchase', delta: 120 }, { kind: 'expiry', delta: -120 }, { kind: 'purchase', delta: 630 }]);
});
test('database rejects invoice mismatches and partially paid amounts independently of API validation', async () => {
  const o = await order(live); const p = paid(o);
  assert.equal(await live.settle(o, { ...p, invoice_id: '999999' }, instant), 'mismatch');
  assert.equal(await live.settle(o, { ...p, actually_paid: '10.123456789123456788' }, instant), 'underpaid');
  assert.equal(await live.getAccount(o.owner), null);
});
test('late callbacks cannot downgrade a completed order', async () => {
  const o = await order(live); const p = paid(o); await live.settle(o, p, instant);
  await live.updateStatus(o, { ...p, payment_status: 'waiting' });
  assert.equal((await live.getOrder(o.id)).status, 'finished');
});
test('live and sandbox cannot share an order or credit allocation', async () => {
  const owner = id(); const sameId = id();
  const a = await order(live, owner, 'starter', sameId); const b = await order(sandbox, owner, 'pro', sameId);
  await live.settle(a, paid(a), instant); await sandbox.settle(b, paid(b), instant);
  assert.equal((await live.getAccount(owner)).credits, 120); assert.equal((await sandbox.getAccount(owner)).credits, 2100);
});
test('duplicate checkout insert never creates a second order', async () => {
  const o = await order(live); assert.equal(await live.createOrder(o), null);
});
test('durable webhook audit records retry attempts and processing time', async () => {
  const o = await order(live); const eventId = id(); const p = paid(o);
  const event = { order_id: o.id, payment_id: p.payment_id, payment_status: 'finished' };
  await live.recordWebhook(event, eventId); await live.recordWebhook(event, eventId); await live.finishWebhook(eventId);
  const rows = (await db.query('SELECT attempts,processed_at FROM billing.webhook_events WHERE id=$1', [eventId])).rows;
  assert.equal(rows[0].attempts, 2); assert.ok(rows[0].processed_at);
});
test('rate limit increments atomically under concurrent calls', async () => {
  const key = id();
  const results = await Promise.allSettled(Array.from({ length: 4 }, () => live.limit(key, 2, 3600)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 2);
});

test('every plan enforces the exact standard, premium and research maxima under concurrent reservations', async () => {
  for (const plan of Object.values(billingPlans)) {
    for (const [operation, maximum] of [['standard', plan.standardLetters], ['premium', plan.premiumLetters], ['research', plan.universityResearch]]) {
      const o = await order(live, id(), plan.id); await live.settle(o, paid(o), instant);
      const results = await Promise.all(Array.from({ length: maximum + 2 }, () => live.reserveGeneration(o.owner, id(), operation, instant)));
      assert.equal(results.filter(r => r === 'created').length, maximum, `${plan.id} ${operation}`);
      assert.equal(results.filter(r => r === 'exhausted').length, 2);
    }
  }
});

test('mixed usage shares an allowance and failed generation restores it exactly once', async () => {
  const o = await order(live); await live.settle(o, paid(o), instant);
  const request = id();
  assert.equal(await live.reserveGeneration(o.owner, request, 'premium', instant), 'created');
  assert.equal(await live.reserveGeneration(o.owner, request, 'premium', instant), 'reserved');
  assert.deepEqual((await live.getAccount(o.owner)).remaining, { standardLetters: 26, premiumLetters: 7, universityResearch: 4 });
  assert.equal(await live.settleGeneration(o.owner, request, false, instant), 'released');
  assert.equal(await live.settleGeneration(o.owner, request, false, instant), 'released');
  assert.deepEqual((await live.getAccount(o.owner)).remaining, { standardLetters: 30, premiumLetters: 8, universityResearch: 5 });
});

test('successful generation is charged once, retries do not call the provider again', async () => {
  const o = await order(live, id(), 'plus'); await live.settle(o, paid(o), instant);
  const requestId = id(); let calls = 0;
  const input = { store: live, owner: o.owner, requestId, operation: 'standard', now: () => instant,
    generate: async () => { calls++; return 'A letter'; } };
  assert.equal(await runMeteredGeneration(input), 'A letter');
  await assert.rejects(() => runMeteredGeneration(input), error => error.status === 409);
  assert.equal(calls, 1);
  assert.equal((await live.getAccount(o.owner)).remaining.standardLetters, 69);
  const entries = (await db.query("SELECT delta FROM billing.credit_ledger WHERE customer_id=$1 AND kind='usage'", [o.owner])).rows;
  assert.deepEqual(entries, [{ delta: -9 }]);
});

test('provider failure releases usage, but completion-storage failure keeps it held', async () => {
  const o = await order(live); await live.settle(o, paid(o), instant);
  await assert.rejects(() => runMeteredGeneration({ store: live, owner: o.owner, requestId: id(), operation: 'premium', now: () => instant,
    generate: async () => { throw new Error('provider failed'); } }));
  assert.equal((await live.getAccount(o.owner)).remaining.premiumLetters, 8);
  const broken = { ...live, settleGeneration: async () => { throw new Error('database offline'); } };
  await assert.rejects(() => runMeteredGeneration({ store: broken, owner: o.owner, requestId: id(), operation: 'premium', now: () => instant,
    generate: async () => 'Generated letter' }));
  assert.equal((await live.getAccount(o.owner)).remaining.premiumLetters, 7);
});

test('expired reservations cannot restore an old allowance into a new purchase', async () => {
  const owner = id(); const a = await order(live, owner); await live.settle(a, paid(a), instant);
  const request = id(); await live.reserveGeneration(owner, request, 'premium', instant);
  const later = instant + 31 * 86400000;
  assert.equal(await live.reserveGeneration(owner, id(), 'standard', later), 'expired');
  const b = await order(live, owner, 'pro'); await live.settle(b, paid(b), later);
  await live.settleGeneration(owner, request, false, later);
  assert.equal((await live.getAccount(owner)).credits, 2100);
  assert.deepEqual((await live.getAccount(owner)).remaining, { standardLetters: 100, premiumLetters: 28, universityResearch: 15 });
});

test('different-plan renewals preserve each purchased allowance and its weights', async () => {
  const owner = id(); const a = await order(live, owner); const b = await order(live, owner, 'plus');
  await live.settle(a, paid(a), instant); await live.settle(b, paid(b), instant);
  assert.deepEqual((await live.getAccount(owner)).remaining, { standardLetters: 100, premiumLetters: 26, universityResearch: 15 });
  await live.reserveGeneration(owner, id(), 'premium', instant);
  assert.deepEqual((await live.getAccount(owner)).remaining, { standardLetters: 96, premiumLetters: 25, universityResearch: 14 });
});

test('migration preserves existing purchased weights and refuses ambiguous used balances atomically', async () => {
  const readMigration = await readFile('prisma/migrations/202610120001_generation_allowances/migration.sql', 'utf8');
  for (const used of [false, true]) {
    const old = new PGlite();
    try {
      await old.exec(await readFile('prisma/migrations/202610110001_billing/migration.sql', 'utf8'));
      const owner = id(); const orderId = id(); const time = new Date().toISOString();
      await old.query("INSERT INTO billing.customers(environment,id) VALUES('live',$1)", [owner]);
      await old.query("INSERT INTO billing.orders(environment,id,customer_id,plan_id,price_cents,credits,invoice_id) VALUES('live',$1,$2,'starter',1000,100,'legacy-invoice')", [orderId, owner]);
      await old.query("SELECT billing.fulfill_order('live',$1,'legacy-invoice','legacy-payment',1000,'usdt',10,10,$2)", [orderId, time]);
      if (used) {
        await old.query("UPDATE billing.credit_accounts SET credits=99 WHERE customer_id=$1", [owner]);
        await old.query("INSERT INTO billing.credit_ledger(environment,customer_id,kind,delta,balance_after) VALUES('live',$1,'usage',-1,99)", [owner]);
        await assert.rejects(() => old.exec(readMigration), /existing usage needs/i);
        await old.exec('ROLLBACK');
        assert.equal((await old.query("SELECT credits FROM billing.plans WHERE id='starter'")).rows[0].credits, 100);
      } else {
        await old.exec(readMigration);
        const allocation = (await old.query('SELECT remaining_units,standard_cost,premium_cost FROM billing.usage_allocations WHERE order_id=$1', [orderId])).rows[0];
        assert.deepEqual(allocation, { remaining_units: 100, standard_cost: 1, premium_cost: 4 });
      }
    } finally { await old.close(); }
  }
});

const freeOwner = () => live.authenticatedOwner('free-'+id(),id());
test('free quota atomically permits only three concurrent holds and blocks duplicate delivery',async()=>{
 const owner=await freeOwner();
 const results=await Promise.all(Array.from({length:12},()=>live.reserveFreeGeneration(owner,id(),instant)));
 assert.equal(results.filter(r=>r==='created').length,3);assert.equal(results.filter(r=>r==='exhausted').length,9);
 const second=await freeOwner();const request=id();
 const retries=await Promise.all(Array.from({length:8},()=>live.reserveFreeGeneration(second,request,instant)));
 assert.equal(retries.filter(r=>r==='created').length,1);assert.equal(retries.filter(r=>r==='reserved').length,7);
 assert.equal(await live.settleFreeGeneration(owner,request,false,instant),'missing');
 assert.equal(await live.settleFreeGeneration(second,request,true,instant),'completed');
 assert.equal(await live.reserveFreeGeneration(second,request,instant),'completed');
});
test('free provider failures restore the slot once; successful requests consume it',async()=>{
 const owner=await freeOwner();const failed=id();
 assert.equal(await live.reserveFreeGeneration(owner,failed,instant),'created');
 assert.equal(await live.settleFreeGeneration(owner,failed,false,instant),'released');
 assert.equal(await live.settleFreeGeneration(owner,failed,false,instant),'released');
 for(let i=0;i<3;i++){const request=id();assert.equal(await live.reserveFreeGeneration(owner,request,instant),'created');await live.settleFreeGeneration(owner,request,true,instant);}
 assert.equal(await live.reserveFreeGeneration(owner,id(),instant),'exhausted');
 const fresh=await freeOwner();
 await assert.rejects(()=>runMeteredGeneration({store:live,owner:fresh,requestId:id(),operation:'standard',free:true,now:()=>instant,generate:async()=>{throw new Error('provider failed');}}),/provider failed/);
 const count=(await db.query('SELECT used FROM billing.free_daily_usage WHERE customer_id=$1',[fresh])).rows[0].used;
 assert.equal(count,0);
});
test('UTC reset, abandoned leases and late settlements never corrupt the current free quota',async()=>{
 const owner=await freeOwner();const old=id();const midnight=Date.UTC(2026,9,11,23,59,30);
 await live.reserveFreeGeneration(owner,old,midnight);
 const fresh=id();await live.reserveFreeGeneration(owner,fresh,midnight+60000);
 await live.settleFreeGeneration(owner,old,false,midnight+60000);
 const counts=(await db.query('SELECT used FROM billing.free_daily_usage WHERE customer_id=$1 ORDER BY day',[owner])).rows;
 assert.deepEqual(counts.map(r=>r.used),[0,1]);
 const staleOwner=await freeOwner();const held=id();await live.reserveFreeGeneration(staleOwner,held,instant);
 assert.equal(await live.reserveFreeGeneration(staleOwner,id(),instant+120001),'created');
 assert.equal(await live.settleFreeGeneration(staleOwner,held,true,instant+120002),'released');
 assert.equal((await db.query('SELECT used FROM billing.free_daily_usage WHERE customer_id=$1',[staleOwner])).rows[0].used,1);
});
test('free completion-storage errors hold usage and cannot repeat the provider; paid-only operations stay blocked',async()=>{
 const owner=await freeOwner();const requestId=id();let calls=0;
 const broken={...live,settleFreeGeneration:async()=>{throw new Error('storage failed');}};
 const input={store:broken,owner,requestId,operation:'standard',free:true,now:()=>instant,generate:async()=>{calls++;return 'Draft';}};
 await assert.rejects(()=>runMeteredGeneration(input),/storage failed/);
 await assert.rejects(()=>runMeteredGeneration(input),e=>e.status===409);assert.equal(calls,1);
 for(const operation of ['premium','research'])await assert.rejects(()=>runMeteredGeneration({...input,operation,requestId:id()}),e=>e.status===402);
 const shared=id();const sandboxOwner=await sandbox.authenticatedOwner('free-sandbox-'+id(),owner);
 assert.equal(await live.reserveFreeGeneration(owner,shared,instant),'created');
 assert.equal(await sandbox.reserveFreeGeneration(sandboxOwner,shared,instant),'created');
});
