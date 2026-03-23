import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=kakao_denied`);
  }

  // CSRF 검증
  const cookieStore = await cookies();
  const savedState = cookieStore.get('kakao_oauth_state')?.value;
  cookieStore.delete('kakao_oauth_state');
  if (!state || state !== savedState) {
    return NextResponse.redirect(`${origin}/login?error=invalid_state`);
  }

  try {
    // 1. 카카오에서 access token 받기
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        redirect_uri: `${origin}/api/auth/kakao/callback`,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${origin}/login?error=token_failed`);
    }

    // 2. 카카오 사용자 정보 가져오기
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const kakaoUser = await userRes.json();
    const kakaoId = String(kakaoUser.id);
    const nickname = kakaoUser.properties?.nickname || kakaoUser.kakao_account?.profile?.nickname || '사용자';
    const avatarUrl = kakaoUser.properties?.profile_image || kakaoUser.kakao_account?.profile?.profile_image_url || null;

    // 3. Supabase에서 사용자 찾기/생성 (admin API)
    const adminSupabase = createAdminClient();
    const fakeEmail = `kakao_${kakaoId}@church-photos.local`;

    // 기존 사용자 찾기
    const { data: existingUsers } = await adminSupabase.auth.admin.listUsers();
    let authUser = existingUsers?.users?.find(
      (u) => u.email === fakeEmail
    );

    if (!authUser) {
      // 새 사용자 생성
      const { data: newUser, error: createErr } = await adminSupabase.auth.admin.createUser({
        email: fakeEmail,
        password: `kakao_${kakaoId}_${process.env.KAKAO_CLIENT_SECRET}`,
        email_confirm: true,
        user_metadata: {
          kakao_id: kakaoId,
          name: nickname,
          avatar_url: avatarUrl,
        },
      });

      if (createErr || !newUser.user) {
        return NextResponse.redirect(`${origin}/login?error=create_failed`);
      }
      authUser = newUser.user;
    }

    // 4. 세션 생성 (sign in as the user)
    const supabase = await createClient();
    const { data: session, error: signInErr } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: `kakao_${kakaoId}_${process.env.KAKAO_CLIENT_SECRET}`,
    });

    if (signInErr) {
      return NextResponse.redirect(`${origin}/login?error=signin_failed`);
    }

    // 5. users 테이블에 프로필 확인
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single();

    if (!profile) {
      // 프로필이 없으면 join 페이지로
      return NextResponse.redirect(`${origin}/join`);
    }

    // 반 배정 확인
    const { data: userClass } = await supabase
      .from('user_classes')
      .select('class_id')
      .eq('user_id', authUser.id)
      .limit(1)
      .single();

    if (!userClass) {
      return NextResponse.redirect(`${origin}/join`);
    }

    return NextResponse.redirect(`${origin}/`);
  } catch (err) {
    console.error('Kakao auth error:', err);
    return NextResponse.redirect(`${origin}/login?error=unknown`);
  }
}
