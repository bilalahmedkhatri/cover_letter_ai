# Dashboard and generation audit

Updated 16 October 2026. The active request path now uses the query gateway only. [Gateway and prompt implementation](AI_ROUTING.md) is the current source for setup, contract constraints, template behavior and verification.

The existing dashboard shell, form fields, upload reader, Dialog, editor and save-to-account UI are reused. Generation and upload errors are shown in the existing Dialog. No redundant popup component was added. The paid writing-quality selector was removed while the gateway controls model selection.

Generation no longer checks plans, reserves free quota, charges credits or calls the billing store. Existing prices and database history are preserved. Login and same-origin validation remain.

Business prompt templates are unchanged. The gateway's 4,096-character text-only contract limits attached context; input is rejected explicitly rather than truncated. There is no direct Google SDK, key-claim request or independent page retrieval in the active generation flow.

Pending quality work includes actual system-role instruction support in the gateway, preventing invented experience, language preference precedence, exact admissions limits and multilingual evaluation. These were not silently mixed into the endpoint migration.
