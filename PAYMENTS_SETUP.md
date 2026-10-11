# NOWPayments integration

Implemented locally; not deployed or live-payment tested. Pakistan merchant onboarding and bank payouts are deferred at the user's request. NOWPayments account creation does not establish Russian-resident checkout eligibility; no country restriction bypass is implemented.

## Endpoints

- `POST /api/billing/checkout`: server-priced hosted invoice.
- `GET /api/billing/status?order=...`: browser-owned order and credit allocation.
- `POST /api/nowpayments/ipn`: signed notifications, authoritative provider re-fetch, atomic fulfilment.

Set the dashboard webhook URL to **https://ailettergen.com/api/nowpayments/ipn**, replacing the homepage URL. Use the non-www host so POST notifications avoid redirects. Keep notification retries enabled. Classic webhook format is supported, as are string payment identifiers within the validated range.

## Server environment

The existing `.env.local` names are supported: `NOWPAYMENT_API_KEY`, `NOWPAYMENT_IPN_KEY`. The public key is not needed for hosted invoices. Never use `VITE_` for any payment/storage secret. `.env.local` is not uploaded by Git: add the same secrets to the deployment's environment separately.

Use the supplied Neon PostgreSQL database. Its eleven billing tables have been created with the versioned Prisma migration. Configure:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@YOUR_POOLED_HOST/neondb?sslmode=require
# Direct connection for migrations only:
DATABASE_URL_UNPOOLED=postgresql://USER:PASSWORD@YOUR_DIRECT_HOST/neondb?sslmode=require
BILLING_SITE_URL=https://ailettergen.com
BILLING_ENABLE_CHECKOUT=false
NOWPAYMENTS_SANDBOX=false
```

No customer payment is accepted unless durable storage, both payment secrets and the explicit launch switch are configured. Storage contains browser ownership IDs, orders, provider IDs and a credit ledger; no resumes or private wallet keys. Persistent order/payment keys prevent replay across function restarts. Set database budget alerts and backups; deleting payment or ledger records can invalidate idempotency guarantees. See DATABASE_SCHEMA.md for the tables and future schema.

## Purchase behaviour

Starter $10: up to 30 standard letters / 8 premium letters / 5 research reports; Plus $20: 70 / 18 / 10; Pro $28: 100 / 28 / 15. These are alternatives from one shared allowance, not additive quotas. Internal credits and per-operation costs are plan-specific (see PLAN_USAGE.md); do not display or compare internal unit counts to customers. The stated Pro limits are final, without another bonus multiplier. Each separate, verified purchase grants its credit allocation and extends access by 30 days. Active prepaid purchases stack credits and time; expired allocations are discarded when another purchase activates. This prepaid stacking differs from an automatically renewed monthly subscription with anniversary quota resets.

There is no automatic card/wallet debit. The browser must open a new invoice to renew. A success redirect, payment screenshot, `confirmed` notification or partial payment never activates access. The signature is HMAC-SHA512 over recursively sorted JSON; all prices, invoice/order IDs and complete payment amounts must match our own stored order and provider API status. Only `finished` settles. The PostgreSQL billing.fulfill_order function uses order/account row locks and unique constraints to record fulfilment, credit allocation, subscription period and payment receipt in one atomic transaction. Additional payments to an already fulfilled invoice do not grant another allocation; investigate/refund them manually.

Orders belong to an HttpOnly, SameSite=Lax browser cookie, not a full user account. Payment success returns to the same hostname/browser. Clearing cookies or switching devices loses access; restore only after independently verifying ownership. Account signup, verified email recovery and cross-device access remain to be built. Rotate IPN secrets with care: they also sign browser billing sessions, so rotation requires a recovery/migration plan.

Refund notifications and terminal failures require manual support review. Automatic refund handling and entitlement reversal are not implemented. The database now reserves and settles operation allowances atomically. server/ai/metered-generation.mjs runs a server provider callback once per reservation and restores usage on provider failure. It is not yet connected to the existing client-side generator; token/cost logging, authentication and paid provider routing remain to be implemented.

## Launch gate

**Keep `BILLING_ENABLE_CHECKOUT=false` until paid AI service delivery is ready.** The current app still calls its existing client AI service and has no authenticated server-side AI usage enforcement. Enabling payments would collect money and record entitlements but would not deliver the proposed Luna/Opus quota system. Do not sell those model/usage promises until their actual backend exists.

Next work: authenticated account ownership; connect server-side AI routing to the implemented reservations and add token/cost accounting; refund/recovery flow; Russian-resident provider confirmation where applicable. Then test in sandbox, deploy API and UI, verify the public webhook, and enable checkout. This is a service-delivery gate, not a Pakistan payout requirement.

## Local and deployment testing

`npm run dev` now serves these API endpoints as well as the Vite UI. For local checkout use `BILLING_SITE_URL=http://localhost:3000`. `.env.local` changes require a dev-server restart. Sandbox needs separate sandbox API/IPN keys and `NOWPAYMENTS_SANDBOX=true`; live and sandbox records use separate environment keys. To receive actual provider callbacks locally, use an HTTPS tunnel and set its exact origin as `BILLING_SITE_URL`, then open the app using that origin. Never send live funds for a mock test.

```text
npm run test:payments
npx tsc --noEmit
npm run build
npm run test:seo
npm run test:prerender
```

Tests cover mock provider responses and the actual migration/function using the PGlite PostgreSQL engine, including duplicate callbacks, concurrent orders, expiry and underpayments. These do not prove live merchant approval or actual blockchain settlement. Production acceptance must cover finished/partial/expired payments, duplicate callbacks, webhook downtime/retry, confirmation delays, rounding and minimums on selected networks, provider timeout during invoice creation, and ownership recovery.

If an invoice creation request times out after provider acceptance, the local order can remain `creating`. Do not automatically create another invoice under that request. Inspect the order in provider dashboard and reconcile it manually before asking the payer to retry.

## Primary documentation

- https://documenter.getpostman.com/view/7907941/2s93JusNJt
- https://nowpayments.zendesk.com/hc/en-us/articles/21395546303389-IPN-and-how-to-setup
- https://nowpayments.io/blog/how-to-use-your-nowpayments-payment-api-to-the-full-extent
- https://neon.com/docs/serverless/serverless-driver
- https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference
- https://vercel.com/docs/functions/runtimes/node-js

## Database and Neon CLI setup

Prisma 7.2 is pinned to the stable migration API; neon.ts contains the requested defineConfig({}). The runtime uses the Neon HTTP driver; Prisma manages schema migrations, not payment request connections. Never run a reset against production.

```text
npm run db:validate
npm run db:migrate
node --env-file=.env.local scripts/database-inspect.mjs
```

The initial migration is applied to the supplied database. Neon skills and project-scoped OAuth MCP configuration are installed. Browser sign-in completed successfully. The workspace is linked to project silent-math-16818154, branch production. neon deploy completed with no configuration changes needed; the branch already matches neon.ts. neon deploy configures Neon services; it does not deploy this Vite/Vercel frontend.
