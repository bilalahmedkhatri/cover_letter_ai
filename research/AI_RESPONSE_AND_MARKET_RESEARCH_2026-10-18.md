# AI response requirements and multilingual market research

Research date: 18 October 2026, Asia/Karachi.

Markets confirmed by the owner: Russia, France, Brazil, Portugal and Spain. Mexico is excluded. This is a research and product recommendation document, not an implementation or release instruction.

## Decision

The implemented cover-letter UI needs two AI outputs: the finished letter, and structured review findings from a separate review step. It does not currently need an AI-generated title, HTML, PDF, word count, chat identifiers, billing information, SEO keywords or an ATS score from the model. Most of those values belong to the application, transport layer or a separate feature.

Keep the existing prompt-only generation contract compatible. Fix reliability, localization, evidence handling and saving edited drafts before expanding the response into a large product dashboard. An optional short display title can be considered later, but it should not become a prerequisite for returning a usable letter.

The strongest market pattern in the inspected pages is personalization from a real CV plus a particular vacancy, followed by editing and copy/export. This is a qualitative competitive pattern, not a measured claim about conversion or hiring outcomes.

## Evidence and limits

- Read the current editor, generator, result page, history storage, provider adapter and review schemas in the working tree.
- Inspected the actual deployed `/ru`, `/fr`, `/pt` and `/es` landing pages in Edge, the deployed French dashboard, and an existing Russian cover-letter result in the signed-in browser. Did not submit a new AI request, change a draft, export a private document or copy personal contact details into this report.
- Examined Yandex results for `сопроводительное письмо нейросеть` with Moscow selected, confirmed by the visible region and `lr=213`. A Moscow snapshot is not a national ranking audit. Advertisements were distinguished from organic results. Re-enabled the original automatic-location option and submitted Save after the check; a subsequent persistence check timed out.
- Attempted Wordstat research: submitting the query redirected to Yandex sign-in. No Russia search volumes or historical demand counts were obtained. Result-count labels on a search page are not monthly search volumes.
- Used the connected Ubersuggest account. Resolved actual country location IDs: France 2250, Brazil 2076, Portugal 2620, Spain 2724. The Russia lookup initially returned similarly named US towns, which were rejected; no incorrect location was substituted.
- Ubersuggest exported 706 seed/suggestion rows across the four measured countries; only 80 rows contain numeric volume data. Remaining suggestions are unmeasured, not zero-volume terms. Tool-reported zeros also do not prove that no demand exists.
- France and Brazil overview calls returned four monthly history points each. Portugal and Spain overview calls returned `INVALID_ARGUMENT`; their country-specific suggestion metrics are available, but historical series are not. No fabricated historical trends or year-over-year growth rates are used.
- Broad `carta de apresentação` / `carta de presentación` demand cannot be compared directly with France's narrower AI-specific seed. These are estimated keyword volumes, not unique people, product demand, conversions or this site's traffic. Do not add close variants together as unique addressable demand.
- Web search results for the other markets were native-language discovery samples, not controlled Google country-rank measurements. Competitor pages are evidence of their own offers and claims, not independent proof of their accuracy.
- The web fetcher returned stale/inaccessible versions of some live pages; browser-rendered observations were used for the current UI findings.

Supporting files: `AI_RESPONSE_MARKET_DATA_2026-10-18.json` preserves country-scoped tool output, dates and errors; `MARKET_KEYWORDS_2026-10-18.csv` separates estimated, unmeasured and tool-reported-zero rows. No credentials or private conversation content are included.

## 1. What the current UI actually consumes

