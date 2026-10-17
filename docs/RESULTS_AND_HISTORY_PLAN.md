# Result pages and persistent chat history

Updated 16 October 2026. Persistent history is now implemented using the existing sidebar, generation, account-store and result-page components.

## Implemented behavior

- Every valid generation automatically stores an owned conversation and user/assistant turn pair. Manually saving a draft is no longer required to keep generated chat history.
- Sidebar: New chat, recent chats grouped by Today/Earlier, selected chat, pending/failed/interrupted status, Rename/Delete dialogs and cursor-based Load older chats (20 per page). Mobile and collapsed navigation expose a history button that opens the existing sidebar.
- Durable result URLs: /[locale]/dashboard/{cover-letter|university|email|research}/result?chat=<uuid>. Reloading fetches owned messages and sources from the server. The same links work on another signed-in device.
- Result pages show the selected generated artifact in the existing editor, plus a collapsible conversation containing user prompts and assistant responses. Earlier responses can be opened without overwriting original history. Message pagination loads 50 at a time.
- Continue chat reuses the existing form and the same conversation ID. The next generation creates another turn pair. New chat clears the brief/URLs but retains profile preferences. Logout clears local drafts; persisted history remains private to its owner.
- Manual Saved drafts and Share feedback submission were removed. Editor changes can be copied/exported; chat messages retain original generated text. Deleting a chat deletes its messages.

## Persistence and ownership

Migration 202610160001_chat_history adds app.conversations and app.messages, owner/chronology indexes, constraints, private-table RLS and atomic start/finish functions. The Prisma schema maps the new tables. No billing tables, prices, balances or generation quota policies were changed. The later `202610160002_remove_saved_drafts` migration removes the dedicated manual-draft table without CASCADE; published reviews remain shared with the landing page.

Every read, cursor page, rename, delete, append and finish is scoped to the authenticated server identity. Client-supplied owner IDs are ignored. Cross-user and unknown conversation IDs return unavailable/not-found responses without exposing content. Foreign request IDs cannot replay another user's result.

Prompts and validated text input/settings are stored so a chat can reopen; extracted attachment text can therefore be retained in the owned input context. Binary uploads, API keys and provider error bodies are not stored. Source links are retained with assistant responses. The app does not expose raw gateway routing diagnostics.

## Request lifecycle and failures

The client sends a UUID request ID and retains it for an ambiguous network retry of the same payload. The server atomically creates one pending user/assistant pair. Concurrent duplicates do not run another gateway request; completed duplicates replay saved output. Conflicting payloads/owners are rejected. Pending turns in one chat do not overlap.

Provider failure marks both turns failed with a safe message. A gateway success followed by a storage failure still delivers the draft with an explicit not-saved warning; it does not automatically repeat the gateway call. The user can copy/export the result. A pending request older than five minutes appears interrupted and can be replaced by an explicit new attempt; it is not automatically retried.

Pending history refreshes every five seconds while generation is active or a visible request remains pending. This is polling, not realtime push. Other-device changes are available on the next history reload.

## Model context and current limits

The gateway still receives only POST /api/v1/query/ with the existing server app key. No quota, credit charging, Gemini SDK, key claims or direct model calls were reintroduced.

Existing writing/research template text is unchanged. A clearly labelled untrusted conversation-context block can follow the current task. Only the most recent complete message texts that fit are included, capped at six messages and the gateway's total 4,096-character limit. Older history remains visible even when it is outside model context. Long messages are not silently cut; a current task that alone exceeds the contract is rejected before history/gateway execution.

This does not promise unlimited ChatGPT-style context memory. Extending the external gateway contract, adding structured system/source fields and evaluating factuality remain separate work. Rich formatting and subsequent editor changes are not persisted in history; generated content is plain text.

## Verification

102 automated tests passed, including migrations, owner isolation, request replay/conflict, pending/failed/interrupted states, pagination, cascade deletion and gateway regressions. Production build, TypeScript and Prisma validation passed. A temporary schema-only Neon branch verified eight real concurrent starts: one created, seven pending duplicates, completed replay and owner isolation. The additive migration was then applied to the existing main database; the temporary branch was deleted.

Browser checks passed for all four result pages, reopening after refresh, rename, delete, collapsed sidebar and 390px mobile history navigation. These success fixtures used controlled AI output with the real server handlers, database and browser. A real gateway attempt failed upstream; its error popup, persisted failed turn and Continue chat input restoration were verified. Live successful model generation is therefore not claimed here. A 768px follow-up navigation check did not complete and is not counted as passed. The disposable test account and all owned fixtures were removed. No deployment, payment activation or quota change is part of this task.
