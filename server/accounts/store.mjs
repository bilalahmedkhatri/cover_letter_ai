import {availableWorkflows,canUseWorkflow} from '../feature-access.mjs';
import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';
import { PaymentError } from '../payments/nowpayments.mjs';
import { createStore as billingStore } from '../payments/store.mjs';
import { readCoverLetterQuality } from '../../services/coverLetterReview.mjs';
import { normalizeConversationTitle } from '../../services/conversationTitle.mjs';

export function createAccountStore(env = process.env, injectedQuery) {
  let sql;
  const query = injectedQuery || (async (text, params = []) => {
    if (!env.DATABASE_URL) throw new PaymentError('Account storage is not configured.', 503);
    sql ||= neon(env.DATABASE_URL);
    return sql.query(text, params, { fetchOptions: { signal: AbortSignal.timeout(12000) } });
  });
  const environment = env.NOWPAYMENTS_SANDBOX === 'true' ? 'sandbox' : 'live';
  const billing = billingStore(env, query);
  const page = (rows, limit) => ({ items: rows.slice(0,limit), cursor: rows.length>limit ? {at:rows[limit-1].updatedAt || rows[limit-1].createdAt,id:rows[limit-1].id} : null });
  return {
    async conversations(user, cursor) {
      return page(await query(`SELECT c.id,c.workflow,c.title,c.updated_at AS "updatedAt",
        CASE WHEN m.status='pending' AND m.created_at<clock_timestamp()-interval '5 minutes' THEN 'interrupted' ELSE m.status END AS status
        FROM app.conversations c LEFT JOIN LATERAL (SELECT status,created_at FROM app.messages WHERE conversation_id=c.id AND role='assistant' ORDER BY created_at DESC,id DESC LIMIT 1) m ON true
        WHERE c.user_id=$1 AND c.workflow=ANY($4::text[]) AND ($2::timestamptz IS NULL OR (c.updated_at,c.id)<($2::timestamptz,$3::uuid))
        ORDER BY c.updated_at DESC,c.id DESC LIMIT 21`,[user.id,cursor?.at || null,cursor?.id || null,availableWorkflows(user,env)]),20);
    },
    async conversation(user, id, cursor) {
      const chat=(await query('SELECT id,workflow,title,updated_at AS "updatedAt" FROM app.conversations WHERE id=$1 AND user_id=$2',[id,user.id]))[0];
      if (!chat || !canUseWorkflow(chat.workflow,user,env)) throw new PaymentError('Conversation not found.',404);
      const result=page(await query(`SELECT m.id,m.request_id AS "requestId",m.role,m.content,m.context,m.sources,m.created_at AS "createdAt",
        CASE WHEN m.status='pending' AND m.created_at<clock_timestamp()-interval '5 minutes' THEN 'interrupted' ELSE m.status END AS status
        FROM app.messages m JOIN app.conversations c ON c.id=m.conversation_id WHERE c.id=$1 AND c.user_id=$2
        AND ($3::timestamptz IS NULL OR (m.created_at,m.id)<($3::timestamptz,$4::uuid)) ORDER BY m.created_at DESC,m.id DESC LIMIT 51`,[id,user.id,cursor?.at || null,cursor?.id || null]),50);
      return {...chat,messages:result.items.reverse(),cursor:result.cursor};
    },
    async renameConversation(user,id,title) {
      if (!(await query("UPDATE app.conversations SET title=$3,title_source='manual',updated_at=clock_timestamp() WHERE id=$1 AND user_id=$2 AND workflow=ANY($4::text[]) RETURNING id",[id,user.id,title,availableWorkflows(user,env)])).length) throw new PaymentError('Conversation not found.',404);
    },
    async removeConversation(user,id) {
      if (!(await query('DELETE FROM app.conversations WHERE id=$1 AND user_id=$2 AND workflow=ANY($3::text[]) RETURNING id',[id,user.id,availableWorkflows(user,env)])).length) throw new PaymentError('Conversation not found.',404);
    },
    async startConversation(user,{chatId,requestId,workflow,input}) {
      if(!canUseWorkflow(workflow,user,env))throw new PaymentError('Feature not found.',404);
      const content=input.description || input.questions;
      try {
        return (await query('SELECT * FROM app.start_guarded_chat_generation($1,$2::uuid,$3::uuid,$4,$5,$6,$7::jsonb)',[user.id,chatId || null,requestId,workflow,content.replace(/\s+/g,' ').slice(0,100),content,JSON.stringify(input)]))[0];
      } catch (error) {
        if (error.code==='P0429' || error.code==='P0428') {
          const limited=new PaymentError(error.code==='P0429' ? 'Too many new requests. Wait one minute before trying again.' : 'Two requests are already running. Wait for one to finish before trying again.',429);
          limited.retryAfter=error.code==='P0429' ? 60 : 5;
          throw limited;
        }
        throw error;
      }
    },
    async finishConversation(user,requestId,success,output) {
      return (await query('SELECT app.finish_guarded_chat_generation($1,$2::uuid,$3,$4,$5::jsonb) AS saved',[user.id,requestId,success,output.text,JSON.stringify((output.sources || []).slice(0,50))]))[0]?.saved === true;
    },
    async saveConversationTitle(user,requestId,value) {
      const title=normalizeConversationTitle(value);
      if(!title)return undefined;
      // Atomic guard protects manual renames and allows only the first successful
      // assistant response to name a new cover-letter conversation.
      const rows=await query(`UPDATE app.conversations c SET title=$3,title_source='ai'
        FROM app.messages m WHERE c.id=m.conversation_id AND c.user_id=$1
        AND c.workflow='cover-letter' AND c.title_source='fallback'
        AND m.request_id=$2::uuid AND m.role='assistant' AND m.status='completed'
        AND NOT EXISTS (SELECT 1 FROM app.messages earlier
          WHERE earlier.conversation_id=c.id AND earlier.role='assistant' AND earlier.status='completed'
          AND (earlier.created_at,earlier.id)<(m.created_at,m.id))
        RETURNING c.title`,[user.id,requestId,title]);
      return rows[0]?.title;
    },
    async saveConversationReview(user,requestId,value) {
      const review=readCoverLetterQuality(value);
      if(!review)return false;
      return (await query(`UPDATE app.messages m SET context=m.context || jsonb_build_object('qualityReview',$3::jsonb)
        FROM app.conversations c WHERE m.conversation_id=c.id AND c.user_id=$1 AND c.workflow='cover-letter'
        AND m.request_id=$2::uuid AND m.role='assistant' AND m.status='completed' RETURNING m.id`,[user.id,requestId,JSON.stringify(review)])).length>0;
    },
    async conversationReview(user,requestId) {
      const row=(await query(`SELECT m.context->'qualityReview' AS review FROM app.messages m
        JOIN app.conversations c ON c.id=m.conversation_id WHERE c.user_id=$1 AND c.workflow='cover-letter'
        AND m.request_id=$2::uuid AND m.role='assistant' AND m.status='completed'`,[user.id,requestId]))[0];
      return readCoverLetterQuality(row?.review);
    },
    async limit(userId) { await billing.limit('account:' + createHash('sha256').update(userId).digest('hex'), 120, 3600); },
    async overview(user) {
      const profile = (await query('SELECT name,skills,experience,language,tone FROM app.profiles WHERE user_id=$1', [user.id]))[0] || { name: user.name, skills: '', experience: '', language: 'English', tone: 'Professional' };
      // A stable server-derived owner prevents a browser from selecting another account.
      const owner = createHash('sha256').update('account:' + user.id).digest('hex');
      await query('INSERT INTO billing.customers(environment,id,auth_user_id) VALUES($1,$2,$3) ON CONFLICT(environment,auth_user_id) DO NOTHING', [environment, owner, user.id]);
      const customer = (await query('SELECT id FROM billing.customers WHERE environment=$1 AND auth_user_id=$2', [environment, user.id]))[0];
      const account = await billing.getAccount(customer.id);
      const orders = await query('SELECT id,plan_id AS plan,price_cents AS "priceCents",status,created_at AS "createdAt" FROM billing.orders WHERE environment=$1 AND customer_id=$2 ORDER BY created_at DESC LIMIT 30', [environment, customer.id]);
      const active = Boolean(account && account.expiresAt > Date.now());
      return { profile, orders, account: account ? { plan: account.plan, credits: active ? account.credits : 0, expiresAt: account.expiresAt, active, remaining: active ? account.remaining : { standardLetters: 0, premiumLetters: 0, universityResearch: 0 } } : null };
    },
    async profile(user, value) {
      await query(`INSERT INTO app.profiles(user_id,name,skills,experience,language,tone) VALUES($1,$2,$3,$4,$5,$6)
        ON CONFLICT(user_id) DO UPDATE SET name=EXCLUDED.name,skills=EXCLUDED.skills,experience=EXCLUDED.experience,language=EXCLUDED.language,tone=EXCLUDED.tone,updated_at=now()`, [user.id, value.name, value.skills, value.experience, value.language, value.tone]);
    },
    async reviews() { return query(`SELECT display_name AS name,rating,content FROM app.reviews WHERE status='published' AND publish_consent=true ORDER BY updated_at DESC LIMIT 6`); },
  };
}
