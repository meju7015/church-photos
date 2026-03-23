import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 사용자 프로필 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!profile) {
          // 프로필이 없으면 초대코드 입력 페이지로
          return NextResponse.redirect(`${origin}/join`);
        }

        // 반 배정 확인
        const { data: userClass } = await supabase
          .from('user_classes')
          .select('class_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (!userClass) {
          return NextResponse.redirect(`${origin}/join`);
        }
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
