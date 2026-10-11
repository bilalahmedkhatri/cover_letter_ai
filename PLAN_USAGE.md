# Plan usage — 12 October 2026

Prices stay unchanged. Standard, premium and research maxima are alternative uses of one shared allowance. Research limits remain unchanged. Pro's stated limits are final; do not multiply them by another 10%.

| Plan | USD / 30-day purchase | Standard-only letters | Premium-only letters | Research-only reports |
| --- | --- | --- | --- | --- |
| Starter | $10 | 30 | 8 | 5 |
| Plus | $20 | 70 | 18 | 10 |
| Pro | $28 | 100 | 28 | 15 |

To avoid fractional rounding, each purchase has its own integer budget and operation weights:

| Plan | Internal budget | Standard cost | Premium cost | Research cost |
| --- | --- | --- | --- | --- |
| Starter | 120 | 4 | 15 | 24 |
| Plus | 630 | 9 | 35 | 63 |
| Pro | 2100 | 21 | 75 | 140 |

These are accounting units, not provider tokens, money or a transferable currency. Unit values differ between plans; the customer sees generation limits, not unit counts. Dividing a plan budget by its operation cost gives the exact advertised maximum. For example, one Starter premium letter uses 15 units, leaving 105 units: up to 26 standard letters, 7 premium letters or 4 research reports.

Every paid order snapshots its budget and consumption weights. Different-plan renewals create separate allocations, retaining their own weights. Requests consume the oldest allocation that can cover the operation; each operation must fit within one allocation. Active purchases extend access as before; expired allocations are closed on the next purchase. Future configuration changes cannot silently rewrite purchased allowances.

`billing.reserve_generation` atomically holds usage before a server AI request; concurrent requests cannot exceed the remaining balance. `billing.settle_generation` records completion or restores failed-request usage exactly once. Late releases cannot revive expired allocations. Duplicate request IDs cannot execute a provider call twice. Interrupted or uncertain requests remain held for reconciliation rather than automatically granting free retries.

`server/ai/metered-generation.mjs` provides server orchestration. **The existing client AI generator is not yet connected to this path.** Authentication, server provider integrations and token/cost accounting remain required before paid launch. No client endpoint is allowed to declare that a paid AI operation succeeded or to grant itself usage. Checkout remains disabled.

Both Prisma migrations were applied to Neon production after verification on a temporary clone. Database tests cover all nine plan/operation maxima, concurrent reservations, mixed use, expiry, provider failure, uncertain settlement and different-plan renewals.

Pricing-page scope: plan cards, writing features, research scope and user-facing FAQs. Payment/access tables, raw credits and backend/provider setup text are removed. Landing content covers concrete use cases, writing tools, preparation and review, localized in all seven supported languages.
