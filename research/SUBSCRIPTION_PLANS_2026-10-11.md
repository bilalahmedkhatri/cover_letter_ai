> Superseded usage limits: see ../PLAN_USAGE.md (2026-10-12). Prices are unchanged, but the old generation counts, consumption weights and calculator assumptions below are historical.

# Current subscription proposal: Starter $10, Plus $20, Pro $28

Updated 11 October 2026 following the user's pricing/model decision. Pro includes **10% extra usage at the same $28 price**, not an extra charge. Selected models: **GPT-6 Luna (`gpt-6-luna`) and Claude Opus 5.5**. This replaces the earlier $5.99/$7.99 proposal. Prices, quotas and provider usage are planning configuration; production checkout and server-side AI routing have not been implemented.

## Shared credits and monthly limits

Recommended credit costs: Luna letter **1**, Opus letter **4**, university research **20**. Users choose their mix from one monthly wallet. These credit weights come from conservative operation costs and are not provider tokens. Pro's base 280 credits + 28 bonus credits = **308**. Do not apply another 10% to its displayed quotas or round research up beyond available credits.

| Plan | Monthly price before checkout taxes | Monthly credits | Only Luna letters | Only Opus letters | Only university researches |
|---|---:|---:|---:|---:|---:|
| Starter | $10 | 100 | 100 | 25 | 5 |
| Plus | $20 | 200 | 200 | 50 | 10 |
| Pro | $28 | 308 | 308 | 77 | 15, with 8 credits remaining |

The last three columns are **alternatives, not three simultaneous allowances**. Users can mix operations. Practical examples that use the entire balance:

| Plan | Mixed use | Credits |
|---|---|---:|
| Starter | 40 Luna letters + 10 Opus letters + 1 university research | 40 + 40 + 20 = 100 |
| Plus | 80 Luna letters + 20 Opus letters + 2 university researches | 80 + 80 + 40 = 200 |
| Pro | 108 Luna letters + 30 Opus letters + 4 university researches | 108 + 120 + 80 = 308 |

A letter is one generated draft; job letters, admission letters and professional emails use the selected model's letter credit cost. A fresh AI rewrite is another letter operation. Manual editing, copying, restoring and local export consume no AI credits. If the user runs university research and then writes a letter using it, the two operations cost 20 + 1 credits with Luna, or 20 + 4 with Opus. Reuse the already collected research instead of fetching it again during letter generation. Research max counts do not also include generated admission letters.

One university research covers **one university/program**, up to five official source pages and three billed web searches. It produces a sourced report on requirements, deadlines, available scholarships and relevant contacts, with unavailable/unverified facts clearly marked. It is bounded research, not unlimited multi-university agent work. A fresh research rerun consumes another research allocation; a failed fetch/research should not charge user credits. Provider-billed retries still count against our cost ledger.

Trial remains two lifetime Luna credits after verified signup. Quotas reset on the billing anniversary; no rollover is proposed initially. Show model, credit cost and remaining balance before generation. Both models are available in paid plans, with their own credit cost; do not silently substitute models.

## Token allowances, not measured consumption

Tokenization differs across languages and models; these are planning allowances for the complete operation. They must be enforced server-side before advertising guaranteed quotas. Actual token usage must come from the provider's usage response. Input includes applicant facts, opportunity/source content, system instructions and repeated conversation history. Output includes visible text and billable reasoning. These are not character/word counts.

| Operation | Aggregate input | Visible output allowance | Extra reasoning allowance | Total billable token allowance |
|---|---:|---:|---:|---:|
| Luna or Opus letter | 6,000 | 1,000 | 1,000 | **8,000** |
| University research with Opus | 30,000 | 6,000 | 4,000 | **40,000** |

Research totals are **summed across all model/tool rounds**, not allowed independently in each round. Source retrieval and search results contribute input tokens. Extra document/image processing may require a separate quote or normalized text extraction. Long resumes or large source pages must be bounded without silently discarding material applicant facts. User-requested extended research needs a separate quoted credit budget.

Monthly totals if the balance is spent on only one type:

| Plan | Luna-only letters: input + output | Opus-only letters: input + output | Research-only: input + output |
|---|---|---|---|
| Starter | 600,000 + 200,000 = **800,000** | 150,000 + 50,000 = **200,000** | 150,000 + 50,000 = **200,000** |
| Plus | 1,200,000 + 400,000 = **1,600,000** | 300,000 + 100,000 = **400,000** | 300,000 + 100,000 = **400,000** |
| Pro | 1,848,000 + 616,000 = **2,464,000** | 462,000 + 154,000 = **616,000** | 450,000 + 150,000 = **600,000** |

