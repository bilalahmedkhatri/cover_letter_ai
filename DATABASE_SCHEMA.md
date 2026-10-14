# Database schema

The Neon PostgreSQL database has eleven billing tables and three account tables in the `app` schema. Prisma also maintains `public._prisma_migrations`; Neon manages its own authentication schema. Temporary account test records were removed after browser verification. No test payments were made.

| Table | Purpose |
| --- | --- |
| `plans` | Prices $10/$20/$28, exact generation limits and internal consumption weights; see PLAN_USAGE.md. |
| `customers` | Browser billing identities; nullable future authentication user mapping. |
| `orders` | Server-priced checkout, invoice identifiers, customer ownership and fulfilment. |
| `payments` | Verified settled provider payments and exact decimal crypto amounts. |
| `subscriptions` | Purchased 30-day access periods; manual renewal, no automatic debit. |
| `credit_accounts` | Current credit balance and expiry for each billing identity. |
| `credit_ledger` | Append-only purchase and expiry history; supports future usage/refund entries. |
| `webhook_events` | Signed notification audit, retry count and processing timestamp. |
| `rate_limits` | Persistent checkout/status request counters. |
| `usage_allocations` | Per-purchase remaining units and frozen consumption weights. |
| `generation_reservations` | Idempotent reserved/completed/released generation requests. |

Live and sandbox data are separated by environment keys. `billing.fulfill_order` locks the order and account, then records payment, credits, access period and ledger together. Concurrent retries grant one allocation. Active purchases stack credits and time; expired credits are discarded on the next purchase. Stored subscription status does not automatically become expired: access must check timestamps.

Schema source: `prisma/schema.prisma`. Migration source: `prisma/migrations/202610110001_billing/migration.sql`. Database access stays on the server. Prisma handles migrations; the runtime uses the official Neon HTTP driver.

Account migration: `prisma/migrations/202610120002_accounts/migration.sql`. `app.profiles` stores writing preferences, `app.documents` stores selected letter/email drafts and research notes, and `app.reviews` stores consent and moderation state. Queries enforce the signed-in user ID for reads, edits and deletes. File bodies and screenshots are not saved there. See ACCOUNT_SETUP.md.

## Tables needed next

Create these alongside their actual features, rather than adding unused tables now:

| Priority | Tables / managed service | Why |
| --- | --- | --- |
| Implemented | Neon Auth + `app.profiles`, `app.documents`, `app.reviews` | Managed login, owner-scoped drafts/research, preferences and moderated consented reviews. Billing customers map to authentication identities. See ACCOUNT_SETUP.md for deployment configuration. |
| Before paid launch | `ai_requests` | Model/provider, request status, input/output/cached tokens, currency and measured cost; idempotency per request. |
| Before paid launch | Connect existing `generation_reservations` to authenticated server AI calls | The reservation/settlement functions exist; the browser generator does not yet use them. |
| Future feature | `letter_versions` | Optional revision history for the existing saved documents. |
| Product feature | `documents` | Upload metadata, retention and ownership; keep resume/file bodies in private object storage. |
| Future research automation | `research_reports`, `research_sources` | Structured report/source retrieval history and measured AI cost beyond the existing saved notes. |
| Payment operations | `refunds`, `audit_events` | Refund reconciliation, credit/access adjustments and operator action history. |

Authentication and server-side AI metering are the immediate next stage. Model labels and proposed credit weights are not evidence of actual model availability or cost. Keep checkout disabled until these features are delivering the paid service.

## Verification

The initial migration was applied to the supplied Neon database and all eleven application tables were verified. Automated tests exercise the actual SQL through PGlite, plus mocked NOWPayments callbacks. Real crypto settlement and production webhooks still need sandbox/deployment acceptance testing.

```text
npm run db:validate
npm run db:migrate
npm run test:payments
node --env-file=.env.local scripts/database-inspect.mjs
```

The 202610120001_generation_allowances migration was tested on an expiring production clone, applied to production, and verified. The temporary test branch was removed. Existing order weights are preserved; conflicting legacy usage requires reviewed backfill rather than guessed conversion.
