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
- `app/api/generate`: server-only provider calls. The browser receives output and token metadata, never provider credentials.

`app/globals.css` shares emerald/zinc tokens between the public UI and dashboard. `components/Brand.tsx` and `public/icon.svg` share the minimalist document emblem. Shadcn Sidebar, Sheet, Select, Tabs, Tooltip, Dialog, Card, Badge, Input, Textarea, Skeleton and Button handle common UI behavior.

## Writing workflow

Resume parsing is loaded only when needed: PDF through PDF.js, DOCX through Mammoth's browser build, TXT through the browser File API. Limits: 5 MB, 30 PDF pages and 12,000 extracted characters. Scanned PDFs without text require pasted background; OCR is not included. The original file is not stored. Extracted text is submitted to the writing provider only when the user generates a draft.

Each workflow accepts an opportunity URL and/or description, recipient, tone, output language and length. Pasted requirements provide more reliable context than a URL alone. URL-based generation uses optional Google Search grounding; it does not guarantee access to every source page.

The Tiptap editor supports bold, italic, lists, alignment, undo/redo, live preview and copying. PDF export lazily loads html2pdf.js and downloads an A4 file directly, without a browser print dialog. It preserves the editor layout through canvas rendering, including multilingual glyphs, but the exported text is image-based rather than selectable/searchable. PDF.js remains the upload reader. Chat history stores generated plain text and writing settings; editor formatting is not persisted between sessions.

Cover letters use the external prompt-only `/api/v1/generate/` endpoint; other workflows retain `/api/v1/query/`. Both use a server-side `AI_GATEWAY_API_KEY`. Existing templates are preserved. Generation quota and credit charges are disabled; authentication and validation remain. Errors use the existing dialog. See [gateway and prompt implementation](docs/AI_ROUTING.md) for endpoint-specific limits and setup.

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

## Dependency check

The official Neon SDK includes auth UI/adapter dependencies that pull Prisma CLI tooling into npm's production audit through optional peers. Current advisories include that tooling and Mammoth's CLI-only argument parser; this app uses Neon HTTP queries and Mammoth's browser build. No claim of a clean dependency audit is made. Review upstream fixes before production launch; do not force a Prisma downgrade or mismatched auth dependency versions merely to suppress the audit.

Persistent sidebar chat history automatically saves prompts and responses and restores each workflow through its result URL. See [history implementation](docs/RESULTS_AND_HISTORY_PLAN.md).
