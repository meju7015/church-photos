import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hbhjieqnqinwkivnlcrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiaGppZXFucWlud2tpdm5sY3J3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI0OTAzMSwiZXhwIjoyMDg5ODI1MDMxfQ.yJNjuJJHNeniTyyLwbd2kA73DtVRt2Mu9MFwDBfVgf4'
);

const USER_ID = 'a087338c-0dcc-434b-8257-126e337cbbf2';
const DEPT_ID = 'a9c2c67e-07f2-46dc-9189-091085496cd4'; // 초등부

async function setup() {
  // 1. 반 생성
  const { data: cls, error: clsErr } = await supabase
    .from('classes')
    .insert([
      { department_id: DEPT_ID, name: '사랑반' },
      { department_id: DEPT_ID, name: '믿음반' },
    ])
    .select();

  if (clsErr) { console.error('반 생성 실패:', clsErr); return; }
  console.log('반 생성 완료:', cls.map(c => c.name));

  const classId = cls[0].id;

  // 2. 사용자를 admin으로 등록
  const { error: userErr } = await supabase
    .from('users')
    .upsert({
      id: USER_ID,
      name: '정주호',
      kakao_id: '4810147056',
      avatar_url: 'http://k.kakaocdn.net/dn/ixn5h/dJMcahXAHjI/mhUfezDi7pe98ZxS35DKB0/img_640x640.jpg',
      role: 'admin',
    });

  if (userErr) { console.error('사용자 등록 실패:', userErr); return; }
  console.log('관리자 등록 완료: 정주호');

  // 3. 반에 배정
  const { error: ucErr } = await supabase
    .from('user_classes')
    .upsert({ user_id: USER_ID, class_id: classId, role: 'teacher' });

  if (ucErr) { console.error('반 배정 실패:', ucErr); return; }
  console.log('반 배정 완료: 사랑반');

  // 4. 초대코드 생성
  const code = 'TEST01';
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { error: invErr } = await supabase
    .from('invite_codes')
    .insert({
      code,
      class_id: classId,
      role: 'parent',
      created_by: USER_ID,
      expires_at: expiresAt.toISOString(),
    });

  if (invErr) { console.error('초대코드 생성 실패:', invErr); return; }
  console.log(`\n초대코드: ${code}`);
  console.log('역할: 학부모 (parent)');
  console.log('반: 초등부 사랑반');
  console.log('만료: 30일 후');
}

setup();
