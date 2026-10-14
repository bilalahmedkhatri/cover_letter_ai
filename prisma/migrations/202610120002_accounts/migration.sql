CREATE SCHEMA IF NOT EXISTS app;
CREATE TABLE app.profiles (
  user_id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  skills text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'English',
  tone text NOT NULL DEFAULT 'Professional',
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app.documents (
  id uuid PRIMARY KEY,
  user_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('letter','email','research')),
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  content text NOT NULL CHECK (length(content) <= 20000),
  context jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX documents_owner_updated ON app.documents(user_id,updated_at DESC);
CREATE TABLE app.reviews (
  id uuid PRIMARY KEY,
  user_id text NOT NULL UNIQUE,
  display_name text NOT NULL CHECK (length(display_name) BETWEEN 1 AND 80),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL CHECK (length(content) BETWEEN 20 AND 1500),
  publish_consent boolean NOT NULL CHECK (publish_consent),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','published','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE app.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON SCHEMA app FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA app FROM PUBLIC;
