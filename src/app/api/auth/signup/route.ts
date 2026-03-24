import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

function resolveEmail(input: string): string {
  if (input.includes('@')) return input;
  return `${input}@church-id.local`;
}

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
  }

  if (!email.includes('@') && !/^[a-zA-Z0-9_]{3,20}$/.test(email)) {
    return NextResponse.json({ error: '아이디는 3~20자 영문/숫자/밑줄만 가능합니다.' }, { status: 400 });
  }

  const resolvedEmail = resolveEmail(email.trim());
  const adminSb = createAdminClient();

  // 중복 확인
  const { data: existingUsers } = await adminSb.auth.admin.listUsers();
  const exists = existingUsers?.users?.find((u) => u.email === resolvedEmail);

  if (exists) {
    return NextResponse.json({ error: '이미 사용 중인 아이디/이메일입니다.' }, { status: 400 });
  }

  // 사용자 생성
  const { data: newUser, error: createErr } = await adminSb.auth.admin.createUser({
    email: resolvedEmail,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (createErr || !newUser.user) {
    return NextResponse.json({ error: '회원가입에 실패했습니다.' }, { status: 500 });
  }

  // 로그인 세션 생성
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: resolvedEmail,
    password,
  });

  if (signInErr) {
    return NextResponse.json({ error: '로그인에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
