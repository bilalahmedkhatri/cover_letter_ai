# Language loading and page performance plan

Status: proposed design, 19 October 2026. No application changes or measured speed improvements yet. Companion to `TRANSLATION_PLAN_2026-10-19.md`.

Implementation update: the user selected loading/performance first. Server-selected locale/page payloads, server-rendered reference prose, route-specific component imports and client language navigation are implemented. See [results and verification limits](./LANGUAGE_LOADING_PERFORMANCE_RESULTS_2026-10-19.md). Missing translations remain a separate next phase; cache/static delivery and production field timing goals below are not claims of completed optimization.

## Core decision

Load the requested page in the URL's language on its first response. Keep translation lookup on the server for static content; send interactive components only their required strings. Do not load all seven languages, every page's dictionary or every reference article into the browser to display one page. Translate existing content faithfully; performance work must preserve all content and functionality.

Prepare this structure while translating, then optimize and measure after complete language versions are available. Avoid first expanding the existing all-locales client dictionaries and only later splitting them.

## Current source findings, not measured bottlenecks

- `LocaleContext.tsx` imports the combined `translations.ts`. Core landing, pricing and resource helpers also hold multiple locales in the same imported modules. Client imports can bring unused language data into browser bundles; verify actual emitted chunks before assigning byte savings.
- `PublicPage.tsx` is a client dispatcher with dynamic page imports, and `PageArticle.tsx` imports the shared English reference collection. Dynamic component imports alone do not establish page/locale dictionary isolation.
- `AppProviders.tsx` mounts account, form and generation providers for every localized route. `AccountProvider` performs a session request on mount. Public landing interactions currently consume form state, so moving providers requires preserving that handoff rather than simply deleting them.
- `LanguageSelector.tsx` uses ordinary anchors, which cause document navigation. Client navigation can improve switching, but correct initial translations and preserving user state must be verified first.
- Root layout reads request headers for `x-site-locale`. Static-generation/cache eligibility needs inspection against the installed Next.js version and production build; adding `generateStaticParams` alone is not proof of static delivery.
- No production bundle, waterfall or field-performance baseline was captured for this plan. These findings identify experiments, not confirmed rankings of slowdown causes.

## When content should load

| User action | Load | Avoid |
| --- | --- | --- |
| Open `/fr/features` directly | French common shell, French features content and its referenced sections; page metadata in French | Other languages, unrelated article content, editor/PDF libraries |
| Open any translated public page | Server-rendered complete main text in that locale; small interactive islands | Empty shell followed by a separate browser translation fetch |
| Open language menu | Existing short list of seven language names | Downloading all dictionaries or rendering all page versions |
| Choose another language | That locale's version of the same page; accessible pending feedback only while necessary | English flash, briefly mixing old text with a new language indicator, blank screen |
| Navigate within the same language | Reuse shared layout/common messages and fetch the destination content | Unrelated route preloads and repeated session requests caused by unnecessary remounts |
| Open dashboard | Authorized account/history data and current locale's dashboard interface | Public article collections or all locale dictionaries |
| Change Output language | Required template copy for the selected supported output language | Changing page language, clearing the brief or translating saved/generated content |
| Open result/editor | Current result and editor functionality | Loading editor dependencies on landing/login pages |
| Select upload/export | Required parser/export library when the operation needs it; visible local pending state | Preloading PDF/DOCX/spreadsheet tools on every page |

## Architecture and delivery

1. Preserve existing `[locale]` URLs. Use validated route params as the initial language source; localStorage may remember preference but must not override an explicit URL. Preserve the existing `/` redirect to `/en` unless separately approved. No geolocation or automatic country redirect is required.
2. Split copy by locale and useful page/feature groups: common shell, landing, resources, pricing, legal, blog and dashboard. Use an explicit server-side import map. A selected dictionary can still contain unnecessary data: return only the sections/modules required by the current route.
3. Render static marketing/legal/blog prose in Server Components. Keep menus, account controls, templates and other actual interactions as small Client Components. Pass only their localized messages; do not serialize the complete locale dictionary into a root provider. Preserve existing components and markup where possible.
4. Keep the shared reference-module IDs and translate each module once, but select only the current page/article's modules for delivery. Shared source reuse must not mean every article is included in each client chunk.
5. Give interactive copy a consistent loading strategy: first render receives its messages from the server; subsequent route navigation receives destination messages with that route response. Avoid a serial browser waterfall of page -> locale detector -> dictionary request -> content render.
6. Use framework navigation for eligible internal links and language switching after state-preservation checks. Prefetch likely destinations selectively, on visible links or user intent as appropriate. Do not explicitly preload all seven language versions. Keep URL, text, metadata and RTL direction synchronized when navigation commits.
7. Preserve current form/provider lifetime where required, especially template selection and unsaved briefs. Reduce or defer marketing-page account/generation work only after identifying its actual consumers; keep necessary account display/sign-in behavior correct. A client provider around server-rendered children does not by itself turn those children into client code: inspect actual imports rather than moving providers blindly.

