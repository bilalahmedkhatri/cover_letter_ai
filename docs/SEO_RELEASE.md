# SEO delivery and production configuration

## Implemented

- Existing metadata titles/descriptions and future product scope are preserved.
- `/opengraph-image` generates a 1200×630 PNG using the existing AILG icon, with business letters, professional emails, university applications and university research. Page metadata includes Open Graph images and Twitter large-image cards.
- `/llms.txt` uses the same canonical URL list as the sitemap and derives public/planned workflow names from the existing release list. It contains no account/API/conversation URLs or developer identities.
- English-only privacy/terms/blog article aliases canonicalize to English. Pricing/features/guides/compare fallback languages canonicalize to English while reviewed English/Russian versions remain separate. Their duplicate language aliases are omitted from the sitemap, leaving 34 canonical public URLs at this revision. Existing translated home/about/blog-listing pages remain available. No translations are fabricated.
- Blog reading links point to English article canonicals. Article generation CTAs use the existing server-side workflow permissions, so ordinary users do not see links into unavailable workflows.
- Missing server-auth configuration redirects dashboard visitors to a safe login availability message instead of throwing the production proxy error. Authentication remains required; no configuration failure grants dashboard access. Auth APIs report unavailable/unauthenticated responses.

## Confirmed live cause

Vercel production logs reported `Server authentication is not configured.` for `/en/dashboard`. CLI environment-name inspection found only the old `GEMINI_API_KEY`. No secret values were retrieved or uploaded. The live deployment was older than the checked working tree.

Project: `cover-letter-ai`, `prj_Ifp7rJd8P5wrHfVOA8jjzBPpDuqD`, team `team_uIjCUj9izmOtoo1rZbLEtcQK`. Repository `vercel.json` already selects Next.js and `npm run build`; the project dashboard still reports a legacy Vite preset/build command. Align the dashboard settings to Next.js / `npm run build` when releasing.

## Required before functional production release

The user previously chose to add Vercel environment variables personally. That instruction remains in effect.

- Add existing `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` and `DATABASE_URL` to Production; use the stable existing cookie secret. No public prefixes.
- Set `BILLING_SITE_URL=https://ailettergen.com` and ensure Neon trusted origins permit the production site.
- For generation, configure `AI_GATEWAY_API_KEY` and publicly reachable HTTPS `AI_GATEWAY_QUERY_URL` / `AI_GATEWAY_GENERATE_URL` as appropriate to the current routing. `localhost:8000` refers to the deployment container, not the developer's computer. Never upload a guessed URL.
- Keep checkout disabled until payment launch checks are complete. This task does not change payment activation or plan prices.
- Build/deploy the reviewed current source, then verify real HTTPS login, ordinary/developer access, generation and the public crawl URLs. Safe fallback behavior is not proof that missing authentication has been configured.

The Vercel connector returned 403; the CLI's existing scoped credentials successfully retrieved project configuration, runtime errors and environment variable names. No deployment, project-setting mutation or environment upload is part of the completed local changes until the release configuration is resolved.

## Verification

- Full automated suite: 129 passed outside the restricted network sandbox. Final SEO/routing repeat: 9 passed. Production build passed.
- Isolated built server on port 3004 with auth variables explicitly empty: English/Russian dashboard requests redirect 307 to localized login availability pages; account/history return 401; login returns 200.
- Actual HTTP responses: llms.txt and robots.txt return 200; sitemap contains 34 canonical URLs; unknown paths return 404. Spanish feature and Russian privacy aliases canonicalize to English; Russian features retain their canonical.
- Open Graph/Twitter tags were confirmed in server HTML. Social image returns PNG, 1200×630, HTTP 200 and was visually reviewed. Evidence is under `output/seo-audit-live/`.
- These are local production-mode results, not confirmation of a new live deployment or functional production login.
