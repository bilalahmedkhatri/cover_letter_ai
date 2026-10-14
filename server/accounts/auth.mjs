import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PaymentError } from '../payments/nowpayments.mjs';

const verifiers = new Map();
export function createIdentity(env = process.env) {
  return async request => {
    const token = request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/)?.[1];
    if (!token) throw new PaymentError('Sign in to continue.', 401);
    const base = env.NEON_AUTH_BASE_URL;
    const url = env.NEON_AUTH_JWKS_URL;
    if (!base || !url) throw new PaymentError('Account service is not configured.', 503);
    try {
      if (!verifiers.has(url)) verifiers.set(url, createRemoteJWKSet(new URL(url), { timeoutDuration: 8000 }));
      const { payload } = await jwtVerify(token, verifiers.get(url), { issuer: env.NEON_AUTH_ISSUER || base, audience: env.NEON_AUTH_AUDIENCE || base, algorithms: ['EdDSA'], clockTolerance: 5 });
      if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length > 128) throw new Error('Invalid subject');
      return { id: payload.sub, name: typeof payload.name === 'string' ? payload.name : '' };
    } catch { throw new PaymentError('Your session has expired. Sign in again.', 401); }
  };
}
