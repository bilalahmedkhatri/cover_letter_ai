import { PaymentError } from '../payments/nowpayments.mjs';
import { json, body } from '../payments/http.mjs';
import { createIdentity } from './auth.mjs';
import { createAccountStore } from './store.mjs';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const text = (value, max, min = 0) => {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max) throw new PaymentError('Please check the length of your input.', 400);
  return value.trim();
};
export function createAccountHandlers({ env = process.env, identity = createIdentity(env), store = createAccountStore(env) } = {}) {
  return {
    async history(request) {
      try {
        const user=await identity(request);
        if (!user) throw new PaymentError('Please sign in.',401);
        if (request.method==='GET') {
          const params=new URL(request.url).searchParams;
          const id=params.get('id');
          if (id && !uuid.test(id)) throw new PaymentError('Invalid conversation.',400);
          const at=params.get('before'); const beforeId=params.get('beforeId');
          if ((at || beforeId) && (!at || !Number.isFinite(Date.parse(at)) || !uuid.test(beforeId || ''))) throw new PaymentError('Invalid history cursor.',400);
          const cursor=at ? {at:new Date(at).toISOString(),id:beforeId} : undefined;
          return json(id ? await store.conversation(user,id,cursor) : await store.conversations(user,cursor));
        }
        const origin=env.NODE_ENV==='development' ? new URL(request.url).origin : new URL(env.BILLING_SITE_URL || 'https://ailettergen.com').origin;
        if (request.headers.get('origin')!==origin) throw new PaymentError('Invalid request origin.',403);
        const input=await body(request,2048);
        if (!uuid.test(input.id || '')) throw new PaymentError('Invalid conversation.',400);
        if (input.action==='rename') await store.renameConversation(user,input.id,text(input.title,160,1));
        else if (input.action==='delete') await store.removeConversation(user,input.id);
        else throw new PaymentError('Unknown history action.',400);
        return json({saved:true});
      } catch (error) { return json({error:error instanceof PaymentError ? error.message : 'Chat history is temporarily unavailable.'},error instanceof PaymentError ? error.status : 503); }
    },
    async account(request) {
      try {
        const user = await identity(request);
        if (!user) throw new PaymentError('Please sign in.',401);
        if (request.method === 'GET') return json(await store.overview(user));
        const origin = env.BILLING_SITE_URL || 'https://ailettergen.com';
        if (request.headers.get('origin') !== new URL(origin).origin) throw new PaymentError('Invalid request origin.', 403);
        await store.limit(user.id);
        const input = await body(request, 131072);
        if (input.action === 'profile') {
          if (!['English','Russian','Spanish','French','Arabic','Dutch','Portuguese','Bulgarian','Hungarian','Slovak','Polish'].includes(input.language) || !['Professional','Formal','Enthusiastic','Concise'].includes(input.tone)) throw new PaymentError('Invalid writing preferences.', 400);
          await store.profile(user, { name: text(input.name, 120), skills: text(input.skills, 4000), experience: text(input.experience, 6000), language: text(input.language, 40, 1), tone: text(input.tone, 30, 1) });
        } else throw new PaymentError('Unknown account action.', 400);
        return json({ saved: true });
      } catch (error) {
        return json({ error: error instanceof PaymentError ? error.message : 'Account service temporarily unavailable.' }, error instanceof PaymentError ? error.status : 503);
      }
    },
    async reviews() {
      try { return json({ reviews: await store.reviews() }); }
      catch { return json({ reviews: [] }); }
    },
  };
}
