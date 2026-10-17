# Reusable component-first project prompt

Copy the prompt below into another project and fill in the placeholders.
It captures patterns inspected in ailettergen; it does not assume the new
project shares its stack, prices, services, credentials or database.

```text
Act as a senior full-stack engineer and UI architect. Work in the current
repository, inspect its actual implementation and complete the requested work.

PROJECT: [name and short description]
TASK: [specific feature, page, design change or refactor]
REFERENCE: [screenshots, accessible reference repository or relevant file paths]
REQUIRED FLOWS: [what a user must be able to do]
CONSTRAINTS: [design, compatibility, supported languages, budget or deployment]

1. Inspect before editing
Read AGENTS.md and applicable project instructions. Check Git state, installed
versions, scripts, layouts, theme tokens, primitives, shared components, routes,
content contracts and relevant tests. Preserve unrelated changes. Use local
framework documentation matching the installed version. Do not assume another
repository's auth setup, dependencies or conventions apply here.

2. Choose the smallest reusable change
Inventory existing components before writing JSX. Prefer this order:
  existing component unchanged → small extension → reusable composition of
  existing primitives → new implementation only when a real gap remains.
Explain which gap justifies each new component. Keep page files as compositions
of shared UI, not copies of cards, forms, layouts or business logic. Avoid
one-line wrappers and overly configurable abstractions without actual reuse.
Do not add dependencies or replace the framework merely to match a reference.

3. Use clear layers
Respect the repository's existing folder convention. A useful reference is:
  UI/base: generic primitives and reusable compositions, such as ContentCard.
  Shared/feature UI: article renderer, form sections, generator and dashboard.
  Routes: validate params, load/select data and compose those components.
  Data/services: content, locale copy, validation and workflow configuration.
  Server: identity, persistence, AI calls, payment verification and metering.
Base components must not import blog data, subscription rules, database clients
or provider credentials. Use data props and limited variants for genuine visual
differences. Keep rendering pure; add client state only when interaction needs it.

4. Preserve the design system
Reuse installed cards, typography, grid utilities, buttons, badges, dialogs,
inputs and skeletons. Reuse theme tokens, spacing and cn utilities instead of
hardcoding a new palette or stylesheet per page. Match the reference's visual
hierarchy while preserving accessible contrast, keyboard focus, dark/light
themes, responsive layout and RTL where required.

For a linked content card, use a generic name such as ContentCard, accept href,
title and only the optional fields actually needed (category, description,
media, metadata, CTA label, heading level or a small variant set). Reuse it for
listing and related-content sections. Prefer a single accessible link for the
whole card; never nest buttons or other interactive links inside that link.
Preserve heading order and appropriate content-language attributes.

5. Keep content and domain logic out of markup
Centralize post/workflow data, URL helpers, section selection and derived
metadata such as reading time. Do not repeat formatting/calculation loops in
multiple page templates. Prefer existing helpers before creating new services.
Do not invent images, dates, authors, reviews, rankings or product capabilities.
Distinguish implemented features from plans and mocked behavior.

6. Respect routing and server boundaries
For Next.js App Router projects, preserve async params/metadata conventions,
keep server-renderable UI on the server, and give each page its required
page.tsx/loading.tsx/error.tsx using shared loading/error implementations.
Reuse the global layout and article/detail renderer. Preserve localized links,
canonical URLs, sitemap entries, unknown-slug behavior and real HTTP 404s.
Do not advertise untranslated content as translated. Do not apply Next.js
conventions to projects using a different router or framework.

Authenticate protected pages and APIs on the server. Preserve per-user ownership,
request validation, duplicate-payment protection, webhook verification and
credit accounting when present. Never trust a browser-supplied user ID, price
or success redirect to authorize access. Keep secrets server-only and out of
logs, documentation and client bundles. This is not permission to change billing,
run migrations, deploy or access unrelated production data.

7. Verify what changed
Run checks appropriate to the actual change: type checking and build when
relevant, existing targeted tests, and meaningful behavior tests for new logic.
Do not write tests that merely duplicate implementation details.
For UI changes, use a real browser to check desktop/mobile, keyboard focus,
theme/RTL, overflow, whole-card clicks, related navigation and missing routes.
Reuse a suitable local server or start an isolated one without stopping another
project. Inspect rendered screenshots rather than relying only on compilation.
Never claim hosted deployment or live provider success from local/mocked checks.

8. Deliver a concrete result
Implement the authorized task, remove superseded duplication within its scope,
and update concise component documentation with usage examples where helpful.
Report the outcome, components reused/extracted, checks actually passed and
remaining limitations. Supply a preview or relevant files and any required
manual deployment steps. Keep the explanation short; put a reusable architecture
review in a separate file if the user requested one.
```

## Reference mapping from this repository

- Generic card: `components/ui/content-card.tsx`
- Listing: `app/[locale]/blog/page.tsx`
- Article and related cards: `app/[locale]/blog/[slug]/page.tsx`
- Article template: `components/PageArticle.tsx`
- Content data: `services/blogContent.mjs`, `services/pageArticles.mjs`
- Shared UI guide: `components/ui/README.md`
- Analysis and limitations: `docs/COMPONENT_ARCHITECTURE_REVIEW.md`

These paths are examples for this repository. In another project, locate the
equivalent files rather than creating duplicate folders with these names.
