'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from './ThemeProvider';
import type { User } from '@/types';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';
import { MoonIcon, SunIcon } from './icons';
import UserAvatar from './UserAvatar';

export default function Navigation({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isAdmin = user.role === 'admin' || user.role === 'teacher';

  return (
    <>
      {/* Top nav */}
      <nav className="bg-[var(--surface)] sticky top-0 z-50 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-[var(--text)] tracking-tight">
                우리교회
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <Link
                href="/"
                className={cn(
                  'hidden sm:block px-3 py-2 rounded-xl text-sm font-semibold transition-all',
                  pathname === '/' ? 'text-primary bg-primary-light' : 'text-[var(--text-sub)] hover:bg-[var(--bg)]'
                )}
              >
                홈
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'hidden sm:block px-3 py-2 rounded-xl text-sm font-semibold transition-all',
                    pathname.startsWith('/admin') ? 'text-primary bg-primary-light' : 'text-[var(--text-sub)] hover:bg-[var(--bg)]'
                  )}
                >
                  관리
                </Link>
              )}

              <div className="hidden sm:block">
                <NotificationBell />
              </div>

              <button
                onClick={toggle}
                className="p-2.5 rounded-xl text-[var(--text-sub)] hover:bg-[var(--bg)] transition-colors"
              >
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="hover:opacity-90 transition-opacity"
                >
                  <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="sm" className="w-9 h-9" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-[var(--surface-card)] rounded-2xl shadow-lg shadow-black/8 py-1 z-50 animate-fade-up">
                      <div className="px-4 py-3 border-b border-[var(--border)]">
                        <p className="font-bold text-sm text-[var(--text)]">{user.name}</p>
                        <p className="text-xs text-[var(--text-sub)] mt-0.5">
                          {user.role === 'admin' ? '관리자' : user.role === 'teacher' ? '선생님' : '학부모'}
                        </p>
                      </div>
                      <Link
                        href="/join-class"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                      >
                        반 추가
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom tab bar - mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-[var(--surface)] border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          <Link
            href="/"
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
              pathname === '/' ? 'text-primary' : 'text-[var(--text-sub)]'
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
            <span className="text-[10px] font-semibold">홈</span>
          </Link>

          <Link
            href="/bulletins"
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
              pathname.startsWith('/bulletins') ? 'text-primary' : 'text-[var(--text-sub)]'
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-[10px] font-semibold">알림장</span>
          </Link>

          <Link
            href="/notifications"
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors relative',
              pathname === '/notifications' ? 'text-primary' : 'text-[var(--text-sub)]'
            )}
          >
            <NotificationBell mobile />
            <span className="text-[10px] font-semibold">알림</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
                pathname.startsWith('/admin') ? 'text-primary' : 'text-[var(--text-sub)]'
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-semibold">관리</span>
            </Link>
          )}

          <Link
            href="/profile"
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
              pathname === '/profile' ? 'text-primary' : 'text-[var(--text-sub)]'
            )}
          >
            <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="xs" />
            <span className="text-[10px] font-semibold">내정보</span>
          </Link>
        </div>
      </div>
    </>
  );
}
