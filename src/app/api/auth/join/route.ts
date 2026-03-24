import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { code, name } = await request.json();

  if (!code || !name) {
    return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const adminSb = createAdminClient();

  // 초대코드 확인
  const { data: invite } = await adminSb
    .from('invite_codes')
    .select('*, class:classes(*, department:departments(*))')
    .eq('code', code.toUpperCase())
    .is('used_by', null)
    .single();

  if (!invite) {
    return NextResponse.json({ error: '유효하지 않은 초대코드입니다.' }, { status: 400 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: '만료된 초대코드입니다.' }, { status: 400 });
  }

  // 프로필 생성/업데이트
  const { error: profileErr } = await adminSb
    .from('users')
    .upsert({
      id: user.id,
      name,
      kakao_id: user.user_metadata?.kakao_id || user.user_metadata?.provider_id || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      role: invite.role,
    });

  if (profileErr) {
    return NextResponse.json({ error: '프로필 생성에 실패했습니다: ' + profileErr.message }, { status: 500 });
  }

  // 반 배정
  const { error: classErr } = await adminSb
    .from('user_classes')
    .upsert({
      user_id: user.id,
      class_id: invite.class_id,
      role: invite.role,
    });

  if (classErr) {
    return NextResponse.json({ error: '반 배정에 실패했습니다: ' + classErr.message }, { status: 500 });
  }

  // 초대코드 사용 처리
  await adminSb
    .from('invite_codes')
    .update({ used_by: user.id })
    .eq('id', invite.id);

  return NextResponse.json({ ok: true });
}
