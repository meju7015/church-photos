'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CameraIcon } from './icons';

interface MenuItem {
  href: string;
  label: string;
}

interface MenuGroup {
  label: string;
  icon: React.ReactNode;
  adminOnly: boolean;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: '대시보드',
    adminOnly: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
      </svg>
    ),
    items: [{ href: '/admin', label: '대시보드' }],
  },
  {
    label: '앨범',
    adminOnly: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75z" />
      </svg>
    ),
    items: [
      { href: '/admin/upload', label: '앨범 생성' },
      { href: '/admin/albums', label: '히스토리' },
    ],
  },
  {
    label: '알림장',
    adminOnly: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    items: [
      { href: '/admin/bulletins', label: '작성' },
      { href: '/admin/bulletins/history', label: '내역' },
    ],
  },
  {
    label: '커뮤니티',
    adminOnly: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    items: [
      { href: '/admin/members', label: '학부모 관리' },
      { href: '/admin/announcements', label: '공지사항' },
    ],
  },
  {
    label: '설정',
    adminOnly: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    items: [
      { href: '/admin/departments', label: '부서/반' },
      { href: '/admin/users', label: '사용자' },
    ],
  },
];

function SidebarGroup({
  group,
  pathname,
  onNavigate,
}: {
  group: MenuGroup;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isSingle = group.items.length === 1;
  const isActive = group.items.some((item) => item.href === pathname);
  const [open, setOpen] = useState(isActive);

  if (isSingle) {
    const item = group.items[0];
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all',
          pathname === item.href
            ? 'bg-primary text-white shadow-sm'
            : 'text-[var(--text-sub)] hover:bg-[var(--border)]/50 hover:text-[var(--text)]'
        )}
      >
        {group.icon}
        {group.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all',
          isActive
            ? 'text-primary bg-primary/5'
            : 'text-[var(--text-sub)] hover:bg-[var(--border)]/50 hover:text-[var(--text)]'
        )}
      >
        {group.icon}
        <span className="flex-1 text-left">{group.label}</span>
        <svg
          className={cn('w-4 h-4 transition-transform', open ? 'rotate-180' : '')}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="ml-8 mt-0.5 space-y-0.5 border-l-2 border-[var(--border)] pl-3">
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'block px-3 py-2 rounded-xl text-sm transition-all',
                pathname === item.href
                  ? 'font-bold text-primary bg-primary/5'
                  : 'text-[var(--text-sub)] hover:text-[var(--text)] hover:bg-[var(--border)]/30'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminShell({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groups = menuGroups.filter((g) => !g.adminOnly || isAdmin);

  const sidebarLinks = (onNavigate?: () => void) => (
    <nav className="space-y-1">
      {groups.map((group) => (
        <SidebarGroup key={group.label} group={group} pathname={pathname} onNavigate={onNavigate} />
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <CameraIcon className="w-5 h-5 text-primary" />
                <span className="font-bold text-base tracking-tight text-primary">
                  우리교회
                </span>
              </Link>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                관리자
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden md:flex text-sm text-[var(--text-sub)] hover:text-[var(--text)] transition-colors items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                사이트로
              </Link>
              <button
                onClick={() => setOpen(true)}
                className="md:hidden p-2 rounded-xl hover:bg-[var(--border)] text-[var(--text-sub)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-20">
            {sidebarLinks()}
            <div className="mt-6 px-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-[var(--text-sub)] hover:text-[var(--text)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                사이트로 돌아가기
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* 모바일 슬라이드 패널 */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60] md:hidden" onClick={() => setOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-72 bg-[var(--surface)] z-[70] md:hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <span className="font-bold text-primary">메뉴</span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-[var(--border)] text-[var(--text-sub)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {sidebarLinks(() => setOpen(false))}
            </div>
            <div className="p-4 border-t border-[var(--border)]">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-sub)] hover:text-[var(--text)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                사이트로 돌아가기
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
