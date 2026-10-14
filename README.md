# ailettergen

Next.js App Router application for job cover letters, university applications and professional outreach emails. The existing Neon identities, cloud drafts and NOWPayments billing data are retained.

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

- `app/[locale]`: localized public pages; each page owns `page.tsx`, `loading.tsx` and `error.tsx`.
- `app/[locale]/dashboard`: protected overview, three writing workflows, cloud library, billing, profile and feedback pages.
- `components/ui`: official shadcn/ui components installed through its registry. Product compositions reuse these primitives.
- `components/dashboard` and `components/generator`: reusable sidebar, cards, form fields, resume upload and editor.
- `lib/auth`: Neon same-origin auth proxy and server identity checks. Route protection runs in `proxy.ts`, the dashboard layout, individual dashboard pages and account/generation APIs.
- `server/accounts` and `server/payments`: owner-scoped durable storage, signed payment callbacks and atomic usage reservations.
- `app/api/generate`: server-only provider calls. The browser receives output and token metadata, never provider credentials.

`app/globals.css` shares emerald/zinc tokens between the public UI and dashboard. `components/Brand.tsx` and `public/icon.svg` share the minimalist document emblem. Shadcn Sidebar, Sheet, Select, Tabs, Tooltip, Dialog, Card, Badge, Input, Textarea, Skeleton and Button handle common UI behavior.

## Writing workflow

Resume parsing is loaded only when needed: PDF through PDF.js, DOCX through Mammoth's browser build, TXT through the browser File API. Limits: 5 MB, 30 PDF pages and 12,000 extracted characters. Scanned PDFs without text require pasted background; OCR is not included. The original file is not stored. Extracted text is submitted to the writing provider only when the user generates a draft.

Each workflow accepts an opportunity URL and/or description, recipient, tone, output language and length. Pasted requirements provide more reliable context than a URL alone. URL-based generation uses optional Google Search grounding; it does not guarantee access to every source page.

The Tiptap editor supports bold, italic, lists, alignment, undo/redo, live preview and copying. PDF export opens a print view; choose **Save as PDF** in the browser's print dialog. Native browser rendering supports multilingual scripts without shipping a large font bundle. Cloud drafts store plain text and writing settings; editor formatting is not persisted between sessions.

The current configured provider is Gemini (`GEMINI_API_KEY`, optional `GEMINI_MODEL`). No GPT/Claude model is claimed to be connected. Free access allows up to three generation attempts per UTC day, with ten attempts per hour overall. Existing active paid accounts use atomic standard-letter reservations; failed paid provider calls refund reservations. Paid checkout remains disabled until launch validation. Premium generation and automatic research are not enabled by this migration.

## Billing, data and deployment

Starter $10, Plus $20 and Pro $28 retain the shared weighted allowances in `services/billingPlans.mjs`. Limits are alternative maxima from the same balance. NOWPayments invoices and signed, idempotent IPN settlement are retained. Crypto renewal remains prepaid rather than an automatic wallet debit.

Apply existing migrations with `npm run db:migrate`; inspect `DATABASE_SCHEMA.md`. Real reviews require publication consent and moderation (`npm run reviews -- list|publish UUID|reject UUID`). No invented testimonials are shown.

Vercel now uses **Next.js** and `npm run build`; clear any dashboard override pointing to `dist` or Vite. Add server environment variables yourself, then redeploy. Secrets have not been uploaded by this change. Follow `ACCOUNT_SETUP.md` for the new cookie secret. Browser drafts from older versions are not deleted or silently uploaded; the current workspace saves only through **Save to account**. Export unsaved work before refreshing.

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
