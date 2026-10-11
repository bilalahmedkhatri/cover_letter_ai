# Public comparison evidence

Checked October 12, 2026 (Asia/Karachi), using the vendors' official published pages.

| Product | Selected paid plan | Published USD price | Source |
| --- | --- | --- | --- |
| ailettergen | Starter, planned | $10 / 30 days | `services/billingPlans.mjs`; paid checkout remains disabled |
| Rezi | Pro | $29 / month | https://www.rezi.ai/pricing |
| Teal | Teal+ | $29 / 30 days | https://www.tealhq.com/pricing |

Rezi and Teal include broader resume/job-search workflows and offer free options. Rezi Pro includes a monthly expert resume review. Teal has other billing periods. This comparison is between the specified paid plans, not a claim of equivalent features, unlimited usage, lowest market price or superior generated writing. Prices may change; taxes, currency conversion and promotions may differ. Our Plus $20 and Pro $28 are below these two specific $29 prices, not all competitors.

Kickresume was excluded from the displayed price table: its primary pricing page did not expose a price in the retrieved text, and the official general FAQ includes an older published monthly price. Do not use that FAQ alone to assert today's price.

Google's people-first guidance supports useful original content that helps a reader make a decision. We supply context, source links and meaningful product differences rather than a thin price keyword page. This does not constitute Google's approval, a ranking guarantee or a legal guarantee against competitor objections.

Reference: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

## Implementation

- Two landing sections: concrete writing evidence, and a qualified pricing comparison.
- Features, Writing Guides and Compare pages; complete English/Russian bodies, explicit English fallback notices for other UI locales, accurate EN/RU hreflang.
- Guides apply purpose-specific instructions to the generator without inventing personal facts or replacing the user's profile.
- Draft review is local: Unicode word segmentation, optional maximum and common placeholder detection. It is not an ATS score or factual verification.
- TXT download and multipage PDF export; clipboard failures are reported rather than claiming success.
- Existing Radix components are reused for accessible resource navigation, with no added dependencies.
