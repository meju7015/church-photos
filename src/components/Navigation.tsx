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

  const navItems = [
    { href: '/', label: '홈' },
    ...(isAdmin ? [{ href: '/admin', label: '관리' }] : []),
  ];

  return (
    <nav className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <span className="font-extrabold text-lg bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue bg-clip-text text-transparent">
              우리교회
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-2xl text-sm font-semibold transition-all',
                  pathname === item.href
                    ? 'bg-candy-purple/10 text-candy-purple'
                    : 'text-[var(--text-sub)] hover:bg-[var(--border)]'
                )}
              >
                {item.label}
              </Link>
            ))}

            <NotificationBell />

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-2xl text-[var(--text-sub)] hover:bg-[var(--border)] transition-colors"
              title={theme === 'light' ? '다크 모드' : '라이트 모드'}
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
  );
}
