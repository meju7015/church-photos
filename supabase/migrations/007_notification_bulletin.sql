-- notifications 테이블에 bulletin_id 추가, album_id nullable로 변경
ALTER TABLE notifications ALTER COLUMN album_id DROP NOT NULL;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS bulletin_id UUID REFERENCES bulletins(id) ON DELETE CASCADE;

-- type 체크 제약 변경 (new_bulletin 추가)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('new_album', 'new_comment', 'new_bulletin'));

CREATE INDEX IF NOT EXISTS idx_notifications_bulletin ON notifications(bulletin_id);
