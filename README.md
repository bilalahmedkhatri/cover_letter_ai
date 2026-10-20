# ailettergen

Next.js App Router application for job cover letters, university applications and professional outreach emails. Neon identities, private chat history and NOWPayments billing data are used; manual Saved drafts and Share feedback submission have been removed.

## Local setup

Use Node.js 22.18+ or 24+.

```sh
npm install
npm run dev
```

Open `http://localhost:3000/en`. Copy `.env.example` to `.env.local` and configure the server variables described in `ACCOUNT_SETUP.md`. Never commit credentials.

```sh
npm run build
npm run preview
npm run test:seo
npm run test:prerender
npm run test:workflow
npm run test:accounts
npm run test:payments
npx tsc --noEmit
```

`test:prerender` now checks App Router structure and access guards; public pages are server-rendered on demand rather than emitted into Vite's `dist` folder. Browser verification is also required for redirects, metadata and interactive UI.

## Architecture

### Deferred feature updates

Professional emails, university applications and university research remain in development. Preserve their shared generators, routes, result pages and server-side developer access checks; they are intentionally absent from the main sidebar. Publish them only after an explicit release decision and end-to-end validation. Public cover-letter generation starts from **New Chat** at `/[locale]/dashboard`.

The main sidebar contains New Chat and one Chat history section. Profile/settings and plan/usage remain accessible through the profile menu. History fetches on initial load and after generation, rename or delete events; it does not poll or reload on browser focus.

- `app/[locale]`: localized public pages; each page owns `page.tsx`, `loading.tsx` and `error.tsx`.
- `app/[locale]/dashboard`: protected overview, three writing workflows, private chat history, billing and profile pages.
- `components/ui`: official shadcn/ui components installed through its registry. Product compositions reuse these primitives.
- `components/dashboard` and `components/generator`: reusable sidebar, cards, form fields, resume upload and editor.
- `lib/auth`: Neon same-origin auth proxy and server identity checks. Route protection runs in `proxy.ts`, the dashboard layout, individual dashboard pages and account/generation APIs.
- `server/accounts` and `server/payments`: owner-scoped durable storage, signed payment callbacks and atomic usage reservations.
- `app/api/generate`: server-only gateway calls. The browser receives draft text, sources, quality review and chat persistence metadata, never provider credentials or upstream request/finish metadata.

`app/globals.css` shares emerald/zinc tokens between the public UI and dashboard. `components/Brand.tsx` and `public/icon.svg` share the minimalist document emblem. Shadcn Sidebar, Sheet, Select, Tabs, Tooltip, Dialog, Card, Badge, Input, Textarea, Skeleton and Button handle common UI behavior.

## Writing workflow

Resume parsing is loaded only when needed: PDF through PDF.js, DOCX through Mammoth's browser build, TXT through the browser File API. Limits: 5 MB, 30 PDF pages and 12,000 extracted characters. Scanned PDFs without text require pasted background; OCR is not included. The original file is not stored. Extracted text is submitted to the writing provider only when the user generates a draft.

Each workflow accepts an opportunity URL and/or description, recipient, tone, output language and length. Pasted requirements provide more reliable context than a URL alone. Cover-letter generation sends a prompt only and does not request search or URL retrieval. Other workflows use the query gateway; a supplied URL does not guarantee its page was retrieved.

The Tiptap editor supports bold, italic, lists, alignment, undo/redo, live preview and copying. PDF export lazily loads html2pdf.js and downloads an A4 file directly, without a browser print dialog. It preserves the editor layout through canvas rendering, including multilingual glyphs, but the exported text is image-based rather than selectable/searchable. PDF.js remains the upload reader. Chat history stores generated plain text and writing settings; editor formatting is not persisted between sessions.

Cover letters use the external prompt-only `/api/v1/generate/` endpoint; other workflows retain `/api/v1/query/`. Both use a server-side `AI_GATEWAY_API_KEY`. Existing templates are preserved. Billing quotas and credit charges are disabled; independent abuse limits allow 10 new requests per rolling minute and two running requests per user. Apply migration `202610200001_generation_abuse_guards` before running/deploying updated generation; otherwise it fails closed without calling AI. Errors use the existing dialog. See [gateway and prompt implementation](docs/AI_ROUTING.md) for endpoint-specific limits and setup.

### Gateway configuration and response

The supplied hosted gateway address is `https://ai-api.fastapicloud.dev`. Configure the complete endpoints (availability has not yet been verified):

