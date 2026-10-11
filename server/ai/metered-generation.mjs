import { PaymentError } from '../payments/nowpayments.mjs';

// Server-only orchestration. Do not expose reserve/settle operations to clients.
// The provider callback must run on the server after authenticating the owner.
export async function runMeteredGeneration({ store, owner, requestId, operation, generate, now = Date.now }) {
  if (!/^[a-f0-9]{64}$/.test(owner || '') || !/^[a-f0-9]{64}$/.test(requestId || '') ||
      !['standard', 'premium', 'research'].includes(operation)) throw new PaymentError('Invalid generation request.');
  const reservation = await store.reserveGeneration(owner, requestId, operation, now());
  if (reservation !== 'created') {
    if (reservation === 'exhausted' || reservation === 'expired') throw new PaymentError('Your plan allowance is unavailable.', 402);
    throw new PaymentError('Generation request already exists or cannot be reserved.', 409);
  }
  let output;
  try {
    output = await generate();
    if (output == null || output === '') throw new Error('No generation result.');
  } catch (error) {
    await store.settleGeneration(owner, requestId, false, now());
    throw error;
  }
  // A completion-storage failure must not release usage after a successful AI
  // call. Keep it held for reconciliation; retrying the same request cannot run AI.
  const result = await store.settleGeneration(owner, requestId, true, now());
  if (result !== 'completed') throw new PaymentError('Generation requires reconciliation.', 503);
  return output;
}
