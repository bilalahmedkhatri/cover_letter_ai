import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { PaymentError } from './nowpayments.mjs';

export function json(value, status = 200, cookie) {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (cookie) headers['Set-Cookie'] = cookie;
  return new Response(JSON.stringify(value), { status, headers });
}
export function failure(error) {
  // Do not log keys, provider bodies, customer payloads or wallet addresses.
  console.error('Billing request failed', { status: error instanceof PaymentError ? error.status : 500 });
  return json({ error: error instanceof PaymentError ? error.message : 'Payment service temporarily unavailable.' }, error instanceof PaymentError ? error.status : 500);
}
export async function body(request) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new PaymentError('JSON required.', 415);
  if (Number(request.headers.get('content-length')) > 32768) throw new PaymentError('Request too large.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new PaymentError('Missing request body.');
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 32768) { await reader.cancel(); throw new PaymentError('Request too large.', 413); }
    chunks.push(Buffer.from(value));
  }
  let parsed;
  try { parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new PaymentError('Invalid JSON.'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new PaymentError('Invalid request body.');
  return parsed;
}
export function sameOrigin(request, config) {
  if (request.headers.get('origin') !== config.origin) throw new PaymentError('Invalid request origin.', 403);
}

export function session(request, config, create = false) {
  if (!config.ipnKey) throw new PaymentError('Payment service is not configured.', 503);
  const mac = id => createHmac('sha256', config.ipnKey).update('billing-session:' + id).digest('hex');
  const existing = request.headers.get('cookie')?.match(/(?:^|;\s*)billing_session=([a-f0-9]{64})\.([a-f0-9]{64})(?:;|$)/);
  if (existing && timingSafeEqual(Buffer.from(mac(existing[1]), 'hex'), Buffer.from(existing[2], 'hex'))) {
    return { owner: existing[1], cookie: null };
  }
  if (!create) return null;
  const owner = randomBytes(32).toString('hex');
  const secure = config.origin.startsWith('https:') ? '; Secure' : '';
  return { owner, cookie: `billing_session=${owner}.${mac(owner)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}` };
}
export function clientRateKey(request) {
  return createHash('sha256').update(request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'local').digest('hex');
}
