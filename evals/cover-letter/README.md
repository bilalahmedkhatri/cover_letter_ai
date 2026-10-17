# CSV cover-letter evaluations

`cases.csv` contains **50 fictional cases: 10 scenarios × 5 output languages**. Inputs are in English intentionally to test selected-language generation across English, Russian, Spanish, French and Portuguese. This does not yet cover native-language input for every locale. Accented names and multiline document fields exercise Unicode/CSV handling.

Edit the file in Excel or another CSV editor; save as **CSV UTF-8 (comma delimited)**, keeping the headers unchanged. Use a proper CSV editor to preserve commas, quotes and multiline cells. Every case has a unique `case_id`; `brief` maps to the generator's description, `resume_text` to document text, and the remaining applicant/settings fields map to the existing Zod input schema. Empty tone/length defaults to Professional/short. Separate expectations with ` | ` for readability. Expectations guide human scoring and are not sent to the model. Do not add real applicant CVs or personal information to this tracked dataset.

From the repository root:

```powershell
# Offline validation; no service key, server or network needed
npm run eval:cover-letter

# One live case first; existing FastAPI service and .env.local key required
npm run eval:cover-letter -- --live --case sparse-details-fr-01 --label gateway-config-a

# Filter a language, cap selected cases, repeat for writing variety
npm run eval:cover-letter -- --live --language French --limit 2 --repeat 3 --label gateway-config-a

# Whole dataset (up to 150 gateway requests before backend fallbacks)
npm run eval:cover-letter -- --live --label gateway-config-a

# Repeatable isolated runner tests (mocked provider)
npm run test:cover-letter-eval
```

Validation happens before dispatch. `--case` and `--language` match exact case ID/language names. `--limit` applies before `--repeat`; positive integer options accept 1–1000. All selected cases are validated even when only one will run. Sequential execution avoids an automatic burst of concurrent model requests. There are no runner retries; the existing pipeline retains its one-review/optional-one-repair policy and timeout budget.

Live runs reuse **generation → review → optional repair**, with a fresh empty conversation for each sample. This is a local operator tool calling the service gateway directly: it does not test browser routing, app authentication, user quota/billing, or history persistence and does not charge an app user's quota. Gateway/provider usage still costs money. Do not expose this runner as a public endpoint. Next.js need not be running.

Each run creates a new UTF-8 BOM CSV under `results/`; `--output path.csv` can choose another location. Existing files are never overwritten. Completed rows are appended immediately, so interruption preserves prior results. Request failures are recorded and processing continues; a run with generation failures exits nonzero. A generated letter with an unavailable review is still `generated`, with warnings in `quality_review`—not automatically passed. Stage counters count attempted pipeline calls (preflight rejection may occur before HTTP), not backend fallback calls or token billing.

`results/template.csv` shows all result columns. Open the generated file and use [rubric.md](rubric.md) to fill blank human gate/score columns and change `human_decision` from pending. Actual model identity stays unknown because the current response does not expose it. Record a backend configuration label with `--label`, but do not treat that label as verified model identity. `case_hash` fingerprints the validated fixture row; `run_id` groups samples. Both initial and final wording plus the review JSON are saved. There is no AI scoring service or automated semantic pass/fail judge in this runner.

Result free-text cells starting like spreadsheet formulas receive a leading apostrophe for safe viewing. This is an export escape, not model wording. The CSV file itself is the review artifact; numbers and statuses must be interpreted using the rubric. New run CSVs are locally ignored by Git; only the empty template is tracked. Review output before sharing.
