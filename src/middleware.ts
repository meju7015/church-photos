import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // API 및 인증 페이지는 그냥 통과
  const path = request.nextUrl.pathname;
  if (
    path.startsWith('/login') ||
    path.startsWith('/join') ||
    path.startsWith('/callback') ||
    path.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  // 세션 쿠키 존재 여부만 간단히 확인 (네트워크 호출 없음)
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
