# Cover-letter public launch

`services/workflow.mjs` exports the shared `publicWorkflows` release list. It currently contains only `cover-letter`. All writing/research implementations remain available for development; no tables or prompts are removed.

`server/feature-access.mjs` is used only on the server. Authenticated local development (`NODE_ENV=development`) enables all workflows. Production and preview builds enable private workflows only when the Neon session has a user ID, `emailVerified === true`, and email `bilal.cloudscourt@gmail.com` (case-insensitive). Unverified signups with that email receive no developer privileges. Request bodies, browser storage and custom headers cannot grant access. The email is configured in server source; no new environment variable is required.

Dashboard pages check permissions before rendering the generator/result. The layout sends only allowed workflow names to the existing dashboard context. Navigation and writing-type selectors use this list. Generation APIs reject private operations before history writes or AI calls. History listing, direct reads, rename/delete and new turns enforce the same policy while preserving owner isolation. Existing hidden conversations remain in the database.

Public landing choices, workflow cards, business-email CTAs, guide actions, pricing features and research allowances are filtered using the public launch list. Existing educational blog/reference articles are retained; they do not grant feature access. Billing prices, quota policy and historical allowances are unchanged. Editor prompts cannot act as an authorization boundary: an arbitrary cover-letter brief is still free-form text, not a guarantee that the model cannot write another document type.

Use `npm run dev` for full local development. To test production permissions locally use `npm run build` then `npm run preview`: sign in with a normal account to check the cover-letter-only view, and the verified developer account to check all workflows. Online preview URLs are not access tokens; the same verified-account checks apply there. Do not set a publicly hosted deployment's `NODE_ENV` to development. No deployment is performed automatically.

To launch another workflow, add its existing key to `publicWorkflows`, check the public copy, then build and deploy. Never put the developer allowlist or an access-granting secret in `NEXT_PUBLIC_*` configuration.

## Verification

105 automated tests passed, including verified/unverified developer identity, forged request fields, preview defaults, generation gating before storage/AI, and private history reads/mutations. Production build and TypeScript passed. Public English/Russian landing and pricing were checked in a real browser, with desktop/mobile screenshots. All three private API operations returned 404 for a disposable ordinary account against the production-mode local server using its configured origin. That identity was removed afterward. The real developer account was not impersonated or signed into: its HTTPS dashboard access still needs checking after deployment. A localhost production dashboard navigation returned to login and is not claimed as passed. No deployment or model generation was performed for these browser checks.
