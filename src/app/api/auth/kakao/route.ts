import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  // CSRF 보호: 랜덤 state 생성
  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set('kakao_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10분
    path: '/',
  });

  const params = new URLSearchParams({
    client_id: process.env.KAKAO_CLIENT_ID!,
    redirect_uri: `${origin}/api/auth/kakao/callback`,
    response_type: 'code',
    scope: 'profile_nickname profile_image',
    state,
  });

  return NextResponse.redirect(
    `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
  );
}
