import { createHmac, timingSafeEqual } from 'node:crypto';

export class PaymentError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function paymentConfig(env = process.env) {
  const sandbox = env.NOWPAYMENTS_SANDBOX === 'true';
  const origin = new URL(env.BILLING_SITE_URL || 'https://ailettergen.com');
  if (origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password ||
    (origin.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(origin.hostname))) {
    throw new PaymentError('Invalid billing site URL.', 503);
  }
  return {
    apiKey: env.NOWPAYMENT_API_KEY || env.NOWPAYMENTS_API_KEY,
    ipnKey: env.NOWPAYMENT_IPN_KEY || env.NOWPAYMENTS_IPN_SECRET,
    origin: origin.origin, sandbox,
    apiUrl: sandbox ? 'https://api-sandbox.nowpayments.io/v1' : 'https://api.nowpayments.io/v1',
    enabled: env.BILLING_ENABLE_CHECKOUT === 'true',
  };
}

// NOWPayments signs a recursively key-sorted JSON object, not the raw body bytes.
export function sortedPayload(value) {
  if (Array.isArray(value)) return value.map(sortedPayload);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortedPayload(value[key])]));
  }
  return value;
}

export function verifySignature(payload, signature, secret) {
  if (!secret || !/^[a-f0-9]{128}$/i.test(signature || '')) return false;
  const expected = createHmac('sha512', secret).update(JSON.stringify(sortedPayload(payload))).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}

export function providerId(value) {
  if (typeof value === 'number' && !Number.isSafeInteger(value)) throw new PaymentError('Invalid payment identifier.');
  const id = String(value ?? '');
  if (!/^[1-9]\d{0,30}$/.test(id)) throw new PaymentError('Invalid payment identifier.');
  return id;
}

export function checkoutUrl(value, sandbox) {
  const url = new URL(value);
  const host = sandbox ? 'sandbox.nowpayments.io' : 'nowpayments.io';
  if (url.protocol !== 'https:' || url.hostname !== host || url.username || url.password || url.port) {
    throw new PaymentError('Invalid checkout response.', 502);
  }
  return url.href;
}

export function validatePayment(payment, order) {
  if (String(payment.order_id) !== order.id || providerId(payment.invoice_id) !== order.invoiceId ||
      String(payment.price_currency).toLowerCase() !== 'usd' ||
      !Number.isFinite(Number(payment.price_amount)) || Number(payment.price_amount) !== order.price) {
    throw new PaymentError('Payment does not match the order.', 409);
  }
  providerId(payment.payment_id);
  if (payment.payment_status !== 'finished') return false;
  // A finished status alone must not grant a partially paid fixed-price plan.
  const quoted = decimal(payment.pay_amount);
  const paid = decimal(payment.actually_paid);
  const scale = Math.max(quoted.scale, paid.scale);
  if (quoted.units <= 0n || paid.units * 10n ** BigInt(scale - paid.scale) < quoted.units * 10n ** BigInt(scale - quoted.scale)) {
    throw new PaymentError('Payment is not fully paid.', 409);
  }
  return true;
}

function decimal(value) {
  const text = String(value ?? '');
  if (!/^\d{1,30}(\.\d{1,30})?$/.test(text)) throw new PaymentError('Invalid payment amount.', 409);
  const [whole, fraction = ''] = text.split('.');
  return { units: BigInt(whole + fraction), scale: fraction.length };
}

export function createProvider(config, fetcher = fetch) {
  return {
    async request(path, body) {
      if (!config.apiKey) throw new PaymentError('Payment service is not configured.', 503);
      const response = await fetcher(config.apiUrl + path, {
        method: body ? 'POST' : 'GET',
        headers: { 'x-api-key': config.apiKey, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new PaymentError('Payment provider could not complete the request. Please try again.', 502);
      return response.json();
    },
  };
}

