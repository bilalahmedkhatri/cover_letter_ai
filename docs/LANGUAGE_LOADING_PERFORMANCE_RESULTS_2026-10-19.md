# Language loading implementation results

Date: 19 October 2026. Scope: loading/performance first, as confirmed by the user. No missing translations were added and no existing English prose, prices, claims or product availability were changed.

## Implemented

- Server selection of shared locale messages and route-specific copy through `lib/locale-data.ts` / `services/locale-data.ts`. Clients no longer import the combined main dictionaries, landing/resources/pricing dictionaries or SEO metadata helpers. Shell labels and page data are separate; landing receives only its pricing teaser and relevant resource fields.
- Public route files import their own content component. Removed the client dispatcher that referenced all public page components.
- `PageArticle` is server-only. Shared reference prose is rendered in the response instead of shipped as an article collection in client JavaScript. Existing English reference content and notices remain intact.
- Route recognition uses a small shared blog-slug registry instead of importing editorial post data into client navigation.
- Language links use Next client navigation, preserve query parameters and disable automatic prefetch of all seven language versions. Locale is supplied by the server route rather than being corrected from client state after render; direction/lang update before paint during navigation.
- Root `WorkspaceProviders` owns account/form/generation state, outside the changing locale layout. Language navigation preserves that provider lifetime and does not start another session request. No new persistent browser storage was introduced.
- Existing dynamic editor, PDF/DOCX/spreadsheet import behavior, loading boundaries, sign-out clearing, developer workflow restrictions and private caching/access behavior were retained.

## Production-mode delivery comparison

Same local production-server measurement method before and after the main architecture changes. Values below are estimated gzip sizes of JavaScript files referenced by initial HTML, rounded to decimal kB. They exclude later lazy-loaded dependencies and are not browser download durations, Core Web Vitals or production field measurements.

| Route | Before JS kB | After JS kB | Reduction |
| --- | ---: | ---: | ---: |
| `/en` | 394.2 | 321.9 | 18.3% |
| `/fr` | 394.2 | 321.9 | 18.3% |
| `/ru` | 394.2 | 321.9 | 18.3% |
| `/ar` | 394.2 | 321.9 | 18.3% |
| `/fr/features` | 395.7 | 319.1 | 19.4% |
| `/en/guides` | 395.7 | 319.1 | 19.4% |
| `/en/privacy` | 395.7 | 289.9 | 26.7% |
| `/en/blog` | 373.9 | 286.3 | 23.4% |
| `/fr/blog/write-a-tailored-cover-letter` | 395.4 | 287.7 | 27.2% |

Normalized visible main text hashes matched for all nine routes. Main content therefore stayed identical in this sample, including existing translated text and English fallbacks.

Moving text into server responses increases HTML/RSC payload size. In this sample, gzip HTML grew by about 0.2–9.2 kB per route, while initial script gzip estimates fell by about 72–108 kB. This is a transfer/parsing tradeoff, not a promise of an equivalent percentage reduction in page load time.

Snapshots were captured before the last small query-preservation and pre-paint direction improvements. The final production build includes both improvements and passed. Repeating the payload script on that final build was blocked when automatic approval review could not complete because of an account usage limit; the command was not executed. The table describes the saved earlier comparison rather than claiming a final rerun.

Reproduction command against a locally started production build:

```powershell
node scripts/measure-page-delivery.mjs http://localhost:3210 output-report.json
```

## Verification

- Final `npm run build` passed, including TypeScript. The application still reports public locale routes as dynamic; this work does not claim static generation or public CDN caching.
- Twelve focused tests passed: selected-language/page payload isolation, preservation of current copy values, locale/legacy/blog routing, sitemap/private-route exclusions, loading/error boundaries and server dashboard guards.
- Headless Edge against the final local production build passed all seven locale landing pages without browser exceptions.
- At a 390px viewport, `/en/features?check=preserve` -> French -> Arabic -> English retained the query, stayed in the same document, rendered the reference article and correct language/direction, and had no horizontal main-content overflow.
- Browser request counting confirmed language navigation did not repeat the root account session request.
- Existing form/draft contexts now live above the changing locale segment. Authenticated generation, provider output, private history and live billing were not exercised in this browser check. Unsaved attachment component state is not newly persisted across route changes.
- `git diff --check` passed (line-ending notices only).

## Remaining work

Complete missing translations using the separate translation plan. Measure real deployed cold/warm navigation and Core Web Vitals before claiming end-user speed improvements. Evaluate root request-header dependencies/static delivery and further provider/session overhead only against measured bottlenecks; do not cache authenticated content publicly.