| Implemented feature | Data needed | Who should supply it? | Current behavior |
| --- | --- | --- | --- |
| Letter editor and preview | Complete final plain-text letter with paragraph breaks | AI generation | Gateway `answer` becomes app `text` |
| Bold salutation/signature, alignment, spacing, undo/redo | Editor document and user formatting state | App/editor | `textDocument()` builds the initial editor document; formatting is local |
| Copy and PDF | Current edited document | Browser/export helper | No second AI generation is needed |
| Word count | Count of current editor text | App | Recomputed locally; never trust a model's reported count |
| Chat history and reopen | Conversation/message IDs, timestamps, workflow, status, saved input, result | Server/database | Private owner-scoped storage and history endpoints |
| Sidebar title | Short recognizable title | App/user | First 100 characters of normalized brief; rename supported |
| Fresh result's internal title | Workflow label | App | The result component does not display a dedicated AI-title heading |
| Writing review cards | Claims/grammar/language findings | Review AI plus server aggregation | Distinct review step; no guaranteed verification |
| Review anchors | Exact draft excerpt, issue type, explanation, suggestion, source IDs | Review AI, validated by server | Quotes must occur in the draft; source IDs must exist |
| Local template checks | Placeholders, repeated text, suspicious unsupported numbers | App rules | These checks do not establish grammar or factual correctness |
| Review validity after editing | Hash/revision of the text being reviewed | App/server | Manual edits mark review as stale; warn instead of reusing it as current |
| Loading, pending, failed, retry/replay | Server request state and UI state | App/server | Model should not invent a percentage-complete value |
| Billing/profile/account/logout | Account/session/payment data | Auth, database, payment service | Never derive from AI text |
| Marketing pages and Analytics | Curated translations, metadata and anonymous interaction events | App/content/analytics | No AI response field required |
| Sources panel | Real retrieved URLs and provenance | Retrieval/gateway, validated | Cover letters currently return `sources:[]`; query results may include search sources |

Relevant source files: `components/generator/Generator.tsx`, `DraftResult.tsx`, `RichEditor.tsx`, `QualityReview.tsx`; `services/letterDocument.ts`, `history.ts`, `coverLetter.mjs`, `coverLetterReview.mjs`; `server/ai/providers.mjs`, `handler.mjs`, `cover-letter-review.mjs`; `server/accounts/store.mjs`.

### Three different meanings of title

1. **Conversation title:** navigation label, such as a supplied role/company combination. Prefer a deterministic app-generated title when structured input exists; otherwise retain a brief excerpt and allow rename. Do not put applicant contact details into a generated display title.
2. **Letter subject:** an optional line inside the document, for example a French `Objet` or Spanish `Asunto`. Include only when the selected format and supplied role justify it. This is not the conversation title.
3. **SEO title:** public landing-page metadata, written and localized by the product/content layer. A private letter's title should never automatically become an indexed public page.

Current contract consumes no separate AI `title`. If a title is later requested, make it optional, short, sourced to supplied role/company information, editable, and excluded from the copied letter unless the user chooses otherwise. Title-generation failure must not discard a valid letter.

## 2. Contracts: keep transport, writing and application data separate

### Existing gateway response

```json
{
  "answer": "Complete letter as plain-text paragraphs",
  "request_id": "gateway-request-identifier",
  "finish_reason": "stop"
}
```

`finish_reason` also allows `unknown`. It means the provider did not confirm normal completion, not that the content has passed quality checks. `request_id` is transport metadata supplied by the backend; it is not creative model content. Current code normalizes the result to `{text,sources:[]}` and does not forward upstream request/finish fields to the browser.

Keep `answer` as letter text. Returning a JSON document string inside `answer` today would put that JSON into the editor and break the review assumptions. Any richer contract must be explicitly versioned and supported by the gateway, adapter, validation, history and UI together.

### Existing separate review-model response

```json
{
  "checks": {"factuality": true, "grammar": true, "language": true},
  "issues": [
    {
      "kind": "unsupported_claim",
      "quote": "Exact excerpt from the current draft",
      "message": "Explanation in the selected output language",
      "suggestion": "A correction or removal; no invented replacement fact",
      "sourceIds": ["brief"]
    }
  ]
}
```

The booleans mean the model attempted those checks, not that all checks passed. The existing strict review schema permits at most 12 model issues. Allowed issue types: `unsupported_claim`, `unsupported_number`, `grammar`, `language`, `placeholder`, `repetition`, `identity`. `sourceIds` are limited to the actual input sources: brief, resume, experience, skills. A job requirement is not evidence that the applicant has that skill. A CV excerpt is user-supplied evidence, not independent verification.

