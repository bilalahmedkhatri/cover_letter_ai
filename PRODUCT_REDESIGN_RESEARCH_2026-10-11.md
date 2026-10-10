# AI Letter Generator: competitor research and redesign direction

Research date: 11 October 2026. Public pages, pricing and browser-visible
interfaces were inspected. No paid accounts, purchases or private competitor
dashboards were used. UI observations and proposed decisions below are distinct
from verified product/pricing facts. Prices are advertised USD prices; taxes,
eligibility and checkout terms can differ.

## Competitors and business models

| Product | Service and public flow | Advertised pricing | Implication for our product |
| --- | --- | --- | --- |
| Grammarly | Public three-step cover-letter tool: upload or paste resume, add role details, create a draft. The visible first screen prioritizes the form with progress and clear labels. Broader service offers editing and tone help. | Free platform plan $0 with 100 AI prompts/month. Pro page displays $12, but the extracted page does not clearly establish its billing period; do not treat it as a verified monthly checkout quote. | Useful benchmark for a focused tool and manual-entry alternative to file upload. |
| Teal | Resume and job-search workspace: import resume/LinkedIn, connect a target job, generate and personalize a letter. Public product imagery exposes length, tone, job-description and custom-prompt controls. | Free includes 2 cover-letter AI credits; Teal+ $13 every 7 days, $29 every 30 days, $79 every 90 days. | Users can start free, while subscription value comes from the wider application workflow. |
| Kickresume | Template-led career suite with matching resumes and cover letters, editable AI drafts, formatting and examples. The observed cover-letter CTA led to account creation. | Free basic plan; Premium $24/month, $54 every 3 months, or $96/year ($8/month equivalent). Free plan lists 4 basic matching cover-letter templates; full AI Writer is listed in Premium. Landing page also advertises a free try, so basic-plan access and trial access should not be conflated. | Document appearance, examples and editing are central to perceived value. |
| Rezi | Resume-based cover letters targeted to a company/role; documents are organized alongside resumes. Its guide recommends personal editing and a concise professional format. Private editor was not tested. | Free: one resume, limited AI, 3 PDF downloads. Pro $29/month. Lifetime $149 one-time; monthly human review is excluded from Lifetime. Free FAQ says unlimited cover/resignation letters, which is not the same as unlimited AI usage. | Keep usage, exports and AI limits explicit; workflow value goes beyond generation. |

