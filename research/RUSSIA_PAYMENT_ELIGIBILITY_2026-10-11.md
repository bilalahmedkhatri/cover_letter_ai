# Russia buyer / Pakistan individual merchant payment assessment

User reports over 50% Russian users. Merchant: Pakistani individual, not yet registered; plans registration after three months. Russian language/nationality is distinct from Russia residence and a Russia-issued card.

## Confirmed findings

- Paddle blocks Russia purchases: https://www.paddle.com/help/legal/sanctions/which-countries-are-supported-by-paddle
- Lemon Squeezy excludes Russian Federation purchases: https://docs.lemonsqueezy.com/help/getting-started/supported-countries
- Russia-issued Visa cards cannot transact outside Russia through Visa's international network: https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.18871.html
- lava.top advertises no legal entity required, 8% incoming-sales commission and APIs: https://lava.top/en
- lava.top RUB payments accept Russian Visa/Mastercard/MIR and SBP; foreign-currency payments use foreign-issued cards: https://faq.lava.top/article/70658
- Its current Russian author guide requires ID/camera verification, at least three real sales, and security review up to seven business days before payout; foreign Visa payout only in supported countries, minimum $20/EUR20, conversion uses its internal rate: https://faq.lava.top/article/79240
- Older English payout FAQ quotes much faster identity checking and different crypto minimums. Prefer current Russian author guide; do not conflate identity verification with payout clearance.
- YooKassa nonresident onboarding checks registered legal-entity status, and advertises foreign-company settlements to overseas bank accounts. Pakistan bank acceptance, currency and routing are not confirmed: https://yookassa.ru/docs/support/payments/onboarding/docs and https://yookassa.ru/non-russian-residents/

## Unconfirmed; do not implement as a guaranteed solution

lava.top is a candidate, not a validated Pakistan payout solution. Its public list for foreign Visa withdrawals is an image; Pakistan inclusion and this merchant's issuing bank/card eligibility were not verified. SaaS AI letter-generation subscriptions, webhook fulfillment and recurring RUB payment eligibility also need written confirmation. No provider account created, no live payments processed, and no messages sent to support.

Suggested message for user to send to lava.top support:

> I am a Pakistan-resident individual without an incorporated company. I own https://ailettergen.com, an AI letter-writing SaaS with $10/$20/$28 monthly plans. More than half of our users are Russian. Can you explicitly confirm: (1) Pakistani individual onboarding and accepted identity documents; (2) approval for SaaS access subscriptions, not just downloadable content; (3) Russian-issued cards/MIR/SBP acceptance and which methods support automatic renewals; (4) fiat payout to a Pakistan-issued Visa card or Pakistani bank account, including supported banks, currencies and card restrictions; (5) complete sale/payout/FX/refund/dispute charges, holds and first-payout requirements; and (6) checkout/API/webhook support for automated paid access? Please confirm whether registration is required and the expected review timeline before we integrate.

## Engineering direction

Choose providers by customer residence/payment method, not interface language. Keep checkout adapters and a unified credit/subscription ledger so an approved RUB-capable provider can coexist with a global provider. Verify webhooks server-side and make settlement idempotent; never grant credits from the browser success redirect. A prepaid 30-day pack can be offered if explicitly approved and automatic renewals are unavailable; label it as a one-time purchase rather than a renewing subscription. Show unsupported-country restrictions honestly.

Before accepting paid orders from any country, also check the actual AI suppliers' service-territory terms. Payment eligibility alone does not establish AI service eligibility. Do not use false residence, VPNs, borrowed accounts, or crypto as a way around provider restrictions. No Pakistan fiat off-ramp for crypto was established in this assessment.
