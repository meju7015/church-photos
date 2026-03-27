-- Add bulletin_id to comments table (nullable, for bulletin comments)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS bulletin_id UUID REFERENCES bulletins(id) ON DELETE CASCADE;

-- Make album_id nullable (was NOT NULL before, now either album_id or bulletin_id should be set)
ALTER TABLE comments ALTER COLUMN album_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comments_bulletin_id ON comments(bulletin_id);
