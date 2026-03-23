-- Storage RLS 정책: 인증된 사용자 업로드/조회/삭제 허용
CREATE POLICY "photo_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photo');

CREATE POLICY "photo_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'photo');

CREATE POLICY "photo_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'photo');

CREATE POLICY "photo_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'photo');