Sources: [Grammarly tool](https://www.grammarly.com/ai/ai-writing-tools/cover-letter-generator),
[Grammarly plans](https://www.grammarly.com/plans),
[Teal tool](https://www.tealhq.com/tool/cover-letter-generator),
[Teal pricing](https://www.tealhq.com/pricing),
[Kickresume tool](https://www.kickresume.com/en/ai-cover-letter-writer/),
[Kickresume pricing](https://www.kickresume.com/en/pricing/),
[Rezi guide](https://www.rezi.ai/rezi-docs/ai-cover-letter-generator-explained),
[Rezi pricing](https://www.rezi.ai/pricing).

## UI observations

Grammarly uses a restrained white interface, green accent, compact progress,
upload/paste tabs and a separate promotion panel. The action is evident before
the visitor reads the long explanation below it.

Teal uses white, black typography and yellow primary actions. The cover-letter
page demonstrates the actual tool through product imagery. Its illustrated
editing controls explain the service more concretely than generic feature cards.

Kickresume is more decorative: serif headline, warm accents, floating icons and
document examples. This is evidence that gradients or illustrations alone do
not determine whether a product feels credible. Consistency, specific copy,
document quality and a coherent flow matter more. Its account screen uses a
split layout with social/email signup. We should avoid adding signup merely to
imitate it.

Rezi's public guide uses quiet neutral surfaces, readable content and organized
navigation. Its documented workflow focuses on a role-specific draft, editable
formatting and saved documents. Do not infer an unobserved private editor layout
from this guide.

## Requirements to validate

These are product hypotheses inferred from the competitors and our GSC export,
not survey results, market-size estimates or proof of willingness to pay.

1. A visitor should understand input, output, cost and next action immediately.
2. Resume details plus an actual job description should produce a specific draft.
3. Users need easy editing, tone/length controls, copy and reliable PDF export.
4. Optional uploads need a paste/manual fallback and clear file limitations.
5. Returning users need recoverable drafts and understandable saving behavior.
6. Language selection must be complete, including controls and Arabic direction.
7. Pricing and provider/account requirements must be visible before generation.

Our supplied GSC export has 359 impressions and zero clicks; /ru receives the
largest share of page impressions. This supports prioritizing Russian and
English discovery, but does not establish demand for paid plans or identify the
cause of the zero-click result. Keep the existing language URLs during redesign.

## Proposed product and visual direction

Build a focused multilingual letter workspace for job applications, admissions
and professional emails. Start with the job-application flow; add the other
flows through the same form/editor components. A single broad marketing headline
should not obscure the visitor's specific task.

Use a warm white or neutral background, dark readable typography, one brand
accent and modest borders. Put a realistic, clearly labeled example letter near
the primary action. Use a coherent spacing/type scale and restrained motion.
Templates should change the exported document, not merely decorate the page.

Desktop workspace: inputs on one side and an editable paper preview on the
other. Mobile: a short linear form with clear Draft/Preview navigation, large
touch targets and a reachable primary action. Keep language and theme secondary.
Provide inline validation, upload progress, generation status, retry guidance
and an explicit saved-state indication. Avoid floating promotions covering the
editor and unverified testimonials or hiring guarantees.

Recommended flow:

`Choose purpose → Add background + opportunity → Generate → Review/edit → Copy/export`

Make advanced controls progressively available. A pasted job description must
work independently of URL analysis. Do not imply that sending a URL to an LLM
proves its live contents were fetched; verify the current provider behavior.

## Reuse and component architecture

The project already has React components, wizard steps, WorkspaceLayout,
FormStateContext and GenerationContext. The issue is not lack of components:
controls and style classes repeat, and DashboardPage combines UI, AI requests,
analytics and persistence. CoverLetterDisplay combines editing, PDF and social
export responsibilities.

Recommended base: **shadcn/ui + the existing Tailwind/Vite stack**, with one
consistent primitive family. Choose components that support the installed React
version and SSR; do not blindly install latest dependencies or replace the app
scaffold. shadcn provides editable component source rather than a finished
product design. It still needs brand styling and domain-specific composition.
[Vite integration](https://ui.shadcn.com/docs/installation/vite),
[component model](https://ui.shadcn.com/docs),
[RTL integration](https://ui.shadcn.com/docs/rtl/vite).

| Layer | Reuse or extract |
| --- | --- |
| UI primitives | Button, Input, Textarea, Select, Tabs, Accordion, Dialog, Sheet, DropdownMenu, Alert, Progress and Skeleton from the chosen component library. |
| Icons | Named Lucide React imports, retaining a custom brand mark. |
| Layout | MarketingLayout, WorkspaceLayout, Navigation, PageHeader and a mobile workspace shell. |
| Letter workflow | PurposeSelector, BackgroundForm, OpportunityForm, UploadField, GenerationControls, LetterEditor, DocumentPreview and ExportMenu. |
| State and actions | Keep current contexts initially; extract generation, saved drafts and export logic into focused hooks/services. |
| SEO | Keep services/seo.ts and build-time prerendering independent of visual components. |

[Lucide's React library](https://lucide.dev/guide/react/) supports named icons,
TypeScript and tree shaking. A form library such as React Hook Form and a schema
validator can be evaluated during the form refactor; adding dependencies is not
a prerequisite for this SEO update. Native HTML is preferable where it already
provides the required behavior, such as details/summary for simple FAQs.

Proposed structure:

```text
components/ui/             # imported reusable primitives
components/layout/         # navigation and page shells
features/letters/          # input, editor, preview and export compositions
features/letters/hooks/    # workflow operations
services/                 # AI, persistence, metadata and exports
contexts/                 # shared state during gradual migration
```

## Pricing recommendation

Preserve the current free offer during usability validation. First measure cost
per successful letter, provider reliability, repeat usage and export rate.
Provider billing/authentication and the Gemini client-key architecture must be
resolved before promising a paid hosted service. The current implementation
prioritizes Puter and falls back to Gemini, which also needs to be reflected in
the privacy policy before paid launch.

Later test capped free generations and either credit packs or a clearly bounded
monthly plan. Existing drafts, manual editing and advertised free exports should
remain understandable; do not introduce a surprise export paywall. Competitors'
$24–29 monthly suites are not a justified price for our narrower current tool.
Do not offer lifetime unlimited AI before knowing long-term costs.

## Implementation sequence and acceptance criteria

1. Deploy and verify the SEO HTML update; retain the 35 public URLs and redirects.
2. Create a small original design system and a reviewable homepage/workspace
   prototype with realistic sample output. Establish typography, spacing,
   controls and light/dark/RTL behavior before changing every page.
3. Integrate the chosen primitives; migrate the main form and editor gradually,
   reusing current generation and saved-session logic.
4. Verify file import, validation, language switching, keyboard use, draft saving,
   error/retry states and PDF output. Split heavy AI/export code from public-page
   bundles as part of this refactor; the current build still warns at ~924 kB JS.
5. Complete policy/provider review and remaining interface translations.
6. Measure start → successful generation → edit → export and returning use.
   Make pricing decisions from these signals and interviews with real users.

The redesign should pass public HTML/metadata checks, maintain canonical URLs,
retain saved drafts, support mobile and keyboard interaction, and avoid shipping
paid-plan UI until limits and billing behavior are actually implemented.
