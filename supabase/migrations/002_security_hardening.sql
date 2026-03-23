-- Phase 1-2: invite_codes UPDATE 정책 강화
DROP POLICY IF EXISTS "invite_codes_update" ON invite_codes;
CREATE POLICY "invite_codes_update" ON invite_codes FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR (used_by IS NULL AND auth.uid() IS NOT NULL)  -- 가입 시 사용 처리 허용
  );

-- Phase 1-3: notifications INSERT 정책 강화
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );

-- Phase 1-1: Storage RLS 강화 (경로 기반)
DROP POLICY IF EXISTS "photo_upload" ON storage.objects;
DROP POLICY IF EXISTS "photo_select" ON storage.objects;
DROP POLICY IF EXISTS "photo_update" ON storage.objects;
DROP POLICY IF EXISTS "photo_delete" ON storage.objects;

-- 업로드: 해당 반 소속 사용자만
CREATE POLICY "photo_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'photo'
    AND (
      EXISTS (
        SELECT 1 FROM user_classes
        WHERE user_id = auth.uid()
        AND class_id::text = (string_to_array(name, '/'))[1]
      )
      OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- 조회: 해당 반 소속 사용자만
CREATE POLICY "photo_select" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'photo'
    AND (
      EXISTS (
        SELECT 1 FROM user_classes
        WHERE user_id = auth.uid()
        AND class_id::text = (string_to_array(name, '/'))[1]
      )
      OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- 삭제: 업로더 본인 또는 admin
CREATE POLICY "photo_delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'photo'
    AND (
      owner = auth.uid()
      OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- 업데이트
CREATE POLICY "photo_update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'photo'
    AND (
      owner = auth.uid()
      OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- albums UPDATE 정책 추가 (수정 기능용)
CREATE POLICY "albums_update" ON albums FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