Mixed-example totals above: Starter 330,000 input + 110,000 output = **440,000** tokens; Plus 660,000 + 220,000 = **880,000**; Pro 948,000 + 316,000 = **1,264,000**. A monthly credit wallet is not a universal raw-token pool: model input/output prices differ, so giving the same raw-token budget for both models would misprice expensive output.

## Verified rates and conservative costs

Standard interactive, short-context and uncached rates, per million tokens:

| Model | Input | Output |
|---|---:|---:|
| GPT-6 Luna | $0.10 | $0.50 |
| Claude Opus 5.5 | $4.00 | $20.00 |

Sources: [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing). At these rates and identical token counts, Opus token charges are 40 times Luna's. The allowance/cost proposal uses no caching, batch discounts or free search quota.

Claude web search is $10/1,000 searches plus content tokens; web fetch has no extra tool fee beyond consumed tokens. Three searches reserve $0.03, separately from model tokens. [Claude tool pricing](https://platform.claude.com/docs/en/about-claude/pricing).

| Operation | Token charges at allowance | Planning reserve including 15% retry overhead, tools and parsing/infra |
|---|---:|---:|
| Luna letter | $0.0016 | **$0.015** |
| Opus letter | $0.064 | **$0.10** |
| Opus university research | $0.32 + search charges | **$0.45** |

Research calculation: ($0.32 + $0.03 search) × 1.15 + $0.01 parsing/infra = $0.4125; rounded reserve $0.45. Letter parsing/infra uses an assumed $0.005 per operation. These are estimates, not measured success rates or guarantees that every possible file fits. Paid-model tests were not executed.

## AI expense if a user consumes the full balance

| Plan | All Luna letters | All Opus letters | All university research | Conservative full-wallet AI budget |
|---|---:|---:|---:|---:|
| Starter | $1.50 | $2.50 | $2.25 | **$2.50** |
| Plus | $3.00 | $5.00 | $4.50 | **$5.00** |
| Pro | $4.62 | $7.70 | $6.75 | **$7.70** |

The worst reserved credit cost is max($0.015/1, $0.10/4, $0.45/20) = **$0.025/credit**. The calculator budgets every paid credit at this cost, rather than assuming all customers select Luna. Payment fees, free trials, support, acquisition, hosting, databases, email, owner time, refunds, FX, accounting and reserves are additional expenses.

## Complete monthly scenarios

The updated calculator defaults to an assumed customer mix of 60% Starter, 30% Plus and 10% Pro. Average revenue is **$14.80/customer**, allowance 150.8 credits. Expected use is 40%; stress case consumes all paid credits. Assumes five new free trials per paying customer, two Luna credits each. Previous operating assumptions are retained: $101.50 fixed operations, $200 owner-time allocation, payment 5% + $0.50, refunds 2%, FX 1%, disputes 0.5%, support $0.25/user, replacement acquisition $5 × 10% churn, 15% buffer on fixed + AI, and a provisional 10% tax reserve on positive profit. The tax figure is a placeholder, not jurisdiction-specific guidance.

| Paying users | Scenario | Gross revenue | Remaining after all entered costs/reserves |
|---|---|---:|---:|
| 100 | Expected | $1,480 | $649.62 |
| 100 | Full paid balance | $1,480 | $415.51 |
| 500 | Expected | $7,400 | $4,388.33 |
| 500 | Full paid balance | $7,400 | $3,217.75 |
| 1,000 | Expected | $14,800 | $9,061.72 |
| 1,000 | Full paid balance | $14,800 | $6,720.55 |

Break-even: **31 paying users at expected use, 41 with full paid balances** under this assumed mix and fixed costs. These are arithmetic scenarios, not a forecast of customer demand or margin guarantees. Higher support, traffic, reasoning, research reruns or acquisition can materially change them. Setup invoices default to unknown/zero and should be entered. The model now explicitly includes a third plan and Pro bonus.

Current artifacts: `cost-calculator.html`, source `cost-model.mjs`, exports `cost-scenarios.json` / `.csv`. Rebuild with `node scripts/build-research.mjs`; test with `node --test --test-isolation=none tests/cost-model.test.mjs`. Historical provider comparisons remain in `AI_AND_PRICING_2026-10-11.md`; its old prices and scenarios are superseded. Candidate review sheets now target Luna and Opus only and are still unrun.

Before paid rollout: meter aggregate provider tokens and tool calls, precheck credits, reserve atomically, settle on success, refund unused reservations on failure, enforce operation token/search caps, verify payment webhooks, and update privacy/billing terms to the actual providers. Automatic repairs/retries must be capped and charged to our cost ledger rather than surprising the customer. Current app AI integration remains its previous implementation until that separate work is done.
