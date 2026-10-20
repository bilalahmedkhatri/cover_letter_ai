# Security recheck — 19 October 2026

## Remediation update — 20 October 2026

The findings below preserve the original audit evidence. SEC-001 and SEC-002 are now fixed in the working tree: `PrivateAnalytics` applies the tested URL redaction helper; the account provider consumes SDK session notifications, rejects stale overlapping refresh results, and changes the personal workspace key on authenticated identity loss/change. Same-user locale changes and initial anonymous sign-in retain input. Identity changes refresh server-rendered route permissions; old personal-provider callbacks cannot mutate the new workspace.

SEC-003 now has the user-approved non-billing limits: 10 new requests per rolling minute and two running requests per user. New guarded SQL entrypoints serialize per-user claims and store recent starts/active leases independently of deletable chats. Duplicate/completed replay does not claim a new slot. Completion/failure releases it; a crash expires after five minutes. HTTP 429 uses an actionable message and `Retry-After`. Missing migration fails closed. **Apply `202610200001_generation_abuse_guards` before running/deploying this code**; no remote database migration or deployment was performed in this task.

Compatible Prisma 7.10.1/transitive and browser-mapping updates reduced the production audit to **three moderate entries, zero high and zero critical**. Remaining entries are Mammoth/argparse/sprintf-js from Mammoth's CLI dependency path; the app imports the browser raw-text parser. No forced downgrade or major Auth SDK update was made. Optional peer warnings in Neon's bundled Auth UI tree remain; this app's actual Next auth session-store initialization passed an intercepted/mock browser check.

Global headers now include `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin` and CSP restrictions on framing/object/base URL use. The CSP deliberately does not claim script-XSS coverage. Embedding this app in an iframe is now disallowed.

Verification: production build and Prisma schema validation passed; 76 broad regression checks passed, followed by the final 34-test security suite including the dedicated missing-migration regression. Isolated browser regressions verified analytics redaction without changing the reset URL, same-user input preservation, identity/logout isolation, stale session/async callbacks and route revalidation. A production-mode local browser checked the actual Neon SDK's initial session subscription, response headers and EN/FR/AR client navigation/session reuse with intercepted fake auth responses. No real accounts, tokens, payments or model calls were used.

Four additional attachment regressions passed for Unicode TXT/CSV, XLS/XLSX extraction and size/shape/unsupported-file rejection. PDF/DOCX browser file uploads were not exercised in this fix pass; their parsing implementations were retained.

Remaining deployment work: apply pending migrations, deploy, then verify real auth/reset/cookie behavior and headers on the hosted domain. Retain edge/global abuse protection and dependency monitoring; per-user controls do not stop multi-account abuse. This is not a claim that the whole application or infrastructure has no remaining vulnerabilities.

## Executive summary

Two issues were reproduced with isolated mock-browser tests: analytics can construct a page-view URL containing a password-reset token, and persistent personal state is not cleared when the authenticated identity changes. These should be addressed before deploying the recent changes. No real credentials/accounts were used, no production exploitation was attempted, and no application fixes were applied during this review.

The review also records an existing, explicitly documented abuse-control gap and current dependency advisories. Server-side ownership, authentication and same-origin protections passed the focused regression suite. Passing those checks does not establish that the entire app is vulnerability-free.

Scope: recent locale/performance changes, persistent contexts, sign-in/sign-out, analytics, related generation/history/account handlers, rendering boundaries and installed production dependency advisories. This is a source/dependency review with isolated reproductions, not a live penetration test or infrastructure certification.

## High severity

### SEC-001 — Reset tokens can enter analytics page-view payloads

