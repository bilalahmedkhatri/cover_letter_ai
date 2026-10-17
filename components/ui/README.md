# Shared UI

Official shadcn/ui components were installed with the registry CLI using `components.json` (new-york, Radix, Zinc). Compose these primitives instead of writing duplicate controls. `IconButton` adds the required accessible label to the shared Button.

Theme tokens live in `app/globals.css` and `tailwind.config.cjs`; `cn` is shared through `lib/utils.ts`. Generator fields reuse `FormField`; all route loading/error files reuse `PageLoading` and `PageError`. The Next error boundary uses `retry()` to fetch fresh content.

`ContentCard` (`content-card.tsx`) is the shared linked preview for articles,
guides and other content. Use `variant="default"` for bordered listing cards
or `variant="editorial"` for media/category/title/metadata cards. It composes
Card, Badge and Button rather than duplicating those primitives. Pass `href`,
`title`, optional category/description/metadata/media/actionLabel, and an
appropriate headingLevel (2 for listings, 3 below a section heading). The whole
card is one accessible link; do not pass interactive children inside it.

Use Lucide document, pen and navigation icons. Branding must not use sparkles, brains or robots. Keep logical spacing and alignment for RTL languages, label form fields, and verify focus, dark/light contrast and mobile behavior in a browser.

Dashboard routes reuse `DashboardPage` (title, optional actions, children) through
`DashboardSection`. Do not add a second page heading/description or page-level
refresh/back controls in feature content. `DashboardShell` composes the existing
SidebarProvider/SidebarInset with `DashboardSidebar`; it has no app header.
Navigation labels and page titles share `services/dashboardNavigation.ts`.
Account panels use `embedded` mode so their old header and tab bar do not repeat
the sidebar. The sidebar footer owns account navigation and reuses `useSignOut`
for managed logout and clearing personal draft state.

`useSignOut` sends an explicit empty JSON body through the managed auth proxy;
keep this when reusing logout, since an empty request body can fail JSON parsing.

`DashboardAccount` scopes the shared profile/usage fetch to the dashboard, renders
its compact status strip and refreshes usage after generation/navigation. Overview
reuses `Generator compact`; writing options use the same fields and editor as the
dedicated routes. Sidebar collapse uses the built-in icon mode; the mobile sheet
keeps its own opener. Dashboard card spacing is scoped in globals.css.

## Composer and attachments

`Spinner` is the shared circular status indicator; `PageLoading` uses it for all
route loading boundaries. `DashboardAccount` shows only the actual plan name and
credit count, such as Pro 200 Credits, without a border or free-usage note.

Overview uses the compact branch of the existing Generator: the user supplies
name, signature and instructions in one textarea with a workflow-specific example
placeholder. The placeholder is guidance only and is not submitted as user data.
The plus menu reuses Radix DropdownMenu and the existing Dialog/Input for URLs.
`ResumeUpload` now owns a reusable attachment picker and removable chips, with an
optional actions slot for the composer toolbar. No separate generator was added.

Supported files: DOCX, XLSX/XLS, CSV, TXT, PDF and PNG/JPEG/WebP images. Up to 5
files, 5 MB each; at most 3 images and 12,000 combined extracted text characters.
Excel is limited to 5 sheets, 200 rows and 40 columns per sheet. Unsupported or
excessive content is rejected explicitly rather than silently truncated. Images
are rasterized/resized to at most 1280px and sent as bounded inline media, not
base64 in the text prompt. Documents are extracted in the browser. Original files
are not stored. Generation still requires authentication and server validation.

Excel uses the lazy-loaded official [SheetJS distribution](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/).
Image parts follow the [Gemini image-input API](https://ai.google.dev/gemini-api/docs/generate-content/image-understanding).

Checks: `node --experimental-strip-types --test --test-isolation=none tests/attachments.test.mjs tests/workflow.test.mjs`.
Browser tests used synthetic documents, a browser-generated image, a disposable
real sign-in and mocked account/AI responses. They verified extracted contents in
the request, no unintended submission on removal, editable output, the minimal
credit label, no bottom border and no mobile overflow. No live model call occurred.
