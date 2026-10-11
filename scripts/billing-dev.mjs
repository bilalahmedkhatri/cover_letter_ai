import { createHandlers } from '../server/payments/handlers.mjs';
import { paymentConfig } from '../server/payments/nowpayments.mjs';
import { createStore } from '../server/payments/store.mjs';

export function billingDevPlugin(env) {
  return {
    name: 'billing-api-development',
    configureServer(server) {
      const serverEnv = { ...process.env, ...env, BILLING_SITE_URL: env.BILLING_SITE_URL || 'http://localhost:3000' };
      const handlers = createHandlers({ config: paymentConfig(serverEnv), store: createStore(serverEnv) });
      const routes = {
        '/api/billing/status': { method: 'GET', handle: handlers.status },
        '/api/billing/checkout': { method: 'POST', handle: handlers.checkout },
        '/api/nowpayments/ipn': { method: 'POST', handle: handlers.ipn },
      };
      server.middlewares.use(async (req, res, next) => {
        const route = routes[req.url?.split('?')[0]];
        if (!route) return next();
        if (req.method !== route.method) { res.writeHead(405, { Allow: route.method }); return res.end(); }
        try {
          const chunks = []; let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 32768) { res.writeHead(413); res.end(); return; }
            chunks.push(chunk);
          }
          const request = new Request('http://localhost:3000' + req.url, {
            method: req.method, headers: req.headers,
            ...(chunks.length ? { body: Buffer.concat(chunks) } : {}),
          });
          const response = await route.handle(request);
          res.writeHead(response.status, Object.fromEntries(response.headers));
          res.end(await response.text());
        } catch { res.writeHead(500); res.end('Payment service unavailable.'); }
      });
    },
  };
}
