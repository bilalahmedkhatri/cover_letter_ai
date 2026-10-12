<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1RpktAWM9KZdJWKxUiSmDK7kf8o0fbR-s

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Canonical routes and deployment checks

English public pages use `/en`, `/en/dashboard`, `/en/about`, `/en/privacy`,
and `/en/terms`. The seven supported languages keep their own prefixes.
Legacy unprefixed pages resolve to English even when the browser has a different
language preference. All internal links and sitemap entries use localized paths.

`vercel.json` adds permanent (308) redirects from `/` and the legacy pages,
plus hostname-scoped redirects from `www.ailettergen.com`. Vercel's HTTPS
handling should be checked alongside these deployment rules. Its generated-page
rewrites cover only supported language/page combinations, leaving static files
and unknown paths to normal hosting behavior.

Validation commands (Node.js 22.18+ or 24+ for native TypeScript stripping):

```sh
npm run test:seo
npx tsc --noEmit
npm run build
```

Vite dev/preview does not execute Vercel redirects. After deployment, verify:

- `/` returns a permanent redirect to `/en`, which returns 200.
- `/dashboard?ref=test` redirects to `/en/dashboard?ref=test`.
- `www` and HTTP aliases reach the preferred HTTPS host without a loop.
- `/ru` and `/ru/dashboard` keep their language and return 200.
- `/en/` redirects to `/en`, with no trailing slash in its canonical.
- `/robots.txt`, `/sitemap.xml`, and built JS/CSS return their correct content types.
- Unknown URLs and missing assets return HTTP 404.
- Rendered canonicals and language alternates match the sitemap URLs.

Then submit `https://ailettergen.com/sitemap.xml` in Search Console and check
the English and Russian homepage canonicals after Google recrawls them.

## Public HTML and metadata

`npm run build` now builds the Vite client, then renders the existing React app
for all 35 public URLs using Vite's SSR module loader. Generated pages live at
`dist/<locale>/index.html` and `dist/<locale>/<page>/index.html`; Vercel rewrites
serve those files under the existing canonical URLs. No runtime SSR server or
additional dependency is required. Deploy the complete `dist` directory.

The client hydrates this markup. Public text, links, metadata and theme styles
are present before JavaScript loads. Generating/editing letters still requires
JavaScript. FAQs use native details/summary and work without JavaScript.
`services/seo.ts` is the shared source for build-time and client metadata.

About pages use translated product information. Privacy/terms preserve the
original English policy text, label its language explicitly and omit hreflang
claims until complete policy translations are reviewed. The automatically
changing policy dates and unverified testimonial section were removed.
The absent `og-image.png` reference was removed; a branded raster social image
can be added with the redesign.

Run `npm run build`, `npm run test:prerender`, `npm run test:seo` and
`npx tsc --noEmit`. After deployment inspect the raw HTML of `/en`, `/ru`,
`/ru/dashboard` and `/ar/about`, checking content, canonical, description,
lang/dir and response status. Reconfirm the existing redirects and unknown-URL
404 status on Vercel; Vite preview does not execute hosting redirect rules.

## Interface and commercial planning

The interface uses the shared controls in `components/ui`, Radix dropdown/tabs
and Lucide icons. Public copy is localized in `services/interfaceCopy.ts`.
AI SDKs load dynamically when generation/import is requested. Existing providers
are retained; the redesign does not activate billing or change AI models.

The current provider/pricing proposal lives in
`research/SUBSCRIPTION_PLANS_2026-10-11.md` ($10/$20/$28; Luna/Opus).
The earlier proposal is retained as a historical report. Open the self-contained
`research/cost-calculator.html` to change prices, token assumptions, free trials,
fees, infrastructure and labor costs. These are planning estimates, not invoices.
Regenerate it and its JSON/CSV scenarios with `node scripts/build-research.mjs`;
verify the arithmetic with
`node --test --test-isolation=none tests/cost-model.test.mjs`.
Synthetic multilingual fixtures and unrun reviewer sheets live in
`research/evaluation`; regenerate with `node scripts/build-evaluation-fixtures.mjs`.
No paid-provider quality benchmark has been performed.

## Payments and database

NOWPayments hosted invoices, signed callbacks and atomic Neon PostgreSQL credit
allocation are implemented. See [PAYMENTS_SETUP.md](PAYMENTS_SETUP.md) for endpoint
and deployment configuration, and [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for
the nine created billing tables and the next feature tables.

Run `npm run test:payments` for payment/security and PostgreSQL function tests.
Keep checkout disabled until authenticated server-side AI usage is implemented.

Pricing is a dedicated page at `/en/pricing` and `/ru/pricing`, with plan cards,
feature comparison, shared-credit examples and renewal FAQs. Other locale routes
show an explicit notice before English plan details. Header/footer navigation,
Vercel redirects, prerendering and the sitemap include pricing. The generator
shows payment/access status and links to pricing instead of repeating plan cards.

The latest limits and consumption weights are documented in [PLAN_USAGE.md](PLAN_USAGE.md).
The allowance migration adds `usage_allocations` and `generation_reservations`;
there are now eleven billing tables. The server metering wrapper is implemented
and tested, but the existing client AI generator must still be moved onto it.
The landing page includes localized use cases, writing tools, preparation and
review guidance in all seven locales. Pricing omits raw units and payment/access
comparison rows.

Public resources now include `/features`, `/guides` and `/compare` (localized routes).
English and Russian bodies are complete; other locales show a language notice.
The comparison cites official Rezi/Teal prices verified October 12, 2026 and distinguishes planned pricing, free options and product scope.
Draft review runs locally with Unicode word counts, optional length targets and common placeholder warnings. Guides can preload writing instructions; users can download TXT and multi-page PDF.
Run `node --test --test-isolation=none tests/draft-review.test.mjs` for writing checks.

Vercel must use the committed `vercel.json` build command (`npm run build`).
A bare `vite build` skips prerendering and leaves localized rewrite destinations missing, returning platform 404s. The configured output directory is `dist`.