The app aggregates local and model issues into `qualityReview` with version, final-text hash, four check statuses, issues, previous issues, repair flags and warning codes. Review failure is recoverable: return the usable draft with explicit `not_checked`/warning states. One repair may change the text; a repaired draft is not silently certified as reviewed again.

### App-to-browser response needed for today's UI

```json
{
  "text": "Final displayed letter",
  "sources": [],
  "qualityReview": {
    "version": "cover-letter-review.v1",
    "textHash": "SHA-256 of the final text, calculated by the server",
    "checks": {
      "structure": "passed",
      "factuality": "not_checked",
      "grammar": "not_checked",
      "language": "not_checked"
    },
    "issues": [],
    "previousIssues": [],
    "repair": {"attempted": false, "applied": false},
    "warnings": ["review_unavailable"]
  },
  "operation": "standard",
  "conversationId": "server-generated UUID",
  "messageId": "server-generated UUID",
  "historySaved": true
}
```

Illustrative field mapping, not a literal schema-valid test fixture: replace explanatory UUID/hash values with real validated values. `historyWarning` and `qualityWarning` can be added by the server when saving fails. They are not AI fields. Preserve the existing pending/completed/failed replay behavior and idempotent request IDs.

### Optional future additions: only with a visible consumer

| Proposed field | When justified | Origin and validation |
| --- | --- | --- |
| `displayTitle` | A redesigned result header/history label | App-derived first; optional grounded model suggestion second |
| `subject` | A user-selectable formal-letter/email subject control | Optional AI text, nullable when data is missing |
| `missingInformation[]` | A real follow-up UI before generation | Bounded questions; never infer missing qualifications |
| `evidenceLinks[]` | A claim-to-input explanation panel | Exact source IDs/excerpts; distinguish job requirements from applicant facts |
| `languageWarning` | Explicit language mismatch handling | Server/detector plus review; requested locale comes from input |
| `keywordAlignment[]` | A future role-relevance panel | Compare supplied vacancy requirements against supplied experience; call it alignment, not hiring probability |

Do not add an ATS-pass percentage, AI-detection percentage, interview probability or unsupported numeric quality score. Search keywords used to acquire customers are also different from role keywords used to tailor a private letter. Never inject SEO phrases into a user's letter just to target organic search.

### Input improvements matter more than extra output fields

The app currently uses one `Portuguese` output choice and `pt` code. Brazil and Portugal need explicit regional preference (`pt-BR` / `pt-PT`) if both are target markets. Add target country/variant as an explicit user choice in a later implementation; do not infer it from IP, nationality or an applicant's name. Keep interface locale distinct from output language. In the observed French dashboard session the output selector was English, so users need a conspicuous output-language choice; this observation does not prove the default for every session.

Separate optional structured job role, company and real applicant evidence from a mixed brief when the user wants more control. The compact flow currently sends those dedicated personal fields empty and relies on the brief/upload. Generating more output metadata cannot recover facts never supplied.

Existing requested lengths are 120–180, 250–350 and 350–450 words. They are targets, not guaranteed lengths or minimums. Missing evidence should produce a shorter truthful letter, not filler. A one-page PDF depends on font, spacing and margins, so measure the rendered export rather than assuming a word count guarantees one page.

## 3. Live app findings

