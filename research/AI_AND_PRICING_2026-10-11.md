# AI Letter Generator: AI selection, complete costs and proposed subscriptions

> Historical proposal. Current user-approved prices are Starter $10, Plus $20 and Pro $28 with 10% extra usage; selected models are GPT-6 Luna and Claude Opus 5.5. See [current plan and token breakdown](SUBSCRIPTION_PLANS_2026-10-11.md). The old prices, model shortlist and financial scenarios below are superseded; the generated calculator now uses the current proposal.

11 October 2026. USD unless another currency is explicitly shown. This is a researched proposal, not a deployed billing system or a measured model-quality ranking. The user requires monthly subscriptions below competitors and has not specified a fixed budget. Business registration and payout country remain unconfirmed.

## Recommendation

Use **GPT-6 Luna as the first evaluation candidate** for ordinary letters, **Claude Haiku 5.5 as the competing candidate**, and **Gemini 3.5 Flash-Lite** for a third comparison and document/translation workloads. Use **GPT-6.1 Sol selectively** when a cheaper model fails language or factual checks. Do not route every request through an expensive model or web search. The initial candidate selection is a cost/workload inference, not proof that any model is best in all languages.

OpenAI describes Luna as its fastest, most cost-effective family member for focused high-volume work, and Sol as a balance of intelligence, speed and cost. That makes this a sensible shortlist for our bounded letter-writing task. [Official model guidance](https://developers.openai.com/api/docs/guides/latest-model).

Proposed launch prices: **Starter $5.99/month, 30 AI actions; Plus $7.99/month, 100 AI actions; free trial 2 lifetime actions after verified signup**. Confirm these after metering a pilot and validating language quality. Do not sell unlimited use or lifetime AI access at launch. Paid plans are proposed here; the app still uses its existing providers and does not enforce these quotas yet.

## Verified provider prices and what they mean

Standard interactive rates, uncached input, short context, per one million tokens. The last column assumes one call with 4,000 input tokens and 800 output tokens, **without additional reasoning, retries, tools, images or taxes**. Identical token counts are a comparison device; actual tokenizer counts differ by provider and language.

| Candidate | Input / M | Output / M | Token-only call estimate | Proposed role, subject to evaluation |
|---|---:|---:|---:|---|
| GPT-6 Luna | $0.10 | $0.50 | $0.00080 | Default letter candidate |
| Claude Haiku 5.5, prompt <=100k | $0.10 | $0.50 | $0.00080 | Compare language quality; structured extraction candidate |
| Gemini 3.1 Flash-Lite | $0.25 | $1.50 | $0.00220 | Lower-cost Google alternative to compare if accessible |
| Gemini 3.5 Flash-Lite | $0.30 | $2.50 | $0.00320 | Translation/document candidate |
| DeepSeek V4.1 Flash, peak/cache miss | $0.30 | $1.20 | $0.00216 | Secondary candidate after privacy/availability review |
| GPT-6.1 Sol | $2.00 | $10.00 | $0.01600 | Stronger-model escalation |

Sources: [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing), [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing/).

Claude's Haiku rate rises above 100k prompt tokens. Its documentation positions it for high-volume classification, extraction and routing; letter-writing quality needs separate testing. Claude's newer tokenizer also changes counts, so price per token alone does not establish lowest cost per accepted letter. [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing).

Google describes both Flash-Lite candidates as suitable for translation and simple processing. Thinking tokens are billable output. Paid-tier data treatment differs from free-tier treatment. Google Search can issue multiple billable queries; the budget below uses $0.014/query and assumes no free allowance, rather than making free search essential to margins. [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing).

DeepSeek's current API model name is `deepseek-flash`; it maps to V4.1 Flash. Peak input/output prices are used above; off-peak prices are half. Its default thinking mode and changing model aliases need explicit controls if adopted. [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing/).

Self-hosting is not the first choice: GPU capacity, inference maintenance and burst traffic need separate quotes, while this task has low API token costs. No GPU-price assumption is used to invent a self-hosting saving. Free consumer tools also compete with us, so a paid product must deliver reliable context import, useful local-language drafts and polished exports—not merely access to an LLM.

## Multilingual quality: how to select the winner

The current UI has seven languages. Output choices cover eleven: English, Spanish, French, Arabic, Dutch, Russian, Portuguese, Bulgarian, Hungarian, Slovak and Polish. Evaluate **each output language**, not just the interface translations. Arabic needs both appropriate phrasing and correct RTL document layout; Portuguese variants and country-specific salutations need explicit user preference. A Russian-language user is not necessarily located in Russia.

Prepared `evaluation/fixtures.jsonl`: 44 synthetic cases, four per language. Cases cover an experienced applicant, a student with no paid experience, a professional email and hostile instructions inside a job description. There are no real resumes or private user details. All model score rows remain `not_run`.

Run the same source facts and purpose across the three shortlisted models, twice per case, then review blind with fluent speakers. Keep the evaluation budget separate from subscriptions. At the worksheet's token assumptions, 264 low-cost candidate calls plus 44 Sol comparator calls estimate under $2 in token charges; reserve **$5 for the first bounded API run**, excluding tools and reviewer time. This is an estimate, not permission to charge an account; no paid API benchmark was executed during this work.

Score factual fidelity 30%, language/register 25%, opportunity relevance 20%, specificity/avoidance of stock phrasing 15%, and instruction/format compliance 10%. Fail immediately for invented degrees, dates, achievements, language mismatch, leaked instructions, or false claims about having fetched a URL. Proposed acceptance gate: >=85/100 and no hard failure in every launch language, with two fluent reviewers resolving disagreements. Four cases per language is a pilot, not sufficient proof of universal quality; expand to at least 20 diverse cases per language before advertising reliable multilingual performance. Record p50/p95 latency, actual billable tokens, retry rate, edit effort and cost per accepted output.

If one language fails, improve its prompt and re-evaluate or route that language to the stronger model. Do not charge the user extra for an automatic repair. Review grounded facts locally before writing: normalized applicant facts + actual opportunity text + output-language/register controls. Tell the model to omit missing facts. Keep sources as data, not instructions. Full fine-tuning is premature without reviewed examples and measured failures.

## Current code findings that affect paid launch

- `services/llms.tsx` first calls Puter with `gpt-4o-mini`; fallback is `gemini-2.5-pro` in `geminiService.ts`. This is not the proposed new API pipeline.
- The Puter generation prompt does not ingest the attached resume or job screenshot. Its keyword extraction prompt sends a URL/string but does not supply the screenshot or explicitly fetch page text. Provider success can therefore return a letter with less context than users expect. Normalize context before calling **any** provider.
- `vite.config.ts` substitutes Gemini keys into browser code. If a production key has been built this way, it must move to server-only configuration and be rotated before paid use. Never place paid-provider keys in client bundles. This finding is based on configuration, not disclosure of a key; no secrets were printed.
- No server-enforced entitlement, atomic quota ledger or billing webhook exists in the inspected frontend flow. Local storage is for browser drafts, not a subscription ledger.
- PDF export currently rasterizes the letter into an image. Preserve it for the UI update, but a paid document product should export selectable text with proper Arabic fonts/RTL, accessible content and pagination. Add DOCX only when it is implemented and tested.
- About/legal styling now follows the new UI. Policy content must be updated to the actual providers, retention, cancellation/refund and billing behavior before paid launch; do not infer those behaviors from the proposed plans.

Implementation order: server AI endpoint and context parser → per-request usage ledger → multilingual pilot → auth + quotas → approved payment provider sandbox + signed/idempotent webhooks → text PDF/DOCX checks → paid launch. The UI redesign is complete locally; this separate commercial infrastructure has not been introduced by the redesign.

## Competitor price constraint and plans

Current official pages show [Teal](https://www.tealhq.com/pricing) at $29 every 30 days and [Rezi](https://www.rezi.ai/pricing) at $29/month. [Kickresume](https://www.kickresume.com/en/pricing/) returned €24/month in the current localized response; currencies and promotions vary. Earlier USD snapshots in the companion competitor report are not a currency conversion. These are broader career suites, so our lower price is a positioning decision rather than equal-feature value proof. Free alternatives cannot be undercut with a positive subscription price.

| Proposed plan | Price before checkout taxes | Clear allowance |
|---|---:|---|
| Trial | $0 | 2 lifetime AI actions, verified account, basic edit/copy |
| Starter | $5.99/month | 30 AI actions, supported output languages, edit/copy/PDF |
| Plus | $7.99/month | 100 AI actions, same language quality and exports; higher quota |

An action means a successful generation, rewrite, extraction or import. A complete letter with import and opportunity analysis may use 2–3 actions; show the expected credit use before the action. Local edits, restoring a draft, copying and local PDF exports cost no credits. Provider failures do not consume user credits, but their billed costs remain in our ledger. Monthly quotas reset on the paid billing anniversary, with no rollover initially. Annual plans are deferred until retention and churn are measured. A future nonrenewing 30-day pass may suit short job searches, but is not included in the calculator's subscription revenue.

## Full cost assumptions and formula

Interactive calculator: `cost-calculator.html` (self-contained/offline). Reproducible source: `cost-model.mjs`; exports: `cost-scenarios.json` and `.csv`. These assumptions are editable, not actual invoices or traffic forecasts.

| Monthly fixed item | Baseline | Evidence / status |
|---|---:|---|
| Vercel Pro, one deploying seat | $20 | [Official Pro pricing](https://vercel.com/docs/plans/pro-plan); includes usage credit, not a second $20 bill |
| Supabase Pro, one base project | $25 | [Official pricing](https://supabase.com/pricing); auth/database/included storage; no second basic storage charge |
| Resend Pro reservation | $20 | [Official pricing](https://resend.com/pricing); free 3,000/month also has a 100/day cap; reduce this line only if actual traffic fits |
| Domain annual invoice / 12 | $1.50 | Assumed $18/year; replace with actual renewal invoice |
| Monitoring | $5 | Planning allowance, no vendor purchased |
| Extra infrastructure / backups | $10 | Planning reservation beyond included allowances |
| Accounting | $20 | Assumption; local quote required |
| **Fixed operations** | **$101.50** | Excludes owner labor and variable costs |

The paid-launch stack is proposed, not already subscribed. A smaller pilot may fit free allowances, but the business model should survive commercial paid infrastructure. Traffic above included bandwidth/storage/compute must be metered and this reservation increased; one base server/database plan is not an assurance of unlimited scale.

AI planning per action: 4,000 input + 800 visible output + 1,000 extra reasoning tokens; additive stronger-model fallback on 10%; 15% billed retry overhead; paid search on 20% of actions with 1.5 queries each; extra OCR on 10% at an assumed $0.003; variable infrastructure $0.001/action. Reserve **at least $0.015/action** even if the modeled cheap route costs less. No cache or batch discount is required. An OCR/image-heavy workflow may cost more and must use actual provider image/token accounting; this reservation does not guarantee a bound.

Further assumptions: 80% Starter / 20% Plus; 40% expected paid quota use; five **new** free trials per paying user per month, two lifetime credits each; payment 5% + $0.50; refund reserve 2% of revenue; payout/FX reserve 1%; disputes 0.5%; support $0.25/paying user; replacement acquisition $5 × 10% monthly churn; owner time 20 hours × $10; 15% contingency on fixed operations + AI. Positive operating profit gets a provisional 10% income-tax reserve, **not a local tax rate**. The calculator excludes checkout sales taxes from revenue; tax-inclusive fee bases can still increase processor costs. Add actual tax, country-specific settlement fees and legal/accounting quotes before locking prices.

`AI cost = (paid actions + new trial actions) × max(calculated workflow cost, reserved action cost)`

`Net estimate = revenue − payment/refund/FX/dispute deductions − AI − support − acquisition − fixed operations − contingency − owner labor − provisional tax reserve`

## Computed scenarios

Revenue averages $6.39 per paying user. All rows include the above owner labor, acquisition, free users, fees and reserves. They are arithmetic scenarios, not profit forecasts.

| Paying users | Usage | Gross revenue | Cost incl. all reserves | Remaining after reserve |
|---|---|---:|---:|---:|
| 100 | Expected | $639.00 | $553.19 | $85.81 |
| 100 | Full paid quota | $639.00 | $594.17 | $44.83 |
| 500 | Expected | $3,195.00 | $1,625.72 | $1,569.29 |
| 500 | Full paid quota | $3,195.00 | $1,830.65 | $1,364.36 |
| 1,000 | Expected | $6,390.00 | $2,966.38 | $3,423.62 |
| 1,000 | Full paid quota | $6,390.00 | $3,376.24 | $3,013.76 |

Break-even under these assumptions: **77 paying users expected usage; 87 at full paid quota**. At zero customers, fixed operations plus contingency are $116.73/month before owner labor; including the assumed owner time makes $316.73. There is therefore a pre-revenue operating requirement even without a fixed budget. The reserve figures cannot prove demand. At 10× reserved AI/tool unit cost ($0.15/action), full-quota contribution becomes negative at these prices; quotas and metering are essential. Acquisition cost, excessive free-account abuse and full-time support can be more important than nominal token price. One-time development/design and extra growth marketing are not hidden in these monthly totals: track them separately as setup costs/CAC investment.

## Payment provider decision

[Paddle](https://www.paddle.com/pricing) advertises 5% + $0.50 and merchant-of-record services; it suggests bespoke pricing for products below $10. Use that public fee only as a planning baseline until account approval and quote are confirmed. At $5.99, this baseline is $0.7995 (~13.35%); at $7.99, $0.8995 (~11.26%) before any other deductions. Small $1 top-ups are poor value with a $0.50 fixed fee.

[Lemon Squeezy fees](https://docs.lemonsqueezy.com/help/getting-started/fees) show 5% + $0.50 with extra 0.5% for subscriptions, 1.5% for international transactions and 1.5% for PayPal. Non-US bank payouts can add 1%; the fee basis may include checkout taxes. Model these additions explicitly if this provider is chosen, rather than copying the Paddle baseline.

If the merchant account is in Pakistan, [Lemon Squeezy's supported-country list](https://docs.lemonsqueezy.com/help/getting-started/supported-countries) currently lists bank payouts there, subject to onboarding and verification. That does not mean a direct Stripe account is automatically available; [Stripe's availability list](https://stripe.com/global) must match the actual registered business country. The merchant country has not been confirmed, so no final provider is selected. Lemon Squeezy also excludes purchases from the Russian Federation: geographic payment availability must be checked separately from Russian-language support. Do not treat /ru impressions as evidence of a monetizable Russian-country audience.

For launch, use one merchant-of-record provider if eligible, a hosted checkout, signed webhook verification, atomic entitlements and an append-only credit/usage ledger. Record provider/model/version, request purpose, actual input/output/reasoning/cache tokens, tool queries, attempt/fallback count, billed cost, customer credit delta and payment net revenue. Keep raw resumes out of ordinary logs. Review actual weekly cost per accepted draft and per paying cohort before extending quotas or discounts.

## Work completed and verification

UI: warm neutral/forest-green visual system, editorial headings, labeled sample letter, purpose tabs, desktop two-pane workspace, mobile Details/Draft tabs, quieter footer/cookie banner, and consistent controls on seven locales. Prebuilt Radix dropdown/tabs/Slot primitives and Lucide icons support shared components in `components/ui`; controls follow the shadcn composition pattern without claiming a full shadcn installation.

Production build prerenders all 35 public URLs. Initial JS was reduced from ~1,059 kB to ~491 kB by loading AI SDKs only when needed. Remaining AI chunk is ~568 kB, so this is not a full performance audit. Existing provider behavior, saved letters and export actions are retained. Browser checks covered desktop, 390px mobile, Arabic RTL, theme switch, menu/language navigation, required-name validation and purpose/wizard transitions; no hydration errors observed. Paid generation and the new candidate models were not called. PDF/DOCX quality and real paid-provider latency remain separate validation tasks.

The calculator also accepts a one-time setup invoice and allocation period. Its default setup cost is zero because no invoice was supplied; this is an unknown, not a claim that implementation is free. Enter design/development, business registration and other setup costs before using the model for a final investment decision. Currency rows are rounded independently, so displayed totals can differ by one cent.

