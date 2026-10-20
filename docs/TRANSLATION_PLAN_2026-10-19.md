# Existing-content translation plan

Date: 19 October 2026. Status: source audit and proposed implementation only.

Companion delivery plan: [Language loading and page performance](./LANGUAGE_LOADING_PERFORMANCE_PLAN_2026-10-19.md). Prepare page/locale dictionary boundaries during translation work, then validate and optimize delivery against a production-mode baseline.

## Scope and content boundary

Create complete language versions of existing content. Do not rewrite, shorten, expand, optimize keywords, change claims, change prices/allowances, or change product availability. Preserve the existing English text exactly, including when extracting it into dictionaries. Keep existing translated text; fill gaps rather than replacing translations indiscriminately. Any apparent source-content issue belongs in a separate future task.

Existing interface locales: English (`en`), Russian (`ru`), Spanish (`es`), French (`fr`), Portuguese (`pt`), Dutch (`nl`), Arabic (`ar`). Complete existing routes rather than adding separate component trees or regional routes. Prioritize RU/FR/PT/ES, then complete NL/AR. Keep the current single Portuguese locale; this task does not introduce `pt-BR`/`pt-PT` URLs.

The audit below describes the local source, not a verified production deployment. A translated heading or URL is not evidence that the entire page is translated. Translation quality requires language review in addition to code checks.

## Verified coverage and work remaining

| Surface | Existing coverage | Missing work |
| --- | --- | --- |
| Landing `/[locale]` | Main hero, core landing sections and shared copy have all seven locale dictionaries | `LandingAdditions`/comparison, pricing teaser and customer-feedback interface use EN/RU copy; complete ES/FR/PT/NL/AR and verify all composed sections |
| About `/[locale]/about` | Main component uses localized shared strings and metadata | Appended `PageArticle` reference is English for every locale other than EN |
| Pricing `/[locale]/pricing` | Plan copy and public-workflow overrides are EN/RU; headings/notices exist in seven languages | Five missing plan-content languages; appended reference is also missing in all six non-English locales |
| Features `/[locale]/features` | Main resource copy and active-workflow overrides EN/RU; some reused business-letter content has seven languages | Five missing resource-content languages; appended reference missing in all six |
| Guides `/[locale]/guides` | Main resource copy EN/RU; some reused sections have seven languages | Five missing resource-content languages; appended reference missing in all six |
| Compare `/[locale]/compare` | Main comparison EN/RU | Five missing resource-content languages; appended reference missing in all six |
| Privacy `/[locale]/privacy` | Localized title and availability notice; policy body English | Translate the policy body and appended reference into all six other languages |
| Terms `/[locale]/terms` | Localized title and availability notice; terms body English | Translate the terms body and appended reference into all six other languages |
| Blog `/[locale]/blog` | Listing introduction/navigation in seven languages | Article titles, categories, summaries, reading labels and card links remain English-oriented |
| Three `/[locale]/blog/[slug]` articles | Article bodies English; localized surrounding labels in places | Six complete article versions, localized metadata and related-article cards/links |
| Login, account, settings and billing | Many labels/messages use EN/RU conditionals; billing dictionary is EN/RU | Complete ES/FR/PT/NL/AR; also inventory messages outside the dictionaries |
| Dashboard, history, generator and results | Localized generation notification; starter templates in five output languages with page/output selection behavior | Many static labels, controls, empty/error states, editor/review/history actions remain English; extract and translate existing interface text |
| Shared header/footer/loading/error/dialogs | Existing localization is mixed | Include every visible label and accessibility label in the string inventory before declaring any page complete |

Important: Russian pricing/resources are not fully translated pages today because the appended reference remains English. Landing/About/blog-listing locale coverage is currently broader in routing metadata than the actual full content coverage.

## Source map

- Routing and locale availability: `services/routing.ts`, `contexts/LocaleContext.tsx`, `components/LanguageSelector.tsx`.
- Shared/core landing copy: `services/translations.ts`, `services/interfaceCopy.ts`, `services/landingContent.ts`, `services/businessLetterCopy.mjs`.
- Resource sections and public-workflow overrides: `services/resourceCopy.ts`, `components/ResourcePages.tsx`.
- Pricing and billing: `services/pricingCopy.ts`, `services/billingCopy.ts`, `components/PricingPage.tsx`, `components/billing/BillingPanel.tsx`.
- Customer-feedback interface: `components/CustomerReviews.tsx`.
- Legal bodies: `components/PrivacyPolicy.tsx`, `components/TermsOfService.tsx`.
- Detailed references: `services/pageArticles.mjs`, `components/PageArticle.tsx`.
- Blog data/renderers: `services/blogContent.mjs`, `app/[locale]/blog/page.tsx`, `app/[locale]/blog/[slug]/page.tsx`.
- App interface: `components/LoginPage.tsx`, `components/AccountPage.tsx`, `components/dashboard/`, `components/generator/`, and their reused editor/upload/dialog components.
- Search metadata: `services/seo.ts`, `lib/page-metadata.ts`, `app/sitemap.ts`, and blog article metadata/structured data.

## Proposed implementation

### 1. Freeze and inventory the current source

