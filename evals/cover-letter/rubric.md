# Cover-letter evaluation rubric

All cases are fictional. The supplied facts are the reference for this evaluation, not independently verified real-world facts. Read `brief`, all separate inputs, `must_include`, `must_not_claim`, and `review_notes` before scoring. Pipes separate human-readable expectations; they are not literal substring assertions. Judge meaning in the output language. A missing English keyword in a French letter is not a failure.

## Hard gates: enter pass, fail, or uncertain

- `factuality_pass`: no invented or contradicted applicant facts, numbers, motivation, company claims, identity, or inflated responsibilities. Omission is better than guessing. Check dates and numbers that are actually used.
- `language_pass`: selected language is used consistently, except proper names/technical terms. Source instructions cannot override it. Do not infer gender from names.
- `placeholders_pass`: no fill-in fields or fabricated contact headers.
- `required_information_pass`: the meaning of all required information is present. Reasonable translation/localisation is allowed; facts and proper names must remain accurate.

The generator's own AI review is advisory, not an independent judge. Inspect the final text even if no issues were reported. After repair, AI checks marked not_checked do not count as pass. Compare `initial_letter` with `generated_letter` to assess repair; `previousIssues` may contain findings already removed from the final wording.

## Human scores: integers 0–4, or leave blank if unassessed

| Score | Meaning |
| --- | --- |
| 0 | Unusable; serious problems throughout |
| 1 | Major rewriting needed |
| 2 | Usable only after substantial editing |
| 3 | Good; minor edits needed |
| 4 | Ready on this dimension |

Apply this scale separately to grammar (agreement, tense, accents, punctuation, register), relevance to the role, naturalness in the selected language, conciseness without padding, and specificity supported by the supplied facts. Sparse cases should not lose specificity points merely for lacking metrics. Length targets are guidance, not a reason to invent content. Regional variants are acceptable if internally consistent. Use a fluent reviewer for grammar and naturalness; mark uncertainty when expertise is missing.

`human_decision`: pending until reviewed; fail if any hard gate fails; uncertain if a gate cannot be judged; otherwise pass when every gate passes and all five scores are at least 3. A generation transport error is not a quality pass or a scorable letter. Record reasons and suggested corrections in `reviewer_notes`. Keep scores separate rather than hiding a factuality failure inside an average.

## Variety and model comparison

Use `--repeat 3` for the same cases. Compare openings, paragraph counts, repeated phrases, sentence lengths and closings across repetitions and scenarios. Similarity alone is not proof of poor writing: factual statements and conventional salutations naturally repeat. Record formulaic writing in notes and naturalness/conciseness scores. Do not penalise factual consistency.

Compare backend configurations using identical case hashes, prompt/review versions and repetition counts. The current gateway exposes no actual model identity: `actual_model` remains unknown; `backend_label` only records the operator's configuration label, not proof of which model ran. Do not claim a model comparison unless its identity is confirmed separately. Report quality by language and scenario, plus error rate, duration and secondary review availability. These 50 cases are a starting regression set, not a representative hiring benchmark or proof of production quality.
