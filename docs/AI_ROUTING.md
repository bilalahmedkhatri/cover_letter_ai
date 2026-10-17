# AI gateway integration and prompt templates

Updated 17 October 2026. Cover letters now use the external prompt-only generation endpoint. University applications, emails and research retain the query gateway. Earlier Gemini key allocation, direct provider calls, model selection and generation metering are no longer in the active request path.

## Cover-letter adapter

Cover letters call `POST /api/v1/generate/` with exactly `{prompt}`. There are no search, model-selection, language or history fields: the existing complete writing prompt includes those writing settings and any bounded previous conversation text. No web search or URL retrieval is requested. The response contract is `{answer, request_id, finish_reason: "stop" | "unknown"}`. Unknown means the provider did not confirm normal completion; it does not certify completeness. Known truncation/refusal errors and unexpected finish metadata are rejected. The adapter preserves answer whitespace/Unicode, maps it to the existing `text` field and returns empty `sources`; no upstream metadata is exposed to the browser.

Set server-only `AI_GATEWAY_GENERATE_URL` to the deployed endpoint. When absent, it is derived by replacing the final `/query/` in `AI_GATEWAY_QUERY_URL` with `/generate/` on the same host. Custom query paths require an explicit generation URL. HTTPS is required except for loopback development. Keep `AI_GATEWAY_API_KEY`; its project must allow **POST /api/v1/generate/** in the backend admin. This integration does not change backend grants or deployment.

`AI_GATEWAY_GENERATE_MAX_PROMPT_CHARS` defaults to **32768 Unicode code points**; `AI_GATEWAY_GENERATE_MAX_BODY_BYTES` defaults to **524288 UTF-8 bytes** of the exact serialized JSON request. Match deployed backend settings; these defaults were checked against `D:\AIModels_SearchAPIS\GENERATION_API.md` and `app/core/config.py`. They are not model-context guarantees. Oversized current prompts fail before starting history/generation, without truncation. Previous conversation is still limited to the newest six messages that fit the selected endpoint budget.

The initial Next.js upstream deadline is at most 60 seconds (backend documented default overall deadline: 45 seconds), with no client retries. Cover letters now run local checks and a separate AI review, with at most one repair: the whole AI pipeline has a 90-second budget; review and repair are each capped at 25 seconds and the remaining budget. The route allows 180 seconds for auth/history/storage plus model work. The persisted generation UUID is sent as `X-Request-ID`, with `:review` and `:repair` suffixes for additional passes. Backend tracing does not deduplicate; the existing Next.js conversation request claim/replay handles duplicate submissions. Safe messages distinguish auth/grant rejection, size/context failures, refusal, rate limits, unavailable providers, truncation and timeout. Raw backend error text is never echoed.

Tests: `npm run test:cover-letter` plus `node --test --test-isolation=none tests/ai-routing.test.mjs tests/history.test.mjs tests/gateway-consumption.test.mjs`. Provider mocks verify contracts, five-language Unicode handling, budgets, review/repair failures and history replay; they do not establish real multilingual writing quality. Cover letters use shared Zod schemas, deterministic source preparation and the versioned `cover-letter.v1` prompt; see [template contract](COVER_LETTER_TEMPLATE.md) and [review testing guide](COVER_LETTER_TESTING.md).

Live integration check on 17 October 2026: local `/openapi.json` returned 200 and advertised `/api/v1/generate/`. One adapter request with fictional applicant data returned **403**, safely mapped to the endpoint-permission error. The configured service key's access must be verified/granted for this route before real generation can be validated. No permission grants, production deployment or backend database changes were performed.

The remaining sections describe the retained query route and previous verification, unless explicitly stated otherwise.

## Configuration and request flow

```dotenv
AI_GATEWAY_QUERY_URL=http://localhost:8000/api/v1/query/
AI_GATEWAY_API_KEY=<existing gateway app key>
```

The existing working gateway key was renamed from the misleading local variable GEMINI_KEY_CLAIM_SECRET to AI_GATEWAY_API_KEY without changing its value. Restart the app after environment changes. Production needs a reachable HTTPS gateway URL; localhost on Vercel points to the function itself. The key is sent only from the server as X-API-Key. Never put it in NEXT_PUBLIC configuration.

Browser → authenticated same-origin /api/generate or /api/research → server template composition → POST /api/v1/query/ → answer mapped to text → workflow-specific result page → existing editor, copy, PDF and save-to-account UI. See [result pages and history plan](RESULTS_AND_HISTORY_PLAN.md).

The gateway request is exactly {query, input_type: "text", search_engine: "auto"}. Cache-Control: no-cache bypasses the gateway's cached response for the generation request. The gateway selects models, search and provider fallback; this app no longer forces Gemini or another model. answer becomes text; safe HTTP(S) source links are retained and marked search sources. Provider routing diagnostics are not returned to the browser.

No subscription checks, generation quota, billing reservations, credit charges or app generation rate limits are executed. History persistence now uses the existing account store, without calling its billing methods. Authentication, same-origin checks and payload validation remain. Payment infrastructure, prices and existing database/migration history were preserved; their legacy metering helper is not called by generation. The external gateway can still enforce its own availability or rate limits.

Google GenAI SDK, its direct-provider adapter, key-claim calls, output-budget logic, provider fallback and media envelope helper were removed. Existing business prompt text was preserved.

## Prompt implementation: unchanged templates

The implementation reuses services/workflow.mjs for writing validation, generationSystemInstruction, generationPrompt and wordTargets. Research uses the existing researchSystemInstruction and researchPrompt in server/ai/providers.mjs. No wording of those templates was changed for this integration.

1. The stable writing instruction requires supported facts, no fabricated achievements, untrusted-source handling, natural language, valid identity/signature and plain-text output. It tells the model not to claim a URL was read without actual retrieved text.
2. generationPrompt serializes sourceData: name, recipient, user brief, document text, skills, experience, URL and any supplied retrievedPage. It separates writingPreferences.customInstruction from task settings.
3. Task settings define document type, output language, tone, target length, document-specific structure and identity rules. Cover letters emphasize relevant role evidence; applications emphasize academic motivation/programme fit; emails use subject, context, one request and closing.
4. Word targets are 120–180 / 250–350 / 400–550 for letters and 60–90 / 100–150 / 180–250 for emails. These guide output, not enforced token limits.
5. Research instructions require official evidence, dates, missing-information flags and source links, and prohibit writing an application instead. The research JSON includes programme, questions, language, current date and requested report sections. The source URL is appended outside the unchanged template.
6. The adapter concatenates the instruction, two newlines and the serialized task into the gateway query string. The gateway has no separate system-prompt field, so these are textual instructions within query, not a privileged system-role message. Its RAG wrapper or chosen model may weaken their priority.

The composer brief supplies the name/signature in compact mode. The detailed form supplies profile fields, recipient, tone, length, language and custom instructions. Shared form context persists across workflow changes. No extraction of user identity or language into separate fields was added in this change; the template already asks the model to honor safe instructions in the brief.

## Current gateway contract limits

The entire composed query must fit 4,096 Unicode characters, including instruction and JSON. No text is silently removed: exceeding the limit returns 413 with a shorten-input popup before contacting the gateway. A 6,000-character UI brief or 12,000-character parsed document allowance does not imply it will fit the smaller upstream contract.

Documents parsed to text can be submitted if the complete prompt fits. The current query endpoint cannot accept image bytes; image attachments are rejected explicitly, including forged API requests. URL text is sent as context; this active flow does not independently retrieve pages. Search sources do not establish that the supplied page was read.

The app uses a 90-second upstream deadline with no automatic retries, as the gateway already handles model routing/fallback. Persistent chat history adds a request UUID for duplicate prevention and completed-result replay; this is not quota metering. Login failures, gateway authentication/permission errors, capacity/rate limits, validation, oversized input, malformed/empty answers and transport failures produce safe errors in the existing Dialog component. Raw provider bodies, secrets and routing traces are not exposed.

## Suggested prompt improvements (not implemented)

- Give the gateway a dedicated writing operation plus separate system/task/source fields. Pass the unchanged instruction as the actual provider system role, not inside an automatically searched question.
- Avoid web search for personal cover-letter facts; research only programme/company facts when needed. Never use search results to infer applicant history.
- Introduce a fact checklist and test output claims against supplied evidence. The live Spanish test produced unsupported experience claims despite the instruction; successful HTTP delivery is not proof of factual quality.
- Add an explicit language precedence rule so a Spanish request in the brief and an English saved preference cannot conflict. Resolve conflicts before generation.
- Version templates and add multilingual evaluation cases for role fit, invented claims, language, tone, identity and length. Evaluate identical inputs before choosing few-shot examples.
- Extend the gateway contract for larger document context and optional image input. Until then, preserve templates and show input-limit errors instead of truncating evidence.
- Later add exact institution word limits and application subtype, then validate length and return warnings separately from the finished letter.

## Verification

89 local tests passed, including gateway contract/authentication/errors, unchanged prompt composition, text-only media rejection and absence of generation billing calls, plus existing account/payment regression tests. A real gateway request with fictional Spanish cover-letter input completed successfully: 917 output characters in approximately 53 seconds. It returned search sources. Factuality review found unsupported experience claims, so quality improvements remain separate work.

No database migration, payment activation or deployment is part of this change. Production build and TypeScript passed. A disposable real browser account submitted an oversized request and displayed the existing error Dialog, then submitted a real Spanish request and rendered the gateway answer in the existing editor. Database verification found zero generation quota rows for this account. The disposable account and its own empty records were removed. Desktop/mobile screenshots are under output/playwright/query-*.png. No gateway response was mocked for the successful browser generation.

Persistent conversation storage, failure handling, bounded follow-up context and sidebar behavior are documented in [chat history](RESULTS_AND_HISTORY_PLAN.md).
