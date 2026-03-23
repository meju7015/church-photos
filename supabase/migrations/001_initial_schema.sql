-- 부서 테이블
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
);

-- 반 테이블
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- 사용자 프로필 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kakao_id TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('admin', 'teacher', 'parent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 사용자-반 매핑 (다대다)
CREATE TABLE user_classes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('teacher', 'parent')),
  PRIMARY KEY (user_id, class_id)
);

-- 초대 코드 테이블
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('teacher', 'parent')),
  created_by UUID NOT NULL REFERENCES users(id),
  used_by UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 앨범 테이블
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 사진 테이블
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 댓글 테이블
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 알림 테이블
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_album', 'new_comment')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_classes_department ON classes(department_id);
CREATE INDEX idx_user_classes_user ON user_classes(user_id);
CREATE INDEX idx_user_classes_class ON user_classes(class_id);
CREATE INDEX idx_albums_class ON albums(class_id);
CREATE INDEX idx_albums_created_at ON albums(created_at DESC);
CREATE INDEX idx_photos_album ON photos(album_id);
CREATE INDEX idx_comments_album ON comments(album_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);

-- RLS 활성화
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책: departments (모든 인증 사용자 조회 가능)
CREATE POLICY "departments_select" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "departments_admin" ON departments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS 정책: classes (모든 인증 사용자 조회 가능)
CREATE POLICY "classes_select" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "classes_admin" ON classes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS 정책: users
CREATE POLICY "users_select" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "users_insert" ON users FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- RLS 정책: user_classes
CREATE POLICY "user_classes_select" ON user_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_classes_admin" ON user_classes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

-- RLS 정책: invite_codes
CREATE POLICY "invite_codes_select" ON invite_codes FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    OR used_by IS NULL
  );
CREATE POLICY "invite_codes_insert" ON invite_codes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher')));
CREATE POLICY "invite_codes_update" ON invite_codes FOR UPDATE TO authenticated USING (true);

-- RLS 정책: albums (해당 반 소속 사용자만 조회)
CREATE POLICY "albums_select" ON albums FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_classes WHERE user_id = auth.uid() AND class_id = albums.class_id)
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "albums_insert" ON albums FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );
CREATE POLICY "albums_delete" ON albums FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS 정책: photos
CREATE POLICY "photos_select" ON photos FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums a
      JOIN user_classes uc ON uc.class_id = a.class_id
      WHERE a.id = photos.album_id AND uc.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "photos_insert" ON photos FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums a
      JOIN user_classes uc ON uc.class_id = a.class_id
      WHERE a.id = photos.album_id AND uc.user_id = auth.uid()
    )
  );
CREATE POLICY "photos_delete" ON photos FOR DELETE TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS 정책: comments
CREATE POLICY "comments_select" ON comments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums a
      JOIN user_classes uc ON uc.class_id = a.class_id
      WHERE a.id = comments.album_id AND uc.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "comments_insert" ON comments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums a
      JOIN user_classes uc ON uc.class_id = a.class_id
      WHERE a.id = comments.album_id AND uc.user_id = auth.uid()
    )
  );
CREATE POLICY "comments_delete" ON comments FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS 정책: notifications (본인 알림만)
CREATE POLICY "notifications_select" ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- 시드 데이터: 부서
INSERT INTO departments (name, sort_order) VALUES
  ('영아부', 1),
  ('유아부', 2),
  ('유치부', 3),
  ('초등부', 4),
  ('중등부', 5),
  ('고등부', 6),
  ('청년부', 7),
  ('1선교회', 8),
  ('2선교회', 9),
  ('3선교회', 10),
  ('4선교회', 11),
  ('5선교회', 12);

-- Storage 버킷 (Supabase 대시보드에서 생성하거나 아래 SQL 사용)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', false);
