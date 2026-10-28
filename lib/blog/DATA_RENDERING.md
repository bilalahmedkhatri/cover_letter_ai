# Blog data-to-rendering audit — 2026-10-28

Read-only inspection of the configured application database found **one
published Russian article** (ID 2), with six level-2 headings, stored
`metadata_json.word_count = 436`, a category, all four author snapshot text/URL
fields, and no cover asset. Its publication and modification timestamps match.
No draft records, credentials or central user/membership tables were queried for
this audit. No database records/schema were changed. Browser/build/test verification
was not performed; the rendering map below is traced from source.

## Current article and table of contents

The prior detail page already extracted headings into PageArticle's generic
conditional navigation, labeled “In this guide” (localized). The live article
does contain six actual headings, so the database is not missing TOC content.
The user's missing-TOC display could not be reproduced without a browser check.

The blog now provides an explicit `BlogTableOfContents` in PageArticle's TOC
slot, with a clear localized “Table of contents” heading and heading-level
indentation. It reuses the document heading extractor and exactly the same ID
helper as the safe article renderer. IDs are assigned before filtering empty
heading labels, preventing broken anchors when an empty heading occurs. Other
PageArticle consumers retain their existing generic TOC. Unsupported documents
or documents with no nonempty heading nodes do not receive invented sections.

## blog_posts

| Database field | Consumer / visible result |
| --- | --- |
| `title` | Article H1, card titles, structured-data headline, metadata fallback. |
| `slug` | Exact server lookup, article links and canonical; backend spelling is preserved. |
| `locale` | Published query scope, language/RTL, labels/dates and structured data. |
| `excerpt` | Article intro, listing card description, SEO description fallback. |
| `category_id` | Joins `blog_categories`; category name now appears in the article metadata row and links to the filtered listing. Also scopes related articles. |
| `content_json` | Validated React article body, six TOC heading links in the inspected article, and estimated reading time. No raw HTML execution. |
| `content_schema_version` | Controls document validation. Unknown versions show the controlled content notice. Not printed as editorial text. |
| `metadata_json` | Bounded SEO title/description and canonical verification. Social image, author and dates are grounded in the joined assets and post fields. Raw stored JSON-LD is rebuilt, not injected. Internal metadata keys are not displayed. |
| `author_name` | Visible byline and SEO author. |
| `author_designation` | Visible byline role and structured-data `jobTitle`. |
| `author_description` | Visible author biography and structured-data author description. |
| `author_avatar_url` | Byline/avatar and SEO author image, only if its HTTPS origin is allowed. The inspected article uses the configured public B2 origin. |
| `cover_asset_id` | Resolves the cover asset for the card/article/social preview. The inspected post has no cover, so no cover is rendered or fabricated. |
| `published_at` | Visible Published date, card date, SEO publication date and main-list sort. |
| `updated_at` | Visible Updated date only when different from publication; SEO modification date and sitemap `lastModified`. Hidden in the inspected article because timestamps match. |
| `created_at` | Related-post ordering only, newest first with `id DESC` as tie-breaker. It is not presented as the publication date. |
| `status` | SQL membership filter: only `published`. Not an author-facing badge. |
| `id` | Identity/React keys, media publication recheck and current-post exclusion. Not printed as content. |
| `version` | Administrative edit revision, deliberately not fetched or printed. |

`metadata_json.author`, `.author_description`, `.locale`, `.published_at`,
`.modified_at` and social image entries may duplicate the authoritative row.
They are not rendered twice. Stored `.robots`, `.schema_version`, `.json_ld`
and membership-attribution keys are not treated as editorial body content.
Published metadata keeps the application's existing indexing policy.

Reading time is **derived**, not a new column: validated body text at an
estimated 200 words per minute, rounded up. Adjacent marked text runs are kept
together, and block boundaries/hard breaks separate words. It appears beside
Published/Updated/Category using the existing theme. Empty or unsupported
documents do not display a fabricated duration. The inspected word count
corresponds to roughly three minutes; no reading-time value is written to DB.

## blog_categories and blog_assets

| Fields | Consumer / omission |
| --- | --- |
| Category `name`, `slug` | Cards, visible article category/filter link, exact related-category filter. |
| Category `id`, `normalized_name`, timestamps | Relational/editorial bookkeeping, not page prose. |
| Asset `id`, `public_url`, `media_type` | Batched same-app resolution and MIME/origin safety checks; URL becomes media source only after validation. |
| Asset `alt_text` | Accessible image alt and social-preview alt. |
| Asset `caption` | Visible figure caption when present. |
| Asset `width`, `height` | Responsive image sizing. |
| Asset `original_filename` | Attachment label and readable media/alt fallback. |
| Asset `object_key`, `uploaded_by_membership_id`, `created_at` | Storage/attribution internals, deliberately not fetched or displayed. No central user/membership joins. |
| Asset `size_bytes`, `duration_seconds` | Not selected or displayed; native media controls handle playback. No download-size/duration UI was invented. |

## Four latest related articles

The bottom section uses the existing editorial cards and requests up to four
**other** posts with the same category slug and locale and published status.
Order is `created_at DESC, id DESC` because the request was for latest-added
articles; the main list retains `published_at DESC, id DESC`. A missing category
does not cause unrelated posts to appear. Fewer than four matches display only
the available records; zero matches hide the section. At this inspection there
are no other published posts, so no related cards can appear yet.

All database reads in this audit were read-only diagnostics. No tests, type/lint
checks, builds, browser checks or fixtures were run/created for these changes.
