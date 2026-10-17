# Test cover-letter generation and writing review

For the editable 50-case CSV dataset, offline validation, repeatable live pipeline runs and human scoring, see [CSV evaluation guide](../evals/cover-letter/README.md).

Start FastAPI with the existing compatible model/provider configuration, then start this application with `npm run dev`. The server-side service key must allow `POST /api/v1/generate/`.

## What is being tested

Browser → authenticated Next.js `/api/generate` → generation → local checks and AI review → optional one repair → final draft/history/review metadata.

FastAPI Swagger only tests prompt generation. It does **not** exercise Next.js schema validation, review, repair, history or browser navigation. Test the complete feature in the Next.js dashboard.

## UI checks

1. Open `http://localhost:3000/en/dashboard` and sign in. Use New chat and select English as Output language.
2. Submit fictional input:

   > Alex Example is applying for Junior Web Developer at Example Studio. My only experience is building one portfolio using HTML and CSS. The job asks for Python and team leadership, which I have not done. No degree, years of experience, percentages, company research or contact details are supplied. Keep the letter short and factual.

3. Confirm navigation to `.../dashboard/cover-letter/result?chat=...`, the letter editor, and the **Writing review** section below it. Check that Python/leadership requirements were not turned into candidate experience. Inspect any highlighted excerpts and explanations.
4. If **One automatic revision was applied** appears, expand **Issues found before revision**. Those quotations refer to the earlier draft. Final semantic checks show **Not checked** because no second AI review is performed after repair. Do not interpret repair as proof that all issues were fixed.
5. Refresh or reopen the chat from history. Review metadata should remain with the generated answer. Old drafts created before this feature show that no writing review exists; opening them does not trigger new AI calls.
6. Edit a word in the letter. The review should change to **You edited this draft… Your changes have not been checked**. Old review results must not certify edited content. Existing manual edits are not automatically saved by this feature.
7. Start fresh chats for Russian, Spanish, French and Portuguese. Select the language explicitly. For one request, include a conflicting request for English inside the brief while selecting French; the selected language must take precedence. Check output language and natural writing with a fluent reviewer.

A clean initial draft may show **AI found no issues** and no repair. This is normal and is not independently verified factuality or grammar. Model behavior is nondeterministic: manual prompts cannot guarantee that an error/repair will occur. Use the mocked regression tests below to exercise every branch reliably.

## API response inspection

In browser DevTools → Network → `/api/generate` → Response, inspect:

```json
{
  "text": "Final letter",
  "qualityReview": {
    "version": "cover-letter-review.v1",
    "checks": {
      "structure": "passed",
      "factuality": "not_checked",
      "grammar": "not_checked",
      "language": "not_checked"
    },
    "issues": [],
    "previousIssues": [],
    "repair": {"attempted": false, "applied": false},
    "warnings": []
  }
}
```

This is an abbreviated response; real responses also include `textHash`, history IDs and save status. The check values depend on the executed checks; they must not be assumed to match this example.

- `issues`: current anchored findings; numerical checks are conservative heuristics.
- `previousIssues`: findings for the earlier wording before an applied revision.
- `review_unavailable`: AI review failed, timed out, returned malformed/unanchored JSON, or could not run within the budget.
- `repair_unavailable`: the revision failed, was unchanged, introduced a new local placeholder/percentage warning, or could not fit the remaining budget.
- `context_limit`: review or repair context exceeded the configured gateway limit; no text was silently truncated.
- `revised_text_not_reviewed`: revised text has only had final local checks.
- `qualityWarning`: advisory metadata could not be persisted, even if the letter itself was saved.

Do not copy session cookies or API keys into shared bug reports. The browser only calls Next.js; the FastAPI service key stays on the server.

## Repeatable automated checks

```powershell
npm run test:cover-letter
node --test --test-isolation=none tests/history.test.mjs tests/feature-access.test.mjs tests/gateway-consumption.test.mjs
npm run build
```

Tests cover clean/no-repair output, multilingual placeholders, unsupported percentages, repeated paragraphs, anchored AI findings, one repair maximum, unchanged/failed/unsafe repair, stale/unavailable review states, context/deadline limits, private metadata persistence and duplicate replay. Provider responses are mocked; history uses an isolated database. The HTTP integration test binds a local mock server and may need permission outside a restricted Windows sandbox.

Each real cover letter normally makes **two provider requests** (generation and review), or up to **three** if a repair is attempted. FastAPI retains its own model fallback behavior. Next.js adds no automatic transport retry. The generation/review/repair work has a 90-second total budget, with review and repair individually capped at 25 seconds. The Next.js route allows up to 180 seconds to accommodate auth/history/storage around those calls; deployment hosting limits must support that setting. Provider/account limits still apply.

Review metadata uses the existing assistant-message JSON context. No migration is required. Letter completion and advisory metadata use separate owner-scoped writes; a metadata save failure does not discard a usable letter. A duplicate completed request replays its saved letter/review without generating again.
