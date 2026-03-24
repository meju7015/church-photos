import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  // 프로필 확인
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('id', data.user.id)
    .single();

  const { data: userClass } = await supabase
    .from('user_classes')
    .select('class_id')
    .eq('user_id', data.user.id)
    .limit(1)
    .single();

  return NextResponse.json({
    ok: true,
    needsJoin: !profile || !userClass,
  });
}