- **Rule:** NEXT-LOG-001 / frontend sensitive-data minimization.
- **Locations:** `app/layout.tsx:35`; `components/LoginPage.tsx:28–30`; `components/LanguageSelector.tsx:12–18`.
- **Evidence:** root layout mounts `<Analytics />` without `beforeSend`; the login page accepts the bearer-style `token` query parameter. Language links now preserve the current query string.
- **Verified behavior:** the installed `@vercel/analytics/next` 2.0.1 adapter issues a page-view command with a pathname. Vercel's publicly served debug script retains `location.href` when that pathname matches the current location, including its query string. An isolated browser using `/en/login?token=FAKE_TEST_TOKEN_ONLY` reproduced that fake token in the constructed page-view payload. Requests were intercepted; no real reset token was transmitted.
- **Impact:** if production Web Analytics is active and token-based reset URLs are used, a live reset token can be disclosed to analytics processing/logging rather than being limited to the authentication flow. Access to a still-valid reset token can enable password-reset abuse. Actual collection or compromise in the deployed app was not verified.
- **Minimal fix:** mount one small client analytics wrapper with a stable `beforeSend` callback that removes sensitive query data and fragments, or drops authentication/reset events entirely. Never pass a callback from a Server Component directly to a Client Component. Preserve the reset token for the auth form while excluding it from telemetry. Consider dropping all query strings from analytics URLs, since chat/order IDs are unnecessary for aggregate page counts.
- **Regression checks:** exercise initial load and client navigation with fake `token`, `code`, `chat`, and unknown query parameters; confirm outgoing telemetry contains no sensitive values while password reset and locale navigation still work.
- **Limit:** the reproduction used the current public debug collector. The hosted production collector and existing Vercel event history were not inspected. This is a verified unsafe payload construction path, not proof of historical token theft.
- **Reference:** [Vercel guidance on redacting sensitive URL data](https://vercel.com/docs/analytics/redacting-sensitive-data).

### SEC-003 — Existing generation path has no application abuse limiter

- **Rule:** NEXT-DOS-001.
- **Locations:** `server/ai/handler.mjs:17–49`; `server/accounts/store.mjs:42–46`; `prisma/migrations/202610160001_chat_history/migration.sql:25–70`; documented in `docs/AI_ROUTING.md:36` and `README.md:55`.
- **Evidence:** after login/origin/input checks, a new conversation request can reach `generate(...)`. History provides request-ID deduplication and one pending turn per conversation, but generation does not call a per-user rate/concurrency limiter. The migration explicitly describes request claims as independent of billing.
- **Impact:** a signed-in user can create separate conversation/request IDs and submit parallel or repeated expensive generation/review/repair requests, consuming provider capacity, database space and runtime resources. Authentication and same-origin checks do not stop an authenticated client from automating its own requests.
- **Important scope distinction:** generation quotas/credit charging were deliberately disabled before this performance change. This is an existing accepted product behavior with a remaining operational risk, not evidence that the locale update accidentally bypassed billing. Do not silently restore billing or paid-plan checks.
- **Recommended fix:** separately agree on a non-billing abuse policy, then enforce an atomic, persistent per-user burst/concurrency limiter before upstream work, preserving completed-request replay semantics. Define the limits and retry behavior rather than inventing paid-plan allowances. Verify any gateway/Vercel protection before counting it as mitigation.
- **Limit:** gateway throttling and Vercel firewall rules were not inspected; they may reduce exposure. No load test or provider-cost attack was performed.

## Medium severity

### SEC-002 — Root personal state survives account identity changes

- **Rule:** React sensitive-state isolation / NEXT-AUTH-001 defense in depth.
- **Locations:** `components/WorkspaceProviders.tsx:9–10`; `contexts/AccountContext.tsx:8–14`; `components/LoginPage.tsx:88`; explicit local sign-out clearing exists at `hooks/use-sign-out.ts:22–34`.
- **Evidence:** root providers preserve form and generation contexts for locale navigation, but are not scoped to the authenticated user's ID. `refresh()` changes the current account without clearing/remounting those contexts. Only the explicit local sign-out hook performs a full personal-state clear.
- **Reproduction:** compiled the actual `WorkspaceProviders`, `AccountProvider`, `FormStateProvider` and `GenerationProvider` with a mock auth client. Seeded Alice's brief and letter, changed the mock session to Bob and called the actual account `refresh()`. The owner changed to Bob while both Alice values remained visible in the probe. No API/database data was accessed.
- **Impact:** when the identity changes in an existing SPA session without the explicit local sign-out path, a later account can encounter the previous account's local brief/draft, or reuse those values in a new request. Cross-tab session changes and session-expiry/re-login need coverage. This is browser-memory disclosure risk on a shared browser, not a demonstrated server-side history ownership bypass.
- **Minimal fix:** create an identity-scoped boundary around personal form/generation state. Retain it for same-user locale navigation, and clear/remount it when a previously resolved identity changes or signs out. Handle initial session loading deliberately so anonymous input is not discarded unintentionally. Reset stale history/account UI and invalidate pending old-identity async work before allowing it to repopulate state. Ensure older session refresh results cannot overwrite a newer identity.
- **Regression checks:** Alice -> Bob, Alice -> signed out, expired session -> re-login, overlapping refreshes and an old generation completing after identity change. Same-user language changes must preserve the brief and must not add focus/interval history polling.
- **Limit:** direct same-tab logout already clears state. The mock reproduction establishes the missing identity boundary, not a confirmed successful cross-user production session attack.

## Dependency advisories — remediation/reachability review required

`npm audit --omit=dev --json` completed successfully against the registry. The saved 19 October snapshot reports **18 affected package entries: 9 high, 9 moderate, 0 critical**. These are dependency-graph counts, not eighteen independently exploitable application endpoints. The command exits nonzero when advisories exist; that is not a failed audit request.

High-rated entries: `@hono/node-server`, `@prisma/config`, `@prisma/dev`, `deepmerge-ts`, `effect`, `hono`, `lodash`, `mysql2`, `prisma`.

Moderate entries: `@chevrotain/cst-dts-gen`, `@chevrotain/gast`, `@mrleebo/prisma-ast`, `argparse`, `baseline-browser-mapping`, `chevrotain`, `mammoth`, `sprintf-js`, `valibot`.

`npm ls --omit=dev` confirms the Neon Auth SDK dependency graph brings in Better Auth, optional adapters, Prisma tooling and MySQL packages. The application itself uses Neon HTTP queries; it does not expose Prisma Dev/Hono as its web server or configure a MySQL connection. Mammoth uses its browser entry for document parsing, whereas the reported advisory reaches it through its CLI argument-parser dependencies. These paths make runtime reachability different from simple package presence. Effect also appears through auth UI dependencies and needs its own build/runtime reachability check.

Do not run `npm audit fix --force`: the proposed Mammoth remediation includes a downgrade to 0.3.29, and forced adapter/toolchain changes can break authentication. Plan compatible SDK/package updates, inspect production traces/client chunks and rerun auth, parsing and build checks. This review did not update dependency versions or assert that all advisories are unreachable.

The raw local snapshot is `tmp/security-audit-2026-10-19.json`. Audit results change over time; rerun before release. The snapshot contains dependency/advisory metadata, not application secrets.

## Protections verified

- **33 focused tests passed** across account-token validation, account profile isolation, authentication, request-origin rejection, developer feature access, history ownership/mutations, title persistence/replay and locale payload isolation.
- History SELECT/UPDATE/DELETE operations remain bound to `user.id`; unauthorized users cannot read, append, rename, delete or settle another owner's conversation in the isolated database tests.
- Generation/account/history mutations preserve same-origin validation. Body parsing enforces content type and actual streamed size. Private API responses use `Cache-Control: no-store`.
- Gateway secrets remain server-side; upstream redirects are rejected, and user-submitted opportunity URLs are data rather than arbitrary server fetch targets in the public prompt-only flow.
- The locale-copy payload contains public strings and selected page data, not sessions, billing records or API credentials. Locale input is validated and no arbitrary filesystem import path is constructed.
- Generated output is passed to Tiptap through `textDocument()` as text nodes. Preview/export use editor-produced HTML rather than injecting raw model HTML. No new raw-AI-HTML XSS path was confirmed in this review.

## Unverified deployment items and remaining non-security work

Public-route clickjacking/CSP/referrer headers are not defined in `next.config.mjs`; platform configuration may provide them. Inspect deployed responses before treating headers as absent. Live cookie behavior, reset-token expiry/revocation, gateway throttling, deployed migrations, production telemetry and hosting rules were not audited end to end.

Missing translations, production field-performance measurements and static/CDN caching work remain as described in the existing plans. They are not security findings by themselves.

## Recommended order

1. SEC-001 analytics redaction and SEC-002 identity-scoped personal-state reset before deployment.
2. Decide the non-billing abuse-limit policy and verify gateway/edge protections for SEC-003.
3. Update vulnerable dependency paths compatibly after reachability review; rerun security tests and a production build.
4. Verify production headers/cookies and the real deployed flows. Keep the demonstrated boundaries separate from unverified infrastructure claims.
