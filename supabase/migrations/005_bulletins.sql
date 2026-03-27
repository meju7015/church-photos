-- Bulletins table
CREATE TABLE IF NOT EXISTS bulletins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bulletin reads table
CREATE TABLE IF NOT EXISTS bulletin_reads (
  bulletin_id UUID NOT NULL REFERENCES bulletins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (bulletin_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_bulletins_class_id ON bulletins(class_id);
CREATE INDEX IF NOT EXISTS idx_bulletins_created_at ON bulletins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulletin_reads_user_id ON bulletin_reads(user_id);

ALTER TABLE bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bulletins_select" ON bulletins
  FOR SELECT USING (
    class_id IN (SELECT uc.class_id FROM user_classes uc WHERE uc.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "bulletins_insert" ON bulletins
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher'))
  );

CREATE POLICY "bulletins_update" ON bulletins
  FOR UPDATE USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "bulletins_delete" ON bulletins
  FOR DELETE USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "bulletin_reads_select" ON bulletin_reads
  FOR SELECT USING (true);

CREATE POLICY "bulletin_reads_insert" ON bulletin_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());
