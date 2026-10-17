# Cover-letter schema and prompt v1

The Next.js application owns validation, data preparation and writing policy. FastAPI still receives only `{prompt}` at `/api/v1/generate/`; model selection stays in the backend. No database migration is needed.

## Implementation

`services/coverLetter.mjs` defines the shared Zod input schema, prepared-data schema, gateway-response schema and the pure versioned prompt builder. `services/workflow.mjs` delegates cover-letter validation/composition to it. Other workflow validators and templates retain their existing behavior.

The form validates cover-letter input before submission; the server independently validates it again. Cover letters support English, Russian, Spanish, French and Portuguese. Both the overview composer and detailed form expose the output-language setting. Old unsupported language settings must be reselected; they are not silently converted to another language.

The wire payload remains the existing flat input (`kind`, `description`, `resumeText`, `skills`, `experience`, `name`, `recipient`, `language`, `tone`, `length`, `url`, `customInstruction`, optional `operation`, empty `images`). Missing optional text defaults to empty. Explicit nulls, coercion, malformed Unicode, non-text attachments, unsafe URL schemes and credential-bearing URLs fail validation. Unknown input fields are stripped, including forged prepared evidence, model settings and template versions. The handler separately validates/authorizes conversation IDs as before.

Text field limits count Unicode code points before outer whitespace is trimmed. Interior formatting is preserved. Limits: name 120, recipient 160, description 6,000, resume text 12,000, skills 4,000, experience 6,000, custom instructions 2,000, URL 2,048. The combined prompt must also fit configured gateway character/JSON-byte limits; field validity does not guarantee model context capacity. There is no silent source truncation.

## Preparation and provenance

The server derives the prepared object itself. It contains:

- `schemaVersion: "1"` and `promptVersion: "cover-letter.v1"`.
- Explicit name/recipient, or null when those structured fields were not supplied.
- Stable source IDs: `brief`, `resume`, `experience`, `skills`.
- The brief marked `mixed_brief`, because the current field can combine instructions, job requirements and applicant assertions.
- Uploaded text marked `mixed_document`: the existing `resumeText` field combines general attachments, which might include job postings. Explicit experience/skills excerpts are `applicant_assertion`, never independently verified evidence.
- Output-language name/code, tone, approximate length and bounded custom instructions.
- A reference URL explicitly marked `contentsRetrieved: false`.
- Source availability (`separate_sources_supplied`, `brief_only`, `url_only`), describing supplied source fields rather than claiming to assess all facts contained inside free text.

Preparation is deterministic: it does not call a model, infer a career stage, extract invented metrics, match keywords into claimed qualifications, or fetch URLs. Source text appears once with its provenance. A supplied name inside a brief stays in the brief; an absent structured name does not mean no name exists anywhere in the input.

## Prompt policy and versions

The complete backend prompt is `coverLetterSystemInstruction + "\n\n" + JSON.stringify(preparedData)`, followed by any newest conversation messages that fit the existing budget. Instructions are text within the backend prompt, not a guaranteed privileged provider system role.

The policy separates job requirements from applicant qualifications, treats prior assistant drafts as untrusted context, prohibits unsupported specifics and tells the model to preserve responsibility levels and proper names. Selected language/tone/length take precedence over conflicting source text. Explicit name/recipient take precedence over the mixed brief; otherwise explicitly supplied brief identity/signature may be used. Custom instructions cannot override factuality or output settings.

Paragraph count, opening and sentence lengths may vary with available evidence. Sparse inputs should produce shorter conservative writing without placeholders or padding. Length defaults are short 120–180, medium 250–350 and long 350–450 words. They are preferences, not language-equivalent hard limits. Conflicting institution/employer constraints, language-region choices and a clarification conversation are later work.

The server attaches the trusted `promptVersion` to conversation input context before history persistence. Clients cannot choose this version. A semantic prompt/preparation change should bump the version and update evaluation cases. Replaying an old request ID after a template version change may conflict with its original persisted input; submit a new request rather than regenerating under the old ID. Old saved draft text remains readable.

## Response validation and practical limits

Zod validates the backend envelope: non-empty well-formed Unicode `answer`, a bounded tracing `request_id`, and `finish_reason` of `stop` or `unknown`. It strips unneeded metadata and preserves the original answer text. Known transport failures and truncation still use the existing safe errors. Unknown finish status is not proof of completeness.

Writing review now adds conservative local checks, a source-based AI factual/grammar/language review, anchored findings and at most one targeted repair. See [testing and review behavior](COVER_LETTER_TESTING.md). AI feedback is not independent verification. Revised text only receives final local checks; semantic statuses reset to not checked. Deterministic sparse-input clarification questions, region-specific writing preferences and production model benchmarking remain later work. The same input across different models can yield different quality.

## Verification

Run `npm run test:cover-letter` for focused schema/prompt/adapter tests. Run the history and feature-access suites for persistence and authorization regressions. Provider replies in these tests are mocked; multilingual fixtures establish Unicode/contract behavior, not native-language writing quality. Live browser/model checks must be reported separately.

Local verification on 17 October 2026: 54 regression tests passed, including isolated HTTP gateway tests, history and access control. TypeScript and the production build passed. Browser checks confirmed the five-option selector and actual generation-to-editor navigation. A French selection overrode a conflicting English instruction in the brief. The first live sparse-input draft still contained contact placeholders and unsupported details; after tightening the missing-data rule, a follow-up draft omitted those placeholders and was shorter, but still added unprovided training/personality claims. This is a working schema/prompt foundation, not a factual-quality pass. Cross-model/native-language evaluation and independent quality checks remain necessary.
