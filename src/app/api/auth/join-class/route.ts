import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: '초대코드를 입력해주세요.' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  const adminSb = createAdminClient();

  const { data: invite } = await adminSb
    .from('invite_codes')
    .select('*, class:classes(*, department:departments(*))')
    .eq('code', code.toUpperCase())
    .is('used_by', null)
    .single();

  if (!invite) return NextResponse.json({ error: '유효하지 않은 초대코드입니다.' }, { status: 400 });
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: '만료된 초대코드입니다.' }, { status: 400 });

  // 이미 배정 확인
  const { data: existing } = await adminSb
    .from('user_classes')
    .select('class_id')
    .eq('user_id', user.id)
    .eq('class_id', invite.class_id)
    .single();

  if (existing) return NextResponse.json({ error: '이미 이 반에 소속되어 있습니다.' }, { status: 400 });

  await adminSb.from('user_classes').upsert({
    user_id: user.id,
    class_id: invite.class_id,
    role: invite.role,
  });

  await adminSb.from('invite_codes').update({ used_by: user.id }).eq('id', invite.id);

  const cls = invite.class as any;
  return NextResponse.json({
    ok: true,
    className: `${cls?.department?.name} - ${cls?.name}`,
  });
}
