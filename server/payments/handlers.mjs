import { createHmac, createHash } from 'node:crypto';
import { billingPlans } from '../../services/billingPlans.mjs';
import { PaymentError, paymentConfig, createProvider, providerId, checkoutUrl, validatePayment, verifySignature } from './nowpayments.mjs';
import { createStore } from './store.mjs';
import { json, failure, body, sameOrigin, session, clientRateKey } from './http.mjs';

const statuses = new Set(['waiting', 'confirming', 'confirmed', 'sending', 'partially_paid', 'finished', 'failed', 'refunded', 'expired']);
const orderPattern = /^[a-f0-9]{64}$/;
const publicOrder = order => ({ id: order.id, plan: order.plan, price: order.price, credits: order.credits,
  status: order.status, invoiceUrl: order.invoiceUrl || null, fulfilledAt: order.fulfilledAt || null });

export function createHandlers({ config = paymentConfig(), store = createStore(), provider = createProvider(config), now = Date.now } = {}) {
  const ready = () => Boolean(config.apiKey && config.ipnKey && store.ready);
  async function reconcile(order, payment) {
    if (!order.invoiceId) throw new PaymentError('Invoice is still being recorded. Retry notification.', 503);
    if (!statuses.has(payment.payment_status)) throw new PaymentError('Unknown payment status.', 409);
    if (validatePayment(payment, order)) {
      const result = await store.settle(order, payment, now());
      if (!['fulfilled', 'duplicate'].includes(result)) throw new PaymentError('Unable to record payment.', 503);
    } else {
      await store.updateStatus(order, payment);
    }
  }
  return {
    async checkout(request) {
      try {
        sameOrigin(request, config);
        if (!ready() || !config.enabled) throw new PaymentError('Checkout is not available yet.', 503);
        const input = await body(request);
        if (!Object.hasOwn(billingPlans, input.plan) || !/^[a-f0-9-]{36}$/.test(input.requestId || '')) throw new PaymentError('Invalid checkout request.');
        const user = session(request, config);
        if (!user) throw new PaymentError('Please refresh the page before opening checkout.', 401);
        await store.limit('checkout:' + clientRateKey(request), 10, 3600);
        const id = createHmac('sha256', config.ipnKey).update(user.owner + ':' + input.requestId).digest('hex');
        const existing = await store.getOrder(id);
        if (existing) {
          if (existing.plan !== input.plan) throw new PaymentError('Checkout request has already been used.', 409);
          if (!existing.invoiceUrl) throw new PaymentError('Checkout is already being created. Please try a new checkout later.', 409);
          return json({ order: publicOrder(existing) }, 200, user.cookie);
        }
        const plan = billingPlans[input.plan];
        const order = { id, owner: user.owner, plan: plan.id, price: plan.price, credits: plan.credits,
          invoiceId: null, invoiceUrl: null, status: 'creating', createdAt: now() };
        // NX prevents parallel retries from creating two invoices for one request.
        if (!await store.createOrder(order)) throw new PaymentError('Checkout is already being created.', 409);
        const locale = ['en', 'es', 'fr', 'ru', 'nl', 'pt', 'ar'].includes(input.locale) ? input.locale : 'en';
        const returnUrl = `${config.origin}/${locale}/dashboard?billingOrder=${id}`;
        const invoice = await provider.request('/invoice', {
          price_amount: plan.price, price_currency: 'usd', order_id: id,
          order_description: `AI Letter Generator ${plan.name} - 30-day prepaid access`,
          ipn_callback_url: config.origin + '/api/nowpayments/ipn',
          success_url: returnUrl, cancel_url: returnUrl + '&billingCancelled=1',
          is_fixed_rate: true, is_fee_paid_by_user: false,
        });
        order.invoiceId = providerId(invoice.id);
        order.invoiceUrl = checkoutUrl(invoice.invoice_url, config.sandbox);
        order.status = 'waiting';
        await store.saveOrder(order);
        return json({ order: publicOrder(order) }, 200, user.cookie);
      } catch (error) { return failure(error); }
    },
    async status(request) {
      try {
        if (!ready()) return json({ ready: false, checkoutEnabled: false, account: null, order: null });
        const user = session(request, config, true);
        const id = new URL(request.url).searchParams.get('order');
        let order = null;
        if (id) {
          if (!orderPattern.test(id)) throw new PaymentError('Invalid order.');
          order = await store.getOrder(id);
          if (!order || order.owner !== user.owner) throw new PaymentError('Order not found in this browser.', 404);
          if (order.paymentId && !order.fulfilledAt && !['failed', 'refunded', 'expired'].includes(order.status)) {
            await store.limit('refresh:' + user.owner, 60, 3600);
            const payment = await provider.request('/payment/' + providerId(order.paymentId));
            if (providerId(payment.payment_id) !== providerId(order.paymentId)) throw new PaymentError('Payment identifier mismatch.', 409);
            await reconcile(order, payment);
            order = await store.getOrder(id);
          }
        }
        const stored = await store.getAccount(user.owner);
        const active = stored && stored.expiresAt > now();
        const account = stored ? { ...stored, credits: active ? stored.credits : 0, active: Boolean(active),
          remaining: active ? stored.remaining : { standardLetters: 0, premiumLetters: 0, universityResearch: 0 } } : null;
        return json({ ready: true, checkoutEnabled: config.enabled, sandbox: config.sandbox, account, order: order ? publicOrder(order) : null }, 200, user.cookie);
      } catch (error) { return failure(error); }
    },
    async ipn(request) {
      try {
        if (!ready()) throw new PaymentError('Payment service is not configured.', 503);
        const event = await body(request);
        if (!verifySignature(event, request.headers.get('x-nowpayments-sig'), config.ipnKey)) throw new PaymentError('Invalid payment signature.', 401);
        if (!orderPattern.test(event.order_id || '')) throw new PaymentError('Invalid order.');
        const order = await store.getOrder(event.order_id);
        if (!order) throw new PaymentError('Order not found.', 404);
        const paymentId = providerId(event.payment_id);
        const eventId = createHash('sha256').update(request.headers.get('x-nowpayments-sig')).digest('hex');
        await store.recordWebhook(event, eventId);
        // Never trust callback amounts/status alone. Re-fetch using our secret API key.
        const payment = await provider.request('/payment/' + paymentId);
        if (providerId(payment.payment_id) !== paymentId) throw new PaymentError('Payment identifier mismatch.', 409);
        await reconcile(order, payment);
        await store.finishWebhook(eventId);
        return json({ received: true });
      } catch (error) { return failure(error); }
    },
  };
}

