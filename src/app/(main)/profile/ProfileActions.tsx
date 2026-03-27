'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';
import { MoonIcon, SunIcon } from '@/components/icons';

export default function ProfileActions() {
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 overflow-hidden divide-y divide-[var(--border)]">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--border)]/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {theme === 'light' ? <MoonIcon className="w-5 h-5 text-[var(--text-sub)]" /> : <SunIcon className="w-5 h-5 text-[var(--text-sub)]" />}
          <span className="text-sm font-semibold text-[var(--text)]">
            {theme === 'light' ? '다크 모드' : '라이트 모드'}
          </span>
        </div>
        <span className="text-xs text-[var(--text-sub)]">
          현재: {theme === 'light' ? '라이트' : '다크'}
        </span>
      </button>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 p-4 hover:bg-danger/5 transition-colors"
      >
        <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        <span className="text-sm font-semibold text-danger">로그아웃</span>
      </button>
    </div>
  );
}
