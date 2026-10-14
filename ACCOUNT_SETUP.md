# Account and deployment setup

Authentication uses the existing Neon Managed Auth branch. The Next.js SDK proxies auth through `/api/auth/*`, so login and account requests now share the application's origin. Existing Neon user IDs and database records are retained.

## Required server variables

- `DATABASE_URL`: Neon PostgreSQL URL; use `DATABASE_URL_UNPOOLED` for migrations if configured.
- `NEON_AUTH_BASE_URL`: this branch's managed Auth URL.
- `NEON_AUTH_COOKIE_SECRET`: at least 32 random characters, private and stable across deployments. It has been generated in the local `.env.local`; add its existing value manually to Vercel. Changing it invalidates the cached cookie signature and may require users to sign in again.
- `BILLING_SITE_URL=https://ailettergen.com`: exact preferred production origin.
- `GEMINI_API_KEY`: server-only generation credential. `GEMINI_MODEL` is optional.
- NOWPayments API/IPN credentials: existing names from `.env.example`. Keep `BILLING_ENABLE_CHECKOUT=false` until launch checks are complete.

Never prefix credentials with `NEXT_PUBLIC_`. The old `VITE_NEON_AUTH_URL` is no longer used. JWKS/issuer/audience settings remain only for legacy token verification helpers; the primary Next account routes verify managed cookie sessions.

## Local checks

Run `npm run dev` and use `http://localhost:3000`. Stop the older Vite server first if it still owns this port. Neon must allow the exact local origin; `127.0.0.1` is a different origin. Production preview uses production origin validation, so for local production-preview testing set `BILLING_SITE_URL=http://localhost:3000` in that process only.

Sign up/sign in, reload a protected dashboard route, save a draft, reopen it and sign out. An anonymous nested dashboard URL must redirect to the locale's login page. `/api/account` and `/api/generate` must return 401 without a session. Profile/draft writes must reject foreign origins and cannot select another user's owner ID.

## Vercel

Use the Next.js framework preset, build command `npm run build`, and default output handling. Remove any explicit Vite/`dist` override. Add the server variables to the intended environment and redeploy the full project. No environment values or deployment were uploaded automatically.

Configure the preferred domain and required preview origins in Neon trusted origins. Test the actual hosted deployment; a successful local build does not prove live auth, database or provider availability.

## Verification result (2026-10-12)

Production compilation and 54 relevant automated checks passed. Local browser checks covered real signup/sign-in/sign-out, protected pages, cloud save/library, TXT/PDF/DOCX extraction, editor formatting/copy, Cyrillic PDF rendering and mobile navigation. Provider output was mocked for these UI checks; the disposable identity and draft were removed afterward.

The read-only Google model metadata check rejected the current local key with `API_KEY_INVALID`. Replace `GEMINI_API_KEY` with a valid credential before live generation. No paid generation was performed. Local development auth passed; hosted HTTPS auth still requires verification after deployment. A plain HTTP production preview is not a substitute for that hosted auth check.

## Cloud features

The account library supports searching, editing, deleting and reopening letters, emails and existing research notes. Profile preferences can be reused in the writing forms. Plan/balance and payment history come from durable billing storage. Original resume files are not saved. Rich-text formatting is currently transient; saved draft content is plain text.

The `app.profiles`, `app.documents` and `app.reviews` tables use verified identity and owner-scoped SQL. Neon owns its authentication tables. Existing billing customers map to the same authenticated account. No new migration is required for the App Router/UI change.

Consented reviews start pending. Moderate with `npm run reviews -- list`, then `npm run reviews -- publish UUID` or `reject UUID`. Private writing details must not be published as feedback. Public reference articles remain English where translations have not been reviewed; private screens intentionally remain concise.
