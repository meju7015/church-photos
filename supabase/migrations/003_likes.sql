-- 좋아요 테이블
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(album_id, user_id)
);

CREATE INDEX idx_likes_album ON likes(album_id);
CREATE INDEX idx_likes_user ON likes(user_id);

-- RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select" ON likes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "likes_insert" ON likes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "likes_delete" ON likes FOR DELETE TO authenticated
  USING (user_id = auth.uid());
