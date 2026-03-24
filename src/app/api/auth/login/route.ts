import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function resolveEmail(input: string): string {
  // @가 포함되어 있으면 이메일로 취급, 아니면 아이디로 취급
  if (input.includes('@')) return input;
  return `${input}@church-id.local`;
}

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: '아이디/이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const resolvedEmail = resolveEmail(email.trim());

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: resolvedEmail,
    password,
  });

  if (error) {
    return NextResponse.json({ error: '아이디/이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

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
