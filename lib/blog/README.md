# AILetterGen public blog

The existing `ContentCard` and `PageArticle` layouts now read published posts
directly from this application's PostgreSQL database. No admin dashboard calls,
gateway app lookup, author-table join, upload endpoint or B2 credentials are
involved. Account, billing, generation and deferred-feature authorization remain
outside the blog data layer.

## Implementation phases

1. **Schema and architecture:** inspected the installed Next.js guides, existing
   Neon HTTP client pattern, blog pages, locale routing, SEO helpers and the
   authoritative backend schema. A read-only live schema inspection on
   2026-10-27 confirmed `public.blog_posts`, `blog_categories`, `blog_assets` and
   schema revision `blog_0003`. IDs are INTEGER, content/metadata JSONB,
   timestamps TIMESTAMPTZ, asset alt text is `alt_text`, and
   `author_description` is nullable TEXT. The extra asset uploader attribution
   field is not used to query central users/memberships.
2. **Reusable core:** SQL repository, row mapping, document validation, safe
   React rendering, URL policy and SEO model live in `core/` without Next.js,
   Neon, environment, AILetterGen route or theme dependencies.
3. **Database adapter:** `adapters/database.ts` reuses the installed
   `@neondatabase/serverless` dependency. The existing account store's pattern
   is retained without routing public content through its private billing or
   ownership services. No dependencies were added.
4. **UI integration:** listing and detail routes reuse `ContentCard`,
   `PageArticle` and `Button`; PageArticle adds optional server-rendered body,
   header and locale slots. Existing reference/privacy rendering defaults are
   retained. Author name, designation, biography, avatar, cover and dates come
   from post/asset snapshots. Empty database results produce a localized empty
   state, not static example articles.
5. **Routing and SEO:** arbitrary valid single-segment article paths can reach
   the DB lookup; the original proxy still rejects malformed paths and unknown
   locale prefixes. Exact published locale/slug membership is enforced in both
   page and metadata. Sitemap reads published rows and real modification times.
   `llms.txt` automatically stops advertising old sample slugs because its
   shared route catalog no longer contains static articles.
6. **Source review and handoff:** reviewed changed source and module boundaries.
   Tests, lint/type checks, builds, browser checks and application-flow queries
   were deliberately not run. Live schema/count/media-origin inspection is not
   evidence that the application query/rendering flow has been exercised.

## Configuration

```dotenv
# Optional existing SELECT-only role in THIS app's database.
# Empty means reuse existing server-only DATABASE_URL.
BLOG_DATABASE_URL=
# Exact public HTTPS B2/CDN origins, comma-separated, without paths.
BLOG_MEDIA_ORIGINS=https://YOUR_PUBLIC_BUCKET_HOST.backblazeb2.com
```

The local `.env.local` already had a pooled `DATABASE_URL`. Its role can SELECT
and INSERT into blog_posts, so it is not a SELECT-only role. No grants, users,
credentials or permissions were changed. Supply an existing restricted role
through `BLOG_DATABASE_URL` when available. The public B2 origin found in this
app's asset records was added locally if media configuration was missing/empty;
no secret connection string was copied or rewritten. Deployment environment
values must be configured separately. Restart Next.js after changing settings.

The app base is `https://ailettergen.com`, with `/{locale}/blog` and the existing
`en/es/fr/ru/nl/pt/ar` locale set. `adapters/config.ts` owns these settings.
Metadata never accepts another application's canonical or arbitrary article
paths. Missing/invalid stored canonicals are rebuilt from this configuration.

## Queries, poolers and freshness

- Every query is a parameterized statement in a **READ ONLY** Neon HTTP
  transaction. The first statement sets transaction-local statement timeout
  8 seconds and lock timeout 2 seconds; HTTP fetch is bounded to 12 seconds and
  uses `cache: 'no-store'`. Settings do not persist to another pooler client.
- The configured hostname has a `-pooler` hint. This is the existing Neon HTTP
  transport, not Postgres.js or asyncpg; do not add their driver options here.
  It does not reuse application-created named prepared statements across
  persistent pooler sessions. Schema inspection succeeded, but repeated live
  application queries/pooler reliability have not been tested.
- Listing joins category and cover in one query. Default size is 12, maximum
  48, page cap 10,000, with one extra row for `hasNext` and no count query.
  `?page=2&category=category-slug` supports category filtering and pagination;
  the existing buttons preserve the filter while navigating.
- Detail matches **exact** locale and stored slug with `status = 'published'`.
  Draft/archived/missing/wrong-locale rows return null; metadata and page call
  `notFound()`. SQL/backend failures throw `BlogUnavailableError`, never null
  or mock data. Safe error codes distinguish missing config, unavailable
  database and invalid timestamps; raw causes, SQL and credentials are omitted.
- Media IDs and official editor URL references are resolved in one batch
  against this same app database. `src` alone never authorizes an uploaded
  asset. Publication is rechecked during the media query.