## Cache policy

- Static translated marketing/legal/blog content: aim for build-time/static or appropriately cached public delivery, keyed by path/locale and current content version. Verify build output and headers before claiming CDN cacheability.
- Prefer deriving document language from validated route params in a supported layout structure. Evaluate the current root `headers()` dependency and its rendering consequences before changing the root layout. Preserve 404 handling, redirects and initial HTML language/direction.
- Dynamic public customer reviews: cache separately where appropriate, with a defined invalidation policy for approved changes. Do not let this small section unnecessarily block first display of static prose. Reserve layout space so arrival does not shift the page.
- Authenticated sessions, account balances, billing, history and generated drafts: preserve private access and freshness. Never place user-specific responses in a shared public cache.
- Reuse hashed static assets through normal framework caching. Do not invent a second localStorage translation cache without evidence it is needed. Publishing a translation must invalidate/rebuild the corresponding public content; users must not see stale mixed versions.

## Loading experience

- Keep existing localized loading boundaries and shared Spinner. Show fallback only for real pending work; no artificial minimum loading duration.
- First screen: prioritize heading, useful copy and primary action. Keep the complete static article text in server output rather than hiding it behind scroll-triggered translation requests.
- Use skeletons matching expected layout for delayed dynamic sections where appropriate. Avoid layout movement when reviews/account state arrive.
- A language switch should retain the same page and supported query context. If it fails, retain usable current content and provide a localized retry. Never overwrite the brief. Templates retain the agreed page-language/output-language behavior.
- Translation lookup, navigation, uploads and AI generation have different latency sources. Keep the existing generation notification; smaller bundles do not guarantee a faster model response.

## Execution and measurement order

1. Capture a production-mode baseline before performance edits: landing, pricing, features, one long guide/blog article, login, dashboard and result. Cover direct entry, warm navigation, language switch and mobile conditions. Record route locale, test conditions and multiple runs.
2. During translation work, introduce page/locale data boundaries and stable server loaders without changing English text. Compare bundle outputs to prove unused locale data is absent, rather than assuming an import pattern achieved it.
3. Move static text rendering out of the client dispatcher in small route batches. Verify metadata, hydration, content parity, layout and interactions at each step.
4. Inspect root request dependencies/static delivery, provider/session overhead and link navigation. Fix measured problems while preserving auth, profile state and brief handoff.
5. Confirm parser/editor/export dependencies load only where used. Optimize images/fonts/scripts only when the waterfall or bundle report shows an actual issue; do not add speculative infrastructure.
6. Repeat the same production-mode measurements. Review cold/warm cache, transferred/compressed JS, dictionary/route payload size, request waterfalls, long tasks and server response time. A single development Lighthouse score is not evidence of production performance.
7. After deployment, verify real navigation and collect field data by route/locale where available. Vercel Analytics page visits do not by themselves establish Core Web Vitals monitoring; choose available browser/field tooling separately. Avoid adding paid services automatically.

## Success criteria

- Main translated text is present in the first HTML/server response; no wrong-language flash.
- Browser delivery contains only required current-locale interface messages and current page content. No unrelated full dictionaries/article collections.
- No new duplicate dictionary fetch, session request loop or history polling.
- Existing content, canonical/alternate behavior, auth isolation, unsaved briefs, templates and output-language choices remain correct.
- Use standard field targets at the 75th percentile: LCP <= 2.5 seconds, INP <= 200 milliseconds and CLS <= 0.1. These are goals, not current measurements or guarantees.
- Set route JS/payload budgets and language-switch timing budgets after the baseline; show before/after results under the same conditions instead of promising an arbitrary percentage improvement.

## References

- Installed Next.js guides: `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`, server/client component, caching and prefetching guides. Read the relevant installed guide again before implementing version-sensitive changes.
- [Next.js internationalization](https://nextjs.org/docs/app/guides/internationalization): server dictionary loading and localized rendering.
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components): keeping client boundaries and JavaScript small.
- [Web Vitals](https://web.dev/articles/vitals): field targets and measurement.