| Finding observed on deployed app | Implication | Priority |
| --- | --- | --- |
| Existing Russian result has working editor, preview, copy, PDF, word count and chat history | Basic document output is already enough to drive the core UI; no AI title is needed to make it usable | Preserve |
| That result displays `AI review was unavailable`; claims, grammar and language show `Not checked` | Review reliability is more valuable than an additional decorative response field; do not label it verified | High |
| `/fr/dashboard` still shows New Chat, Chat history, Write Confidently, English field/action labels and Free 0 Credits | Interface localization is incomplete even when the landing page language changes | High |
| `/fr`, `/pt`, `/es` contain English guidance, plan comparison, feedback and pricing sections | Finish translations before treating them as fully localized acquisition funnels | High |
| Landing pages still claim that pasting a vacancy/program URL makes AI analyze it | Cover-letter code marks URLs as unread references and does not retrieve those pages; change the claim or implement retrieval deliberately | High |
| Landing pages say drafts stay only in this browser | Current server chat history saves prompts/results; explain saved history versus unsaved editor changes accurately | High |
| Page titles emphasize business letters: Russian `деловых писем`, French `lettres professionnelles`, Portuguese `cartas comerciais`, Spanish `cartas comerciales` | These phrases are broader or different from job-cover-letter intent. Align the principal acquisition page with the actually released job-letter product | High |
| `/pt` copy uses Brazilian-leaning wording such as `equipe` and `sua experiência` | One Portuguese translation is not enough evidence of Portugal-specific writing quality; add an explicit variant plan | Medium |
| Free/credits dashboard badge coexists with pricing and no current generation quota deduction | Clarify availability and limits; do not ask AI to invent usage balances or add stronger free/unlimited marketing claims | Medium |

The existing Russian letter contains specific technical claims, but the complete original source input was not audited against every sentence. Do not label any individual claim fabricated based only on the truncated sidebar prompt. The unavailable-review state is directly observed.

The working tree previously reported a gateway-provider syntax issue. An existing live result does not prove every current local file builds, or that a newly submitted request would succeed. No new generation, production redeployment, payment test or multilingual model-quality benchmark was performed in this research.

## 4. Country evidence, search intent and positioning

### Russia: Yandex-first discovery

The Moscow-region Yandex snapshot for `сопроводительное письмо нейросеть` showed organic tools including naimut.ru, PR-CY, Veruna, SoprovodAI, Rabota-help, PismoII and Textovod. ruGPT appeared prominently, with placement varying between the initial location and Moscow results; paid placements must not be reported as organic rankings. Related searches included resume examples and vacancy-specific letters, but also court/document letters that do not fit this product.

