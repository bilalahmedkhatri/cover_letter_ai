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
handling should be checked alongside these deployment rules. Its app-shell
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
