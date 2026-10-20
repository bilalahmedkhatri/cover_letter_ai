BEGIN;
-- Preserve all existing titles, including previously renamed conversations.
ALTER TABLE app.conversations ADD COLUMN title_source text NOT NULL DEFAULT 'manual'
  CHECK (title_source IN ('fallback','ai','manual'));
-- The existing start_chat_generation function inherits this for new chats.
ALTER TABLE app.conversations ALTER COLUMN title_source SET DEFAULT 'fallback';
COMMIT;
