<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product release and sidebar conventions

- Reuse existing components/helpers and preserve structure; prefer the smallest effective change.
- Professional email, university application and university research are deferred feature updates. Preserve their implementation and server-enforced developer access; do not expose them publicly or add sidebar entries without an explicit release request.
- Cover-letter input uses New Chat on `/[locale]/dashboard`; keep the shared generator and cover-letter result/history routes.
- Starter templates follow the page locale on entry or page-language changes. An explicit Output language change overrides their language until the next page-language change. Never overwrite the existing brief when either language changes.
- Sidebar uses one Chat history heading with the existing Spinner for fetches. Do not add interval/focus refetching; refresh after generation/history mutations. Keep profile/settings and billing in the profile menu rather than the main navigation.

## Implemented integration conventions (18 October 2026)

- Dashboard static copy is selected server-side by the dashboard layout from `services/dashboardCopy.ts` for all seven interface locales. Keep it out of public page payloads and client dictionary imports. Translate display labels only: preserve gateway/profile language and tone values, payment status codes, existing briefs, saved chat titles and paid plan product names. Account content must use the current locale and Arabic RTL direction.

- Shared `useSignOut` clears personal form/output state, refreshes account state and redirects to the current locale's landing page (`/[locale]`). Preserve the explicit empty JSON sign-out body.
- The shared generator shows a localized fixed status notification while generating or opening a result, using the existing Spinner. Keep it visible on mobile, clear it on completion/error, and do not invent progress percentages, stages or completion times.
- Marketing routes reuse `PageLoading` and the shared Spinner through route loading boundaries; the landing page inherits `app/[locale]/loading.tsx`. Cached/prefetched navigation may not display the fallback.
- Locale/page copy is selected on the server via `lib/locale-data.ts`; client components receive only the selected shell/page data. Keep combined dictionaries and `PageArticle` reference prose out of client imports. Each public route imports its own content component. Language links use client navigation with bulk prefetch disabled and retain query parameters. Account/form/generation providers stay in the root `WorkspaceProviders` so locale navigation does not reset personal state or repeat session startup. This does not persist drafts across document refreshes or establish static/CDN caching.
- Vercel Analytics is mounted once in `app/layout.tsx` using `@vercel/analytics/next`. Production collection requires Web Analytics enabled in Vercel and deployment; do not claim it is live-verified.
- Analytics runs through `PrivateAnalytics` and `redactAnalyticsEvent`: strip every URL query string/fragment before telemetry without changing the browser's auth/reset URL. Root personal state is keyed by an identity scope: preserve same-user locale changes and first anonymous sign-in, reset after authenticated identity changes/logout, ignore stale session refreshes, and subscribe to SDK session notifications. Do not replace this with interval/focus history polling.
- Apply migration `202610200001_generation_abuse_guards` before running/deploying updated generation. The guarded database entrypoints atomically enforce 10 new requests per sliding minute and two running requests per user, independently of billing. Replay consumes no extra allowance; chat deletion cannot reset counters/leases; failures/completion release a slot and crashes expire after five minutes. Missing migration must fail closed. Preserve the 429 message and `Retry-After` header.
- Cover letters call the gateway's `/api/v1/generate/` endpoint with `{prompt}`. Deferred email, university application and research workflows retain `/api/v1/query/` with `{query,input_type:'text',search_engine:'auto'}`. Preserve developer access restrictions.
- Configure complete server-only `AI_GATEWAY_GENERATE_URL` and `AI_GATEWAY_QUERY_URL` endpoint URLs, not just the host. The supplied gateway host is `https://ai-api.fastapicloud.dev`; its availability has not been verified. Keep `AI_GATEWAY_API_KEY` private. Local env edits do not configure Vercel Production.
- The cover-letter gateway response contract is `{answer,title?,request_id,finish_reason}` with `finish_reason` limited to `stop` or `unknown`. The app normalizes this to text/sources, adds quality review and chat persistence metadata, and does not expose upstream request/finish metadata. Optional titles are validated independently; missing/invalid title metadata never fails a letter.
- New chats start with the first 100 characters of the normalized brief as a fallback. Only the first successful cover-letter response may replace it with a valid AI title (maximum 80 Unicode characters and seven words). `title_source` protects manual renames; migrated existing chats keep their titles. Review/repair titles and follow-up titles must never overwrite the initial/manual title. Sidebar uses the existing history refresh, with no polling added. Apply migration `202610190001_conversation_titles` before deploying this integration.
- `VITE_NEON_AUTH_URL` was removed as unused. Keep `NEON_AUTH_BASE_URL`, cookie secret, and the existing JWKS/issuer/audience settings; issuer/audience differ from the base URL. Do not remove them as duplicates.

The stray `http://localhost:8000` text after `try {` in `server/ai/providers.mjs` was removed on 19 October 2026. Keep gateway endpoint URLs in server environment configuration, not pasted into executable code. Syntax and mocked gateway checks do not establish live provider availability.