Capture the English text, existing translations, IDs, paragraph/list order, links and interpolated values before extraction. Build a page/section/locale checklist with separate translated and reviewed states. Include text inside public-workflow overrides, CTA buttons, tables, tooltips, placeholders, loading/error states and accessibility labels. Do not equate dictionary-key presence with a correct translation.

Treat the current rendered public-workflow variant as part of the source: translating base dictionaries alone will leave English strings in their overrides. Preserve all workflow visibility checks.

### 2. Reuse the existing dictionary architecture

Keep the current `[locale]` routes, `LocaleContext`, components and layout. Add the missing locale data to the current dictionaries. Move inline text into the nearest existing copy module, adding a small purpose-specific module only when no existing one fits. No translation service, new database table or duplicate page tree is needed for static content.

For prices/credits/allowances and option values, preserve the current underlying data. Translate display labels only; never change API enum values or saved form values. Keep brand names, email addresses, URLs, numerical limits and template placeholders intact.

### 3. Translate shared reference modules once

`pageArticles.mjs` currently shares 43 distinct reference modules across eight page attachments and three blog articles. Their paragraph text totals approximately 7,564 whitespace-separated English words, excluding page/article titles and introductions. Translating the modules once per language avoids translating the same reference independently for every page.

Keep section IDs, module order, link targets, blog slugs and anchor IDs stable. Add locale-aware access to module titles/paragraphs plus page/article titles and intros. Preserve the existing English export behavior for existing callers until migrated. Have visible content and metadata resolve the same localized article. Translate the reference label, table-of-contents labels and CTA text too.

### 4. Complete each page in batches

Recommended order:

1. Shared public sections: resource/comparison copy, pricing copy including overrides, feedback interface and navigation/state gaps. This fixes repeated gaps on several pages together.
2. The 43 shared reference modules, eight page titles/intros and three blog article titles/intros/categories. This completes the English reference sections that otherwise remain on Russian and other locale pages.
3. Privacy and terms bodies: faithful translation of the current text, preserving clause numbering, qualifications and contact details. Review each complete translation before removing its English-only notice.
4. Login/account and the released cover-letter dashboard flow: sidebar/history, generator, uploads, result/editor, quality review, profile/settings and billing. Preserve existing behaviors and access restrictions.
5. Locale completion and visual review: finish RU/FR/PT/ES first, followed by NL/AR. A batch is complete only when its entire rendered page is checked.

Existing templates keep their agreed behavior: page language on entry/change; explicit output-language selection overrides until the next page-language change. Existing brief text must never be overwritten. Keep the current five generated-letter output languages. Adding Dutch/Arabic interface translations does not add new AI output-language support; template-language expansion requires a separate decision.

### 5. Connect translated versions to routing and metadata

The language selector already changes the locale prefix while retaining the recognized page. The main issue is missing content selection inside that page, so a routing rebuild is unnecessary.

After each public page/locale has complete reviewed content, update its availability in one shared source used by canonical URLs, alternate-language links and sitemap entries. Currently `contentLocales()` and `alternateLocales()` have separate hard-coded rules; avoid letting them diverge.

Use self-referencing canonicals for completed translated pages and matching reciprocal alternate-language links. Preserve English fallback handling for incomplete variants until they are complete. Translate existing metadata faithfully, including article metadata and structured-data language where present; do not perform SEO copy rewrites. Keep authenticated pages excluded from the sitemap and `noindex`.

Replace English/LTR markup in translated content containers with the actual selected content language/direction. Remove an English-only availability notice only after the entire section it describes is translated and reviewed. Related blog links/cards should retain the selected locale when that article version is complete.

## Acceptance checks for implementation

- English visible text, paragraph/list ordering, links, prices, allowances and product visibility match the frozen baseline.
- Every intended locale has all required copy keys and equivalent section/list/FAQ counts; placeholders match the source exactly. Flag unexpected English fallback text using an allowlist for proper names and intentional original content.
- Direct URL load, refresh and language switching render the same complete translated page, including reference sections, dialogs, errors and metadata.
- Page-language changes preserve the existing brief and keep the agreed template/output-language behavior. User-authored prompts, reviews, names, saved chat titles and generated letters stay in their original language; only the surrounding interface is translated.
- No new email/university/research release or permissions change occurs as a side effect.
- Desktop and narrow mobile layouts handle Russian/French text expansion and accented characters. Arabic text containers use RTL while email/URLs/numbers remain readable. Check keyboard navigation and translated accessible labels.
- Completed public locales agree across content availability, canonical, alternate links, sitemap and article metadata. Incomplete variants are not represented as reviewed translations.
- Run focused dictionary/content-parity checks, existing relevant tests, TypeScript, production build and browser checks. Deployment and production-language checks remain a separate final verification step.
- Technical checks establish rendering and content coverage. Fluent human review establishes language quality, especially for legal text and the shared Portuguese wording across Brazil/Portugal.

## Deliverables after implementation authorization

1. Missing language dictionaries and locale-aware shared reference/blog content, with the English baseline preserved.
2. Existing components wired to those dictionaries, including public-workflow overrides and static app labels.
3. A page/locale coverage checklist showing translated/reviewed status and any remaining fallback.
4. Metadata/routing availability updated only for complete translations, plus focused verification results.

No application code or existing page content was changed to produce this plan.
