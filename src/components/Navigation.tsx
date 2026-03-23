'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from './ThemeProvider';
import type { User } from '@/types';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';

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
      {/* Top nav - desktop */}
      <nav className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">📸</span>
              <span className="font-extrabold text-lg bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue bg-clip-text text-transparent">
                우리교회
              </span>
            </Link>

            <div className="flex items-center gap-1.5">
              {/* Desktop nav links */}
              <Link
                href="/"
                className={cn(
                  'hidden sm:block px-3 py-2 rounded-2xl text-sm font-semibold transition-all',
                  pathname === '/' ? 'bg-candy-purple/10 text-candy-purple' : 'text-[var(--text-sub)] hover:bg-[var(--border)]'
                )}
              >
                홈
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'hidden sm:block px-3 py-2 rounded-2xl text-sm font-semibold transition-all',
                    pathname.startsWith('/admin') ? 'bg-candy-purple/10 text-candy-purple' : 'text-[var(--text-sub)] hover:bg-[var(--border)]'
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
                className="p-2 rounded-2xl text-[var(--text-sub)] hover:bg-[var(--border)] transition-colors"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-2xl gradient-candy flex items-center justify-center text-sm font-bold text-white shadow-md shadow-candy-purple/20 hover:scale-105 transition-transform"
                >
                  {user.name.charAt(0)}
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-[var(--surface-card)] rounded-2xl shadow-xl border border-[var(--border)] py-2 z-50">
                      <div className="px-4 py-3 border-b border-[var(--border)]">
                        <p className="font-bold text-sm text-[var(--text)]">{user.name}</p>
                        <p className="text-xs text-[var(--text-sub)] mt-0.5">
                          {user.role === 'admin' ? '관리자' : user.role === 'teacher' ? '선생님' : '학부모'}
                        </p>
                      </div>
                      <Link
                        href="/join-class"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--border)]/50 transition-colors"
                      >
                        반 추가
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-candy-red hover:bg-candy-red/5 transition-colors"
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

      {/* Bottom tab bar - mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-[var(--surface)] border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          <Link
            href="/"
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors',
              pathname === '/' ? 'text-candy-purple' : 'text-[var(--text-sub)]'
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
            <span className="text-[10px] font-semibold">홈</span>
          </Link>

          <Link
            href="/notifications"
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors relative',
              pathname === '/notifications' ? 'text-candy-purple' : 'text-[var(--text-sub)]'
            )}
          >
            <NotificationBell mobile />
            <span className="text-[10px] font-semibold">알림</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors',
                pathname.startsWith('/admin') ? 'text-candy-purple' : 'text-[var(--text-sub)]'
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-semibold">관리</span>
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors',
              'text-[var(--text-sub)]'
            )}
          >
            <div className="w-5 h-5 rounded-full gradient-candy flex items-center justify-center text-[9px] font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <span className="text-[10px] font-semibold">내정보</span>
          </button>
        </div>
      </div>

      {/* Bottom padding for mobile tab bar + safe area */}
      <div className="h-16 sm:hidden" />
    </>
  );
}
