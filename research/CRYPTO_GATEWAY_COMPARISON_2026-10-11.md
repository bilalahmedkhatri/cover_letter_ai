# Screenshot gateway comparison — 2026-10-11

Scope: Pakistani individual without incorporation, Russian-resident customers, $10/$20/$28 plans. This is research, not provider approval or a deployed integration.

## Decision

Plisio is the first hosted candidate from the screenshot, conditional on written confirmation of Pakistani individual merchant eligibility and payments from Russian residents. Its public terms do not name either country; that absence does not establish acceptance. No guaranteed instant verification or Pakistani bank payout was found. BTCPay Server is the self-hosted alternative with no central merchant approval, but hosting, maintenance, network fees and a separate lawful fiat off-ramp remain necessary.

## Verified findings

- Coinbase Commerce portal closed March 31, 2026. Replacement Coinbase Business currently requires a US/Singapore legal entity: https://help.coinbase.com/en/transitioning-from-coinbase-commerce-to-coinbase-business
- Stripe current developer docs list US availability plus private preview in selected additional regions; Pakistan is absent. An older support article says US-only, so use the newer developer country list: https://docs.stripe.com/payments/stablecoin-payments
- BitPay lists Pakistan as restricted/unsupported: https://support.bitpay.com/hc/en-us/articles/360000123366-What-countries-or-jurisdictions-does-BitPay-support
- NOWPayments current terms section 15.1 exclude persons located in/resident of Russia; pricing page shows 1%, not screenshot 0.5%: https://nowpayments.io/doc/fd-tos.pdf?v=1.4.2 and https://nowpayments.io/pricing
- CoinGate prohibits payments from/to Russia: https://support.coingate.com/hc/en-us/articles/23236010880412-Countries-and-territories-not-supported-for-payments
- Triple-A merchant warranty requires incorporation and KYC/KYB documentation: https://www.triple-a.io/terms
- OpenNode currently limits USD conversion to US businesses with a USD bank account. Pakistani/Russian eligibility remains unconfirmed; BTC-only focus makes it a weaker fit for stablecoin checkout: https://help.opennode.com/en/articles/3703687-automatic-conversion-to-usd
- B2BINPAY terms require KYC and may require a quoted onboarding fee; not a demonstrated instant/low-requirement option: https://b2binpay.com/fr/legal-document/terms-of-use
- BTCPay is non-custodial, self-hosted and has no software transaction fee. Bitcoin is the core project; USDt on Tron is available via a community plugin, not an equivalent built-in multi-coin guarantee. https://docs.btcpayserver.org/FAQ/General/ and https://docs.btcpayserver.org/FAQ/Altcoin/
- Plisio advertises API 0.5% and white label 1.5%, but its detailed current fee FAQ overrides the headline for particular networks: USDT BSC 1%; USDT Tron minimum $1.50; USDT Ethereum/Solana minimum $0.50. Its older 2023 blog states different minimums; use the current FAQ and confirm actual invoice quotes. https://plisio.net/pricing and https://plisio.net/faq/fee-information
- Plisio risk-triggered AML/KYC can hold transactions and require SumSub verification: https://plisio.net/docs/aml.pdf . Terms: https://plisio.net/docs/plisio-terms-of-use.pdf

## Plan economics: Plisio API, before network/withdrawal/exchange costs

| Plan | Price | USDT BSC 1% | USDT Tron $1.50 floor | USDT Ethereum/Solana $0.50 floor |
|---|---:|---:|---:|---:|
| Starter | $10 | $0.10 | $1.50 | $0.50 |
| Plus | $20 | $0.20 | $1.50 | $0.50 |
| Pro | $28 | $0.28 | $1.50 | $0.50 |

BSC is a lower published processing-fee candidate at these prices, not proof of lowest total cost or customer adoption. Confirm supported network in invoice API, actual payer wallet availability and withdrawal quote before launch. Crypto access should initially be prepaid 30-day access with manual renewal, unless a genuine recurring mechanism is separately verified.

## Required outstanding confirmations

1. Pakistani unregistered individual can operate an AI writing SaaS merchant account.
2. Russian-resident customers can pay using their own lawful wallets.
3. Required KYC documents, review timing, transaction holds, invoice minimums and all withdrawal fees.
4. An eligible, lawful crypto-to-PKR provider and actual local bank settlement. Crypto wallet withdrawal alone does not satisfy this requirement.

No support message sent, account created, payment executed, or production code changed.
