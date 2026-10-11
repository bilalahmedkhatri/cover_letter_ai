# Crypto checkout recommendation

Checked 11 October 2026. Merchant: Pakistan individual without incorporation; intended customers include Russia residents. Planning only: no account creation, production checkout, support messages, or transfers.

## Provider shortlist

- Cryptomus is the first candidate to seek written eligibility confirmation from. The official fee page states 2% for new users; rates as low as 0.4% require contacting sales and depend on turnover/integration/business type. KYC, domain verification and project moderation are required. Budget $0.20 / $0.40 / $0.56 service fees on $10 / $20 / $28 before network, conversion and cash-out fees. API supports invoices, payment status, webhooks and refunds. Neither Russia nor Pakistan is named in the reviewed general terms, but absence from a list is NOT approval. Pakistani unincorporated SaaS merchant onboarding, Russian payer eligibility and local bank cash-out remain unconfirmed. Sources: https://cryptomus.com/tos ; https://cryptomus.com/fees/payment ; https://cryptomus.com/faq/how-to-add-a-project ; https://doc.cryptomus.com/
- NOWPayments is unsuitable to assume Russia eligibility: current linked terms updated 31 August 2026, section 15.1, restrict persons located in/resident of Russia. Older indexed terms have a different country list and must not be relied on. Current public pricing states 1% service fee, plus applicable network/conversion/off-ramp charges. Sources: https://nowpayments.io/doc/fd-tos.pdf?v=1.4.2 ; https://nowpayments.io/pricing
- CoinPayments explicitly excludes Russian Federation and is not selected: https://coinpayments.net/legal

## Proposed product flow after eligibility clearance

Offer crypto as a customer-selected alternative where supported. Russia IP may prioritize the option but must not override billing-country eligibility or identify nationality. Russian-language use does not establish residence. Do not describe crypto as a way to bypass sanctions/provider restrictions.

Initial crypto purchase: one prepaid 30-day access period with existing Starter $10 / Plus $20 / Pro $28 credit allowances (100 / 200 / 308). No automatic wallet deductions; send renewal reminders and create a new invoice. Do not label manual renewal as automatic recurring billing.

Quote in USD and show a time-limited stablecoin amount. Candidate asset: USDT on one explicitly supported network initially; verify checkout minimum and all network fees for a $10 order. Do not assume TRC20 is cheaper than BSC/Solana or that stablecoins are risk-free. Let supported methods be driven by provider quote/API and the payer's actual wallet network. No bridging required for checkout.

Server validates plan and user, creates a unique order/invoice, stores quote/expiry/coin/network and expected amount, then directs to hosted checkout. Secrets remain server-side. Verify webhook signature and re-fetch payment status, matching merchant/order/amount/asset/network and terminal successful settlement. Grant credits once through an atomic idempotent ledger transaction; duplicates/replays and out-of-order status updates must not credit twice. Pending, underpaid, expired, wrong-network, AML-held and refunded orders get separate states. Browser redirect, screenshots and a supplied transaction hash are not proof of settlement. Preserve unused entitlement rules and define an explicit refund policy. Never collect user seed phrases/private keys.

## Payout is a separate dependency

Gateway crypto balance or wallet settlement is not a PKR bank payout. No verified end-to-end Pakistani fiat off-ramp was established. Pakistan's 14 April 2026 SBP circular covers PVARA-licensed/NOC VASPs and related banking conditions; it is not blanket approval for every foreign gateway or P2P route. Verify a currently authorized conversion provider plus recipient bank acceptance and invoice/source-of-funds requirements. Do not assert this SaaS necessarily needs a VASP license solely for selling its own service. Source: https://archive.sbp.org.pk/bprd/2026/CL10.htm

## Questions for Cryptomus support (draft, not sent)

I am a Pakistan resident selling my own AI letter-writing SaaS (https://ailettergen.com) as an individual without an incorporated company. Plans are $10/$20/$28 per 30 days. Please confirm Pakistani individual merchant eligibility and documents; whether non-sanctioned Russia-resident customers may pay our invoices under your current terms; SaaS/AI writing approval; actual starting fee, invoice minimums, network/withdrawal/conversion fees and review timing; supported USDT networks for $10 purchases; webhook/sandbox support; and whether fiat payouts to a Pakistani personal bank account are available through an authorized partner. Please distinguish crypto-wallet settlement from bank cash-out and identify any restrictions/holds. We will not integrate as a live method before eligibility is clear.

Also check selected AI vendors' supported territories before selling access; payment eligibility does not establish AI-service territorial eligibility.

