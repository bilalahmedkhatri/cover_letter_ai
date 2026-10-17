# Component architecture review — 2026-10-15

Scope: current local source, particularly the blog and shared UI composition.
This is not a production audit, security certification or performance benchmark.

## Changes from this review

The listing and related-guide pages previously composed their cards separately.
Both now call `ContentCard` in `components/ui/content-card.tsx`:

- `default`: existing bordered listing with category badge, description and CTA.
- `editorial`: existing screenshot-style media area, category, title and reading time.

The component composes the installed Card, Badge and Button primitives and Next
Link. It has no blog imports, locale lookup, data fetching or client state.
It can render resources or other linked content, with optional media/metadata.
The whole card is a single link; interactive controls must not be nested in it.

## Blog review

| Concern | Current implementation | Assessment |
| --- | --- | --- |
| Site chrome | Locale layout → AppProviders → SiteShell → Header/Footer | Reused |
| Blog container | `app/[locale]/blog/layout.tsx` | One shared main container |
| Listing cards | Blog listing → `ContentCard` default | Reused base composition |
| Related cards | Article route → `ContentCard` editorial | Reused base composition |
| Article body and contents navigation | `components/PageArticle.tsx` | Reused template |
| Loading / errors | Both page folders re-export PageLoading / PageError | Reused |
| Post metadata | `services/blogContent.mjs` | Central data |
| Article prose and section selection | `services/pageArticles.mjs` | Central data and helper |
| Reading-time estimate | `articleReadingMinutes()` in pageArticles | Removed from inline JSX |
| URL construction and language switching | `services/routing.ts` | Shared |
| Canonical metadata / sitemap | `services/seo.ts`, `lib/page-metadata.ts`, `app/sitemap.ts` | Shared |
| Missing article | notFound plus proxy handling | Existing behavior preserved |

The route files still declare their page header and responsive grid classes.
These short semantic containers do not justify additional wrapper components.
Routes validate params, choose data and compose existing UI; they should not
reimplement a card or article renderer.

## Repository patterns suitable for reuse elsewhere

- Next.js App Router with route-local loading/error boundaries and a shared shell.
- shadcn/Radix primitives in `components/ui`, theme tokens in `app/globals.css`
  and `tailwind.config.cjs`, and `cn` in `lib/utils.ts`.
- Shared workflow configuration in `services/workflow.mjs`; one Generator UI for
  cover letters, university applications and professional emails.
- Backend auth checks in `lib/auth/access.ts` and server API routes; UI visibility
  is not authorization. Neon Auth and PostgreSQL back account data here.
- Server-side AI requests, payment/IPN validation and metering are distinct from
  presentation. Their credentials, customer identities and configuration must
  never be copied into another project as part of a UI migration.
- Locale-aware navigation, honest language notices and canonical destinations.

## Limits and follow-up opportunities

- Article prose remains English; translated navigation is not a translated article.
- Some blog prose is intentionally reused from existing reference guides. This
  work does not claim newly researched articles or improved search rankings.
- `PageArticle` is a Client Component because it reads locale context. It also
  imports the shared reference catalogue. A future measured bundle optimization
  could pass only selected content and locale from server routes; it is not
  necessary for this card extraction.
- Content is checked-in module data, not a CMS. There are no verified authors,
  publication dates or article images to fabricate.
- JSX route compositions are TypeScript; some content/helper modules remain
  `.mjs`. A typed content contract may help if the catalogue grows.
- Do not expand this UI task into auth, billing, schema or framework rewrites.

See `REUSABLE_PROJECT_PROMPT.md` for the portable implementation prompt.

## Verification for this change

TypeScript, production build, five routing tests and three structure tests passed.
All three article section selections were compared with the previous selection
and retained their content/order. Browser checks passed for three listing cards,
two related cards, keyboard Enter navigation, article-to-article navigation,
heading levels, no nested links/buttons, 390px mobile layout and Arabic RTL with
English article headings correctly LTR. No browser page errors were observed.
No hosted deployment or live AI/payment transaction was performed.
