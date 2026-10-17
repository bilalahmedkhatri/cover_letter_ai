import { PaymentError } from './nowpayments.mjs';

const orderFromRow = row => row ? ({ id: row.id, owner: row.customer_id, plan: row.plan_id,
  price: row.price_cents / 100, credits: row.credits, invoiceId: row.invoice_id,
  invoiceUrl: row.invoice_url, paymentId: row.payment_id, status: row.status,
  createdAt: new Date(row.created_at).getTime(), fulfilledAt: row.fulfilled_at ? new Date(row.fulfilled_at).getTime() : null }) : null;

export function createStore(env = process.env, injectedQuery) {
  const environment = env.NOWPAYMENTS_SANDBOX === 'true' ? 'sandbox' : 'live';
  const ready = Boolean(env.DATABASE_URL);
  let client;
  async function query(text, params) {
    if (!ready) throw new PaymentError('Payment database is not configured.', 503);
    try {
      if (injectedQuery) return await injectedQuery(text, params);
      if (!client) {
        const { neon } = await import('@neondatabase/serverless');
        client = neon(env.DATABASE_URL);
      }
      return await client.query(text, params, { fetchOptions: { signal: AbortSignal.timeout(12000) } });
    } catch {
      throw new PaymentError('Payment database temporarily unavailable.', 503);
    }
  }
  return {
    ready,
    async authenticatedOwner(userId, proposedId) {
      await query('INSERT INTO billing.customers(environment,id,auth_user_id) VALUES($1,$2,$3) ON CONFLICT(environment,auth_user_id) DO NOTHING', [environment, proposedId, userId]);
      return (await query('SELECT id FROM billing.customers WHERE environment=$1 AND auth_user_id=$2', [environment, userId]))[0].id;
    },
    async getOrder(id) {
      const rows = await query('SELECT * FROM billing.orders WHERE environment=$1 AND id=$2', [environment, id]);
      return orderFromRow(rows[0]);
    },
    async getAccount(id) {
      const rows = await query(`SELECT a.*,
        coalesce((SELECT sum(u.remaining_units/u.standard_cost) FROM billing.usage_allocations u WHERE u.environment=a.environment AND u.customer_id=a.customer_id AND NOT u.closed),0)::int AS standard_remaining,
        coalesce((SELECT sum(u.remaining_units/u.premium_cost) FROM billing.usage_allocations u WHERE u.environment=a.environment AND u.customer_id=a.customer_id AND NOT u.closed),0)::int AS premium_remaining,
        coalesce((SELECT sum(u.remaining_units/u.research_cost) FROM billing.usage_allocations u WHERE u.environment=a.environment AND u.customer_id=a.customer_id AND NOT u.closed),0)::int AS research_remaining
        FROM billing.credit_accounts a WHERE a.environment=$1 AND a.customer_id=$2`, [environment, id]);
      const row = rows[0];
      return row ? { credits: row.credits, expiresAt: new Date(row.expires_at).getTime(), plan: row.plan_id,
        remaining: { standardLetters: row.standard_remaining, premiumLetters: row.premium_remaining, universityResearch: row.research_remaining } } : null;
    },
    async createOrder(order) {
      const rows = await query(`WITH customer AS (
        INSERT INTO billing.customers(environment,id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id
      ) INSERT INTO billing.orders(environment,id,customer_id,plan_id,price_cents,credits,created_at,standard_cost,premium_cost,research_cost)
        SELECT $1,$3,$2,p.id,p.price_cents,p.credits,$5,p.standard_cost,p.premium_cost,p.research_cost
        FROM billing.plans p WHERE p.id=$4 AND p.active
        ON CONFLICT(environment,id) DO NOTHING RETURNING id`,
      [environment, order.owner, order.id, order.plan, new Date(order.createdAt).toISOString()]);
      return rows[0]?.id || null;
    },
    async saveOrder(order) {
      const rows = await query(`UPDATE billing.orders SET invoice_id=$3,invoice_url=$4,status='waiting'
        WHERE environment=$1 AND id=$2 AND fulfilled_at IS NULL RETURNING id`,
      [environment, order.id, order.invoiceId, order.invoiceUrl]);
      if (!rows[0]) throw new PaymentError('Unable to record invoice.', 503);
    },
    async limit(id, max, seconds) {
      const rows = await query(`INSERT INTO billing.rate_limits(environment,id,count,expires_at)
        VALUES($1,$2,1,now()+$3*interval '1 second') ON CONFLICT(environment,id) DO UPDATE SET
        count=CASE WHEN billing.rate_limits.expires_at <= now() THEN 1 ELSE billing.rate_limits.count+1 END,
        expires_at=CASE WHEN billing.rate_limits.expires_at <= now() THEN now()+$3*interval '1 second' ELSE billing.rate_limits.expires_at END
        RETURNING count`, [environment, id, seconds]);
      if (rows[0].count > max) throw new PaymentError('Too many requests. Please try again later.', 429);
    },
    async updateStatus(order, payment) {
      await query(`UPDATE billing.orders SET status=$3,payment_id=$4 WHERE environment=$1 AND id=$2 AND fulfilled_at IS NULL`,
        [environment, order.id, payment.payment_status, String(payment.payment_id)]);
    },
    async settle(order, payment, now = Date.now()) {
      const rows = await query('SELECT billing.fulfill_order($1,$2,$3,$4,$5,$6,$7,$8,$9) AS result',
        [environment, order.id, String(payment.invoice_id), String(payment.payment_id), Math.round(order.price * 100),
          payment.pay_currency || null, String(payment.pay_amount), String(payment.actually_paid), new Date(now).toISOString()]);
      return rows[0]?.result;
    },
    async recordWebhook(event, id) {
      await query(`INSERT INTO billing.webhook_events(environment,id,order_id,payment_id,provider_status)
        VALUES($1,$2,$3,$4,$5) ON CONFLICT(environment,id) DO UPDATE SET attempts=billing.webhook_events.attempts+1`,
        [environment, id, event.order_id, String(event.payment_id), String(event.payment_status)]);
    },
    async finishWebhook(id) {
      await query('UPDATE billing.webhook_events SET processed_at=now() WHERE environment=$1 AND id=$2', [environment, id]);
    },
    async reserveGeneration(owner, id, operation, now = Date.now()) {
      const rows = await query('SELECT billing.reserve_generation($1,$2,$3,$4,$5) AS result',
        [environment, owner, id, operation, new Date(now).toISOString()]);
      return rows[0]?.result;
    },
    async settleGeneration(owner, id, success, now = Date.now()) {
      const rows = await query('SELECT billing.settle_generation($1,$2,$3,$4,$5) AS result',
        [environment, owner, id, success, new Date(now).toISOString()]);
      return rows[0]?.result;
    },
    async reserveFreeGeneration(owner, id, now = Date.now()) {
      return (await query('SELECT billing.reserve_free_generation($1,$2,$3,$4) AS result',
        [environment, owner, id, new Date(now).toISOString()]))[0]?.result;
    },
    async settleFreeGeneration(owner, id, success, now = Date.now()) {
      return (await query('SELECT billing.settle_free_generation($1,$2,$3,$4,$5) AS result',
        [environment, owner, id, success, new Date(now).toISOString()]))[0]?.result;
    },
  };
}