```dotenv
AI_GATEWAY_QUERY_URL=https://ai-api.fastapicloud.dev/api/v1/query/
AI_GATEWAY_GENERATE_URL=https://ai-api.fastapicloud.dev/api/v1/generate/
AI_GATEWAY_GENERATE_MAX_PROMPT_CHARS=32768
AI_GATEWAY_GENERATE_MAX_BODY_BYTES=524288
```

Keep the existing `AI_GATEWAY_API_KEY` server-only. Both endpoint variables require plain absolute URLs, without Markdown link syntax. Configure production variables separately in Vercel and redeploy; `.env.local` changes affect local runs only. Match prompt/body limits to the deployed gateway's settings.

| Workflow | Gateway POST endpoint | JSON request |
| --- | --- | --- |
| Cover letter | `/api/v1/generate/` | `{prompt}` |
| Professional email, university application, university research | `/api/v1/query/` | `{query,input_type:"text",search_engine:"auto"}` |

The last three workflows remain deferred and restricted to developer access. A cover-letter gateway success must provide `answer` (nonempty letter text), `request_id` and `finish_reason` (`stop` or `unknown`), and may include a separate optional `title`. The adapter returns `{text,sources:[]}` with a validated title when available; local checks and a separate AI review add `qualityReview`, with one optional repair pass. Review results do not certify factual correctness.

The app's `/api/generate` response includes `text`, `sources`, `qualityReview`, `operation`, `conversationId`, `messageId` and `historySaved`. It may include `qualityWarning` or `historyWarning` when persistence fails. Upstream `request_id` and `finish_reason` are not forwarded. New chats initially use the first 100 characters of the normalized brief. Only the first successful cover-letter response can replace that fallback with a valid AI title (up to 80 Unicode characters and seven words); missing/invalid titles leave the letter usable. Titles containing obvious contact information, URLs or HTML are ignored. The server returns a title when it was saved, and sidebar history already displays the persisted title. Manual renames, follow-up requests and review/repair calls cannot overwrite it.

Apply migration `202610190001_conversation_titles` using `npm run db:migrate` before deploying title support. It adds `title_source`, preserves existing titles as manual, and marks newly created titles as fallback. No existing chat backfill or additional title-generation AI request is performed. Database title failures preserve the generated letter and fallback title. The local migration/tests do not deploy or change the production database.

Known unresolved issue observed on 18 October 2026: stray `http://localhost:8000` text immediately after `try {` in `server/ai/providers.mjs` causes a JavaScript syntax error. The documentation update does not repair this issue. Hosted gateway connectivity and the production environment remain unverified; the Vercel connector returned 403 during inspection.

### Logout, loading and analytics

The shared logout hook clears personal form/output state and redirects to the selected locale's landing page (`/en`, `/ru`, etc.). Dashboard and account logout actions share this behavior.

During generation, the shared generator displays a fixed, localized status notification with the existing Spinner. It remains visible while awaiting/opening the result and clears on success or error. It supports all seven interface languages and announces status accessibly without invented progress percentages or time estimates. Mocked browser checks cover desktop/mobile placement and success/error cleanup.

Marketing pages use route `loading.tsx` boundaries with the shared `PageLoading` Spinner; the landing page inherits the locale boundary. Prefetched/cached pages can navigate without showing the loading fallback.

`app/layout.tsx` mounts `<Analytics />` from `@vercel/analytics/next` once for all routes. Enable Web Analytics for the Vercel project and deploy to activate hosted collection. Analytics import/TSX checks passed; live collection has not been verified.

Environment cleanup removed unused `VITE_NEON_AUTH_URL` from the local file and example template. Current auth uses `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET`; legacy JWT helpers retain `NEON_AUTH_JWKS_URL`, `NEON_AUTH_ISSUER` and `NEON_AUTH_AUDIENCE`. The issuer/audience values differ from the base URL and must not be removed as duplicate settings.

## Billing, data and deployment

Starter $10, Plus $20 and Pro $28 retain the shared weighted allowances in `services/billingPlans.mjs`. Limits are alternative maxima from the same balance. NOWPayments invoices and signed, idempotent IPN settlement are retained. Crypto renewal remains prepaid rather than an automatic wallet debit.

Apply existing migrations with `npm run db:migrate`; inspect `DATABASE_SCHEMA.md`. Real reviews require publication consent and moderation (`npm run reviews -- list|publish UUID|reject UUID`). No invented testimonials are shown.

Vercel now uses **Next.js** and `npm run build`; clear any dashboard override pointing to `dist` or Vite. Add server environment variables yourself, then redeploy. Secrets have not been uploaded by this change. Follow `ACCOUNT_SETUP.md` for the new cookie secret. Browser drafts from older versions are not deleted or silently uploaded; new requests and generated responses are saved automatically to private chat history. Export editor changes before refreshing.

