<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product release and sidebar conventions

- Reuse existing components/helpers and preserve structure; prefer the smallest effective change.
- Professional email, university application and university research are deferred feature updates. Preserve their implementation and server-enforced developer access; do not expose them publicly or add sidebar entries without an explicit release request.
- Cover-letter input uses New Chat on `/[locale]/dashboard`; keep the shared generator and cover-letter result/history routes.
- Sidebar uses one Chat history heading with the existing Spinner for fetches. Do not add interval/focus refetching; refresh after generation/history mutations. Keep profile/settings and billing in the profile menu rather than the main navigation.
