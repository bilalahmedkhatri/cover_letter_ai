-- MANUAL ONLY. Never imported or executed by the app.
-- Empty app database only; existing installations use the admin migration owner.
-- Sources: schema_v1.py + schema_v2.py + schema_v3.py (blog_0003).
BEGIN;

CREATE TABLE public.blog_schema_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT blog_schema_version_pkc PRIMARY KEY (version_num)
);

-- Frozen empty-database provisioning snapshot matching blog_0003.

CREATE TABLE public.blog_assets (
    id SERIAL NOT NULL, 
    object_key VARCHAR(1024) NOT NULL, 
    public_url TEXT NOT NULL, 
    original_filename VARCHAR(255) NOT NULL, 
    media_type VARCHAR(127) NOT NULL, 
    size_bytes BIGINT NOT NULL, 
    width INTEGER, 
    height INTEGER, 
    duration_seconds FLOAT, 
    alt_text TEXT DEFAULT '' NOT NULL, 
    caption TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    uploaded_by_membership_id INTEGER,
    PRIMARY KEY (id), 
    CONSTRAINT ck_blog_assets_filename CHECK (length(trim(original_filename)) > 0), 
    CONSTRAINT ck_blog_assets_width CHECK (width IS NULL OR width > 0), 
    CONSTRAINT ck_blog_assets_object_key CHECK (length(trim(object_key)) > 0), 
    CONSTRAINT ck_blog_assets_media_type CHECK (length(trim(media_type)) > 0), 
    CONSTRAINT uq_blog_assets_object_key UNIQUE (object_key), 
    CONSTRAINT ck_blog_assets_height CHECK (height IS NULL OR height > 0), 
    CONSTRAINT ck_blog_assets_public_url CHECK (public_url LIKE 'https://%'), 
    CONSTRAINT ck_blog_assets_size CHECK (size_bytes >= 0), 
    CONSTRAINT ck_blog_assets_duration CHECK (duration_seconds IS NULL OR duration_seconds >= 0)
);

CREATE TABLE public.blog_categories (
    id SERIAL NOT NULL, 
    name VARCHAR(128) NOT NULL, 
    normalized_name VARCHAR(160) NOT NULL, 
    slug VARCHAR(160) NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT ck_blog_categories_name CHECK (length(trim(name)) > 0), 
    CONSTRAINT ck_blog_categories_normalized_name CHECK (length(trim(normalized_name)) > 0), 
    CONSTRAINT uq_blog_categories_normalized_name UNIQUE (normalized_name), 
    CONSTRAINT ck_blog_categories_slug CHECK (length(trim(slug)) > 0), 
    CONSTRAINT uq_blog_categories_slug UNIQUE (slug)
);

CREATE TABLE public.blog_posts (
    id SERIAL NOT NULL, 
    locale VARCHAR(35) DEFAULT 'en' NOT NULL, 
    title VARCHAR(300) NOT NULL, 
    slug VARCHAR(200) NOT NULL, 
    excerpt TEXT DEFAULT '' NOT NULL, 
    category_id INTEGER, 
    content_json JSONB NOT NULL, 
    content_schema_version INTEGER DEFAULT '1' NOT NULL, 
    metadata_json JSONB DEFAULT '{}' NOT NULL, 
    author_name VARCHAR(160) NOT NULL, 
    author_designation VARCHAR(160),
    author_description TEXT, 
    author_avatar_url TEXT, 
    cover_asset_id INTEGER, 
    status VARCHAR(16) DEFAULT 'draft' NOT NULL, 
    version INTEGER DEFAULT '1' NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    published_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    CONSTRAINT uq_blog_posts_locale_slug UNIQUE (locale, slug), 
    CONSTRAINT ck_blog_posts_locale CHECK (length(trim(locale)) > 0), 
    CONSTRAINT ck_blog_posts_document CHECK (COALESCE(jsonb_typeof(content_json) = 'object' AND content_json->>'type' = 'doc' AND jsonb_typeof(content_json->'content') = 'array', false)), 
    CONSTRAINT ck_blog_posts_slug CHECK (length(trim(slug)) > 0), 
    CONSTRAINT ck_blog_posts_status CHECK (status IN ('draft', 'published', 'archived')), 
    CONSTRAINT ck_blog_posts_title CHECK (length(trim(title)) > 0), 
    FOREIGN KEY(category_id) REFERENCES public.blog_categories (id) ON DELETE RESTRICT, 
    CONSTRAINT ck_blog_posts_metadata CHECK (jsonb_typeof(metadata_json) = 'object'), 
    CONSTRAINT ck_blog_posts_author CHECK (length(trim(author_name)) > 0), 
    CONSTRAINT ck_blog_posts_content_version CHECK (content_schema_version > 0), 
    CONSTRAINT ck_blog_posts_publication CHECK (status <> 'published' OR published_at IS NOT NULL), 
    CONSTRAINT ck_blog_posts_version CHECK (version > 0), 
    FOREIGN KEY(cover_asset_id) REFERENCES public.blog_assets (id) ON DELETE RESTRICT
);

CREATE INDEX ix_blog_posts_category_status ON public.blog_posts (category_id, status);

CREATE INDEX ix_blog_posts_status_published_at ON public.blog_posts (status, published_at);

CREATE INDEX ix_blog_assets_uploader_id ON public.blog_assets (uploaded_by_membership_id, id);

INSERT INTO public.blog_schema_version (version_num) VALUES ('blog_0003') RETURNING public.blog_schema_version.version_num;

COMMIT;