Directly checked [PR-CY](https://pr-cy.ru/app/cover-letter/) exposes resume, job description and company inputs. [ruGPT](https://rugpt.io/chat-gpt-dlya-generacii-soprovoditelnogo-pisma) emphasizes Russian access, customization and revising output. These are product claims, not independent performance measurements.

[HeadHunter's official help page](https://feedback.hh.ru/knowledge-base/article/00217334), dated 11 August 2026, documents an integrated CV-plus-vacancy letter generator, one free generation followed by hh PRO, and editing before sending. This establishes a substantial local feature competitor; a standalone service needs a clear reason to leave the job board, such as cross-platform editing, multilingual output and transparent claim review. It does not prove this app is better or cheaper.

Recommended seed cluster: `сопроводительное письмо к резюме`, `сопроводительное письмо нейросеть`, `сопроводительное письмо под вакансию`, `генератор сопроводительного письма`, `сопроводительное письмо без опыта`, `сопроводительное письмо пример`, `сопроводительное письмо онлайн`, `сопроводительное письмо бесплатно`. Volumes are unavailable. Do not publish court, visa or official-document letter pages to chase unrelated traffic.

Use neutral salutations and do not infer grammatical gender. [hh.ru's writing guidance](https://hh.ru/article/32013) recommends concise, vacancy-specific wording and business register. Treat short, paste-ready text as a product mode worth testing, not a universal preference already measured.

[Yandex Wordstat documentation](https://yandex.ru/support2/wordstat/ru/interface/new) explains regional/device filtering and historical dynamics. A future authenticated extraction should record Russia scope, query operators, device filters, dates and phrase variants. The login gate prevented those measurements today; there is no demonstrated Russia growth curve in this report.

### France: natural French plus evidence, not generic polish

Measured `lettre de motivation ia`: 1,000 estimated monthly searches, difficulty 22. `lettre de motivation ia gratuit`: 480, difficulty 21. `lettre de motivation ia avec cv`: 30, difficulty 26. These support an IA + real-CV acquisition cluster. Free-intent queries should lead to an honest explanation of available free use, not an undisclosed paywall.

[France Travail](https://www.francetravail.fr/candidat/vos-recherches/preparer-votre-candidature/cv-lettre-de-motivation-e-mail/et-si-votre-lettre-de-motivation.html) discusses personalization and the weakness of generic AI phrasing. Its examples include an `Objet` line; this supports an optional document subject, not a mandatory separate AI title. Preserve applicant evidence and avoid manufacturing company enthusiasm or anecdotes.

Competitor patterns: [Folium](https://foliumcv.com/fr/lettre-de-motivation) positions real CV + job text, [BoosterCV](https://www.booster-cv.fr/lettre-motivation-ia) emphasizes avoiding clichés, and [Bespree](https://bespree.com/fr/cover-letter) advertises multiple export formats. Their stated features are not proof of conversion, factual accuracy or detector performance.

Additional candidate clusters: `lettre de motivation sans expérience`, `lettre de motivation stage`, `lettre de motivation alternance`, `lettre de motivation candidature spontanée`, `corriger lettre de motivation`, `lettre de motivation pdf`. Only tool-returned terms carry metrics in the export. University/Parcoursup/master traffic is a separate deferred feature, not a reason to expose it publicly now.

### Brazil: role-specific cover letters and accessible text

Measured `carta de apresentação`: 12,100/month, difficulty 18; `carta de apresentação para emprego`: 3,600, difficulty 21; `como fazer carta de apresentação`: 1,900, difficulty 23. These are mostly document-learning/example intents, not pure software-purchase intent. Use helpful worked examples and an honest tool CTA on the same relevant page.

[Gupy's own guide](https://www.gupy.io/blog/carta-de-apresentacao), updated 13 October 2026, treats the letter as a concise complement to the CV with role-relevant evidence. [Its candidate help](https://suporte-candidatos.gupy.io/s/article/como-funciona-a-ordenacao-das-candidaturas-em-vagas-de-candidatura-rapida?language=pt_BR) describes vacancy-specific matching and human recruiter control. It does not provide a basis for this app to claim an ATS pass score or hiring guarantee.

Native competitor examples include [SuaVagAI](https://suavagai.com.br/) and [Curriculos.AI](https://curriculos.ai/), which package cover letters with CV-related tools. Their positioning suggests a CV-plus-job expectation. Do not expand into a full CV product solely because competitors bundle it; first make the existing evidence-to-letter flow reliable.

Candidate clusters: `carta de apresentação para primeiro emprego`, `carta de apresentação sem experiência`, `carta de apresentação simples e direta`, `gerador de carta de apresentação ia`, `carta de apresentação para currículo`, `carta de apresentação jovem aprendiz`. AI-specific and subgroup terms without tool metrics remain hypotheses to validate, not measured demand.

### Portugal: a distinct language variant and spontaneous applications

Measured country-specific volumes: `carta de apresentação` 1,900/month, difficulty 27; `carta de apresentação para emprego` 1,600, difficulty 27; `carta de apresentação exemplos` 720, difficulty 19; `carta de apresentação europass` 170, difficulty 23.

[Europass's Portuguese guidance](https://europass.europa.eu/pt/create-europass-cover-letter) recommends a short, structured letter tied to examples in the CV and job requirements. It supports clear document organization, not an ATS guarantee. The [IEFP spontaneous-application example](https://www.iefp.pt/documents/10181/190644/Guia%2Bde%2BApoio%2B%C3%A0%20Procura%2Bde%2BEmprego/827d2ac3-7793-451e-b542-90d007a114d8) establishes relevant local terminology; it is an older format reference, not proof of a 2026 trend.

Candidate clusters: `carta de apresentação candidatura espontânea`, `carta de motivação emprego`, `carta de apresentação primeiro emprego`, `carta de apresentação europass`, `carta de apresentação português de Portugal`, `carta de apresentação estágio`. Target native EU-Portuguese wording and spelling intentionally. [MobileCV's Portuguese page](https://mobilecv.ai/pt/cover-letter-ai) advertises resume-plus-vacancy tailoring and PDF output; verify actual regional quality separately.

### Spain: examples, short letters and local terminology

The narrow AI seed `carta de presentación ia` returned no metrics/suggestions; this is not evidence of zero demand. Broad `carta de presentación`: 9,900/month, difficulty 30. `carta de presentación para trabajo`: 4,400, difficulty 27; `carta de presentación corta`: 480, difficulty 16. An example-to-editor page and concise output option are sensible tests.

[Curricula](https://curricula.es/herramientas/generador-carta-presentacion) exposes role/company/experience/achievement/motivation fields and editable/downloadable output. [Qosmic](https://qosmic.es/carta-de-presentacion) was returned for native AI-generator search discovery; only its search-page description was accessible, so detailed feature claims are not made. [Robert Walters Spain's AI prompt guide](https://www.robertwalters.es/content/dam/robert-walters-redesign/country/spain/files/instrucciones-inteligencia-artificial/crea-tu-carta-de-presentacion.pdf) is another primary indication of AI-assisted application-writing use.

Candidate clusters: `generador carta de presentación`, `carta de presentación con ia`, `carta de presentación sin experiencia`, `carta de presentación autocandidatura`, `carta de presentación corta`, `carta de presentación prácticas`, `carta de presentación pdf`. Use es-ES as an explicit market preference; do not infer it from the interface alone or merge Spain with Mexico.

## 5. Prioritized measured keyword shortlist

Priority combines closeness to the released cover-letter flow, native intent, estimated volume and difficulty; it is not simply descending volume. Difficulty is Ubersuggest's 0–100 estimate, not a promise of rankings. Broad topics usually merit an example/guide + tool page; adjacent near-synonyms should share one page to avoid cannibalization.

| Priority | Market | Keyword | Est. monthly volume | Difficulty | Intent/page and reason |
| --- | --- | --- | ---: | ---: | --- |
| 1 | France | lettre de motivation ia | 1,000 | 22 | Core product page: explicitly asks for AI-assisted motivation letters |
| 2 | France | lettre de motivation ia gratuit | 480 | 21 | Same core cluster; useful free intent if access/limits are honestly explained |
| 3 | Brazil | carta de apresentação para emprego | 3,600 | 21 | Job-specific guide + generator; excludes irrelevant business-introduction letters |
| 4 | Spain | carta de presentación para trabajo | 4,400 | 27 | Job-intent landing page with examples and visible editor destination |
| 5 | Portugal | carta de apresentação para emprego | 1,600 | 27 | Dedicated pt-PT value proposition, distinct from Brazil's language variant |
| 6 | Spain | carta de presentación corta | 480 | 16 | Example subsection/guide connected to a real short-output setting |
| 7 | Portugal | carta de apresentação exemplos | 720 | 19 | Native examples hub; useful discovery traffic, not all purchase intent |
| 8 | Brazil | como fazer carta de apresentação | 1,900 | 23 | Instructional page with a grounded before/after example and tool CTA |
| 9 | Spain | modelo carta de presentación | 1,000 | 16 | Template/example cluster; keep usable examples rather than a thin doorway |
| 10 | France | lettre de motivation ia avec cv | 30 | 26 | Smaller but close to the existing document-upload capability; explain CV limits |

Some returned strings are grammatically awkward (for example `carta de apresentação no curriculo`). Preserve raw query spelling in the evidence export but write natural headings and copy. Exclude `carta de apresentação empresa` when it means a company introducing its services, and Russian court/visa/document cover-letter queries. Do not publish pages for unsupported workflows or promise no registration when current generation requires login.

### Historical observations, with narrow conclusions

| Country and exact term | Returned series | Supported interpretation |
| --- | --- | --- |
| France: lettre de motivation ia | Jun 2026: 720; Jul: 480; Aug: 480; Sep: 1,000 | The latest observed month rebounded after July/August. Four points do not establish annual seasonality or sustained growth |
| Brazil: carta de apresentação | May 2026: 12,100; Jun: 8,100; Jul: 8,100; Aug: 12,100 | Broad letter interest recovered in August; this is not a measurement of AI-generator adoption |
| Portugal / Spain | No overview series returned | No growth percentage or seasonality claim |
| Russia | Wordstat blocked by sign-in | No numeric demand/trend claim |

## 6. Localization and content plan

Do not create dozens of translated doorway pages from one English template. For each selected market, first make the principal job-cover-letter page, input controls, result actions, error messages and review states coherent in that language. The current routing intentionally canonicalizes several untranslated resource/legal/pricing pages to English; translated navigation alone is not enough to change those canonicals. Fully localize the body before expanding indexing, sitemap and alternate-language coverage.

Use native search terminology close to the live product: `сопроводительное письмо`, `lettre de motivation`, `carta de apresentação` and `carta de presentación`. Keep brand-focused hero wording if desired, but make the page title and explanatory heading clearly describe the job-letter tool. One Portuguese route can initially support an explicit country/variant choice; separate Brazil/Portugal public URLs require a deliberate URL, canonical and hreflang plan rather than duplicated translated pages.

Recommended initial content clusters per language: main generator explanation; one evidence-based guide; examples for first job/no experience and one genuine professional use case; a short-letter example; a transparent upload/privacy/export explanation. University application traffic stays in a deferred research backlog. Avoid generic business-letter, visa, court and academic-admission acquisition promises until the corresponding feature is explicitly released.

## 7. Delivery order and validation

1. **Reliability and honesty:** ensure the correct reachable hosted `/generate/` URL is configured; diagnose review-unavailable logs without exposing secrets; distinguish draft failure, review failure and save failure; align URL-reading and data-storage copy with reality. Resolve any local syntax/build blocker separately before deploying.
2. **Complete existing UI localization:** translate dashboard/editor/review/error surfaces, maintain explicit output language, introduce a considered pt-BR/pt-PT preference. Do not change the sidebar or expose deferred workflows.
3. **Evidence quality:** distinguish applicant facts from job requirements, omit unavailable contact data, preserve responsibility level and supplied names, and keep review warnings anchored to the exact final text.
4. **Document usefulness:** reliable copy/export, legible Cyrillic/accents, predictable paragraph and page-break behavior. Current PDF export is canvas/image-based, so it is not automatically a text-selectable/ATS-readable PDF. Offer honest plain-text copying now; consider selectable-text PDF/DOCX and edited-draft persistence as separate future work.
5. **SEO acquisition:** implement the highest-intent native cluster with real examples, consistent language and accurate canonicals. Measure user success rather than just visits.
6. **Optional output enrichments:** only add a display title, subject, missing-data questions or role-alignment panel when a specific UI consumer and validation rules exist. Preserve backwards compatibility and allow null/empty values for absent facts.

For each market, build a fixed evaluation set covering sparse input, CV + vacancy, no experience, contradictory data, accents/Cyrillic, missing name/contacts, long input, wrong-language instructions and prompt-injection attempts. Separate pt-BR from pt-PT and use native human review. Assess supported claims, correct names/numbers, language/register, concision, placeholder absence and export readability. This research did not execute that benchmark or establish quality percentages.

Instrument anonymous funnel events such as generator opened, request succeeded/failed, review unavailable, result edited, copied and PDF export success. Segment by explicitly selected output language/market and device where available. Do not send prompts, names, contact information, uploaded CV text or letter contents as analytics event properties. Traffic analytics alone cannot prove document quality or job outcomes.

## 8. Recommended final scope

For today's product, retain one plain-text generated letter and the existing bounded structured review. Keep transport metadata on the server, use app-owned titles/history/state, and calculate counts/export locally. Make the five markets feel native and make factual/review limits visible before adding more AI output fields.

The research recommends changes; it does not implement them. No app code, environment values, production settings, plan access or database schema was changed by this report.
