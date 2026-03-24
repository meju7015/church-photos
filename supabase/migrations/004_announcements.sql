-- ============================================
-- 004: 공지사항 테이블
-- ============================================

CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  pinned BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_announcements_pinned ON announcements(pinned DESC, created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 모든 인증 사용자 읽기 가능
CREATE POLICY "announcements_select" ON announcements
  FOR SELECT TO authenticated USING (true);

-- admin/teacher만 생성 가능
CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );

-- admin만 수정/삭제 가능
CREATE POLICY "announcements_update" ON announcements
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR created_by = auth.uid()
  );

CREATE POLICY "announcements_delete" ON announcements
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR created_by = auth.uid()
  );
