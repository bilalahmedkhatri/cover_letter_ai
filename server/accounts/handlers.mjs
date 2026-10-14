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
    async account(request) {
      try {
        const user = await identity(request);
        if (request.method === 'GET') return json(await store.overview(user));
        const origin = env.BILLING_SITE_URL || 'https://ailettergen.com';
        if (request.headers.get('origin') !== new URL(origin).origin) throw new PaymentError('Invalid request origin.', 403);
        await store.limit(user.id);
        const input = await body(request, 131072);
        if (input.action === 'profile') {
          if (!['English','Russian','Spanish','French','Arabic','Dutch','Portuguese','Bulgarian','Hungarian','Slovak','Polish'].includes(input.language) || !['Professional','Formal','Enthusiastic','Concise'].includes(input.tone)) throw new PaymentError('Invalid writing preferences.', 400);
          await store.profile(user, { name: text(input.name, 120), skills: text(input.skills, 4000), experience: text(input.experience, 6000), language: text(input.language, 40, 1), tone: text(input.tone, 30, 1) });
        } else if (input.action === 'document') {
          if (!uuid.test(input.id || '') || !['letter','email','research'].includes(input.kind)) throw new PaymentError('Invalid draft.', 400);
          const context = input.context || {};
          if (typeof context !== 'object' || Array.isArray(context) || JSON.stringify(context).length > 20000) throw new PaymentError('Invalid draft context.', 400);
          // Uploads and screenshots stay on the device; the cloud stores writing settings only.
          delete context.resume; delete context.resumeFile; delete context.screenshot;
          const allowed = ['name','skills','experience','language','customInstruction','letterType','documentType','headerInfo','footerInfo','universityUrl','courseName','universityAnalysisInstruction','tone','targetRecipient','outputLength','opportunityDescription','opportunityUrl'];
          for (const key of Object.keys(context)) if (!allowed.includes(key) || typeof context[key] !== 'string') delete context[key];
          if (context.letterType && !['job','university'].includes(context.letterType)) delete context.letterType;
          if (context.documentType && !['letter','email'].includes(context.documentType)) delete context.documentType;
          if (context.tone && !['Professional','Formal','Enthusiastic','Concise'].includes(context.tone)) delete context.tone;
          await store.document(user, { id: input.id, kind: input.kind, title: text(input.title, 160, 1), content: text(input.content, 20000), context });
        } else if (input.action === 'delete') {
          if (!uuid.test(input.id || '')) throw new PaymentError('Invalid draft.', 400);
          await store.remove(user, input.id);
        } else if (input.action === 'review') {
          if (!uuid.test(input.id || '') || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5 || input.consent !== true) throw new PaymentError('Please give publication consent and a rating.', 400);
          await store.review(user, { id: input.id, name: text(input.name, 80, 1), content: text(input.content, 1500, 20), rating: input.rating });
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