- No cross-request post cache or static publication manifest. Next's
  `connection()` opts reads into request-time rendering and React `cache()` only
  deduplicates detail/metadata within one server request. The bounded server
  revalidation interval is **0 seconds**: changes appear on the next request.
  Existing browser tabs require navigation/refresh. Avoid adding persistent
  client/CDN caches without a matching invalidation design.
- `next.config.mjs` uses `htmlLimitedBots: /.*/` to block metadata streaming.
  This lets the metadata's publication lookup decide 404 before a loading
  fallback commits HTTP 200. This is a site-wide latency tradeoff: initial HTML
  waits for metadata. HTTP status behavior remains unverified until runtime
  checks are authorized.

## Content, media and SEO

Content schema **version 1** is independent of database revision `blog_0003`.
The validator supports the original requested nodes/marks plus the backend's
current official image/audio/youtube and TableKit nodes. Limits: 1 MiB document,
200,000 text characters, 8,000 nodes, depth 24 and eight marks per text node.
Unknown nodes/versions or invalid structure show a localized controlled notice.

Article text and attributes are escaped by React. No article HTML is injected.
Links accept HTTPS and local paths/fragments; controls/backslashes, DataURLs and
unsafe protocols are rejected. YouTube uses exact supported hostnames and
11-character video IDs; arbitrary iframe sources are omitted. Image/audio/video
node types must match the DB asset MIME type. SVG and active attachments are
excluded; attachments use an explicit document/archive MIME allowlist. Images
use stored alt text with a readable fallback, responsive sizing and lazy loading
where appropriate; native audio/video retain controls without autoplay.

`BLOG_MEDIA_ORIGINS` is the exact media-origin allowlist and also configures
Next image remote patterns. Uploaded media URLs come from `blog_assets`, not
from unsigned node attributes. Author avatars require an allowed origin too.
No signed URL generation, uploads or browser DB access were added.

Stored metadata supplies bounded title/description. Author, image and publication
times are grounded in the selected published row/assets; raw stored JSON-LD is
not executed. JSON-LD is rebuilt and serialized with `<`, U+2028 and U+2029
escaping. This is the only blog script-markup injection, never article content.

There is no translation-group field in the schema. Same slugs in two languages
are not assumed to be translations. Articles have self-canonicals without
invented hreflang alternates. The existing language selector opens the selected
language's blog index from article pages; other page-language behavior and query
preservation are unchanged. Arabic article content uses RTL. Listing SEO retains
the existing site locale helper.

The sitemap keeps the existing non-article route catalog and appends only
published supported-locale DB posts, with `updated_at` as `lastModified`. Beyond
45,000 blog entries it explicitly requires sitemap splitting, rather than
silently truncating or exceeding the sitemap URL limit. Database failure is not
converted to a fabricated successful sitemap.

Legacy static editorial files remain untouched as reference content; they are
not a listing/detail fallback. The old slug-to-workflow mapping is used solely
to preserve the existing gated CTA behavior. New articles use the already-public
cover-letter CTA; deferred workflows retain `canUseWorkflow` checks.

## Manual schema and reuse

`schema.sql` is an **empty-database provisioning snapshot** matching authoritative
`schema_v1.py`, `schema_v2.py` and `schema_v3.py`, including the admin migration
version marker. It is never imported/executed. Existing AILetterGen tables
already exist; **do not apply this file to them**. Schema upgrades remain the
admin migration owner's responsibility. No tables, records or grants were
created/altered during this integration.

For another application, copy this folder and replace only the adapters:

| Part | Change |
| --- | --- |
| `core/` | Keep repository, types, mapping, validation, renderer, URL policy and SEO model shared. |
| `adapters/database.ts` | Implement `BlogExecutor.query<T>(statement, values)` using that app's installed client and existing database. Preserve parameterization, timeouts and read-only transactions. |
| `adapters/config.ts` | Configure its origin, route base, supported locales, media origins and pagination limits. |
| `adapters/ui.tsx`, `copy.ts` | Supply existing components, theme classes and selected-locale interface labels. |
| `adapters/seo.ts` | Adapt the pure SEO model to that app's existing metadata helper. |
| `data.ts` | Replace Next request-time/deduplication wrappers for other frameworks. |

No import of the AzeemLab application is needed at runtime, and AzeemLab's files
were not modified. No additional admin UI or public blog API was necessary for
AILetterGen's server-rendered pages.

At the initial 2026-10-27 inspection this database contained **0 published posts** and one asset.
The expected initial result is an empty listing until the existing admin
publishes content in a supported locale. Final application rendering, real HTTP
404/outage behavior and deployed social previews remain unverified.

The 2026-10-28 follow-up found one published Russian post. See
[DATA_RENDERING.md](./DATA_RENDERING.md) for its field-to-UI audit, explicit TOC,
estimated reading time and same-category latest-created related-post behavior.