Public routes retain locale-prefixed URLs, canonical metadata, language alternates and contextual links. `/sitemap.xml` lists public pages only; private account/dashboard pages are noindex. Root and legacy redirects live in `next.config.mjs`. Check www/HTTPS, API availability and auth trusted origins on the hosted deployment after redeploying.

Research and earlier product/cost evaluations remain under `research/`, `PRODUCT_REDESIGN_RESEARCH_2026-10-11.md` and the existing billing documentation. Browser AI-flow checks use mocked provider output; they do not establish live model quality or actual provider cost.

## Blog pages

`/[locale]/blog` lists three writing guides; `/[locale]/blog/[slug]` renders
each article with the existing `PageArticle` template. Listing pages reuse
the installed Card, Badge and Button components, typography and responsive
grid styles. Both page folders reuse PageLoading and PageError.
Titles, excerpts, section IDs and workflow destinations live in
`services/blogContent.mjs`; detailed prose is reused from `pageArticles.mjs`.
Add another post there with a unique slug and valid existing section IDs.
Articles currently have English bodies and show a notice on other locales.
Their canonical URLs and sitemap entries point to English; the blog index
has localized navigation and introductions. No CMS or invented authors,
publication dates or reviews are added.

## Language loading and performance

Public routes render their own content component and the server-rendered `PageArticle` reference. `lib/locale-data.ts` selects the current language's shared labels and the current page's copy before passing data to client components; combined locale dictionaries are not client imports. Keep static copy selection in this server entry point. `services/blogRoutes.mjs` contains the route identifiers without importing editorial data into navigation.

Language switching uses Next navigation, retains query parameters and disables prefetching all language variants. Root `WorkspaceProviders` preserves account/form/generation context across locale navigation; a document reload still resets browser-only state. Auth and history access checks remain server enforced. Existing missing translations and English fallback notices remain unchanged.

Run `npm run test:locale-delivery`, `npm run test:seo`, `npm run test:prerender` and `npm run build` for focused checks. See [implementation measurements](docs/LANGUAGE_LOADING_PERFORMANCE_RESULTS_2026-10-19.md) and [the delivery plan](docs/LANGUAGE_LOADING_PERFORMANCE_PLAN_2026-10-19.md). Production field timings and CDN/static delivery have not been established.

Dashboard headings, cover-letter placeholder, language/workflow display labels, sidebar/account menu, credits and account/billing labels follow the URL locale in all seven interface languages. `services/dashboardCopy.ts` is selected by the server dashboard layout and passed through the existing page-copy provider; public pages receive none of this copy. Language/tone values and payment-status codes remain unchanged in requests and storage. Saved chat titles and existing briefs are not translated or replaced by a locale change. Paid plan names remain product names. Local browser checks use mocked account/history data; live billing/provider behavior is not established by these checks.

## Dependency check

Prisma was updated compatibly to 7.10.1 and its dependency tree refreshed; browser-mapping data was patched. The 20 October production audit fell from 18 affected entries (nine high) to three moderate entries: Mammoth and its CLI-only argparse/sprintf-js chain. The app uses `mammoth/mammoth.browser` with `extractRawText`, not that CLI chain. No clean-audit claim is made; do not force the suggested Mammoth downgrade or mismatched auth dependency versions merely to suppress it. The existing Neon Auth UI dependency tree still emits optional peer warnings; the installed Next Auth SDK version was retained and its session-store initialization was browser-checked with mock session responses.

## Security fixes (20 October 2026)

`PrivateAnalytics` strips all query parameters/fragments before page telemetry. Identity-scoped root state preserves same-user locale navigation while clearing former-user briefs/drafts on account changes and SDK logout notifications; stale refresh responses and old-provider state callbacks cannot repopulate a new identity's workspace. Initial anonymous input is retained on first sign-in. Server-side history ownership remains authoritative.

Global response headers disable framing and MIME sniffing and send only origin referrers. The limited CSP restricts framing, objects and base URLs while preserving Next scripts, auth popups and export functionality; it is not a complete script CSP. This site can no longer be embedded in an iframe. Run `npm run test:security`, `npm run db:validate` and `npm run build`. See [security review/remediation status](security_best_practices_report.md). Local isolated checks do not verify production migration state, real account sessions, provider costs or hosted header overrides.

Persistent sidebar chat history automatically saves prompts and responses and restores each workflow through its result URL. See [history implementation](docs/RESULTS_AND_HISTORY_PLAN.md).
