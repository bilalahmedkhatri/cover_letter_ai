import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';
import { PaymentError } from '../payments/nowpayments.mjs';
import { createStore as billingStore } from '../payments/store.mjs';

export function createAccountStore(env = process.env, injectedQuery) {
  let sql;
  const query = injectedQuery || (async (text, params = []) => {
    if (!env.DATABASE_URL) throw new PaymentError('Account storage is not configured.', 503);
    sql ||= neon(env.DATABASE_URL);
    return sql.query(text, params, { fetchOptions: { signal: AbortSignal.timeout(12000) } });
  });
  const environment = env.NOWPAYMENTS_SANDBOX === 'true' ? 'sandbox' : 'live';
  const billing = billingStore(env, query);
  return {
    async limit(userId) { await billing.limit('account:' + createHash('sha256').update(userId).digest('hex'), 120, 3600); },
    async overview(user) {
      const profile = (await query('SELECT name,skills,experience,language,tone FROM app.profiles WHERE user_id=$1', [user.id]))[0] || { name: user.name, skills: '', experience: '', language: 'English', tone: 'Professional' };
      const documents = await query('SELECT id,kind,title,content,context,created_at AS "createdAt",updated_at AS "updatedAt" FROM app.documents WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 100', [user.id]);
      // A stable server-derived owner prevents a browser from selecting another account.
      const owner = createHash('sha256').update('account:' + user.id).digest('hex');
      await query('INSERT INTO billing.customers(environment,id,auth_user_id) VALUES($1,$2,$3) ON CONFLICT(environment,auth_user_id) DO NOTHING', [environment, owner, user.id]);
      const customer = (await query('SELECT id FROM billing.customers WHERE environment=$1 AND auth_user_id=$2', [environment, user.id]))[0];
      const account = await billing.getAccount(customer.id);
      const orders = await query('SELECT id,plan_id AS plan,price_cents AS "priceCents",status,created_at AS "createdAt" FROM billing.orders WHERE environment=$1 AND customer_id=$2 ORDER BY created_at DESC LIMIT 30', [environment, customer.id]);
      const active = Boolean(account && account.expiresAt > Date.now());
      return { profile, documents, orders, account: account ? { plan: account.plan, credits: active ? account.credits : 0, expiresAt: account.expiresAt, active, remaining: active ? account.remaining : { standardLetters: 0, premiumLetters: 0, universityResearch: 0 } } : null };
    },
    async profile(user, value) {
      await query(`INSERT INTO app.profiles(user_id,name,skills,experience,language,tone) VALUES($1,$2,$3,$4,$5,$6)
        ON CONFLICT(user_id) DO UPDATE SET name=EXCLUDED.name,skills=EXCLUDED.skills,experience=EXCLUDED.experience,language=EXCLUDED.language,tone=EXCLUDED.tone,updated_at=now()`, [user.id, value.name, value.skills, value.experience, value.language, value.tone]);
    },
    async document(user, value) {
      const rows = await query(`INSERT INTO app.documents(id,user_id,kind,title,content,context)
        SELECT $1,$2,$3,$4,$5,$6 WHERE (SELECT count(*) FROM app.documents WHERE user_id=$2) < 100
        OR EXISTS(SELECT 1 FROM app.documents WHERE id=$1 AND user_id=$2)
        ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,content=EXCLUDED.content,context=EXCLUDED.context,updated_at=now()
        WHERE app.documents.user_id=$2 RETURNING id`, [value.id, user.id, value.kind, value.title, value.content, JSON.stringify(value.context)]);
      if (!rows.length) throw new PaymentError('Unable to save this draft. Your library may have reached 100 items.', 409);
    },
    async remove(user, id) {
      const rows = await query('DELETE FROM app.documents WHERE id=$1 AND user_id=$2 RETURNING id', [id, user.id]);
      if (!rows.length) throw new PaymentError('Draft not found.', 404);
    },
    async review(user, value) {
      await query(`INSERT INTO app.reviews(id,user_id,display_name,rating,content,publish_consent) VALUES($1,$2,$3,$4,$5,true)
        ON CONFLICT(user_id) DO UPDATE SET display_name=EXCLUDED.display_name,rating=EXCLUDED.rating,content=EXCLUDED.content,status='pending',publish_consent=true,updated_at=now()`, [value.id, user.id, value.name, value.rating, value.content]);
    },
    async reviews() { return query(`SELECT display_name AS name,rating,content FROM app.reviews WHERE status='published' AND publish_consent=true ORDER BY updated_at DESC LIMIT 6`); },
  };
}
