'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items = [
    { href: '/admin', label: '대시보드' },
    { href: '/admin/upload', label: '앨범 생성' },
    { href: '/admin/albums', label: '히스토리' },
    { href: '/admin/members', label: '학부모 관리' },
    ...(isAdmin
      ? [
          { href: '/admin/departments', label: '부서/반' },
          { href: '/admin/users', label: '사용자' },
        ]
      : []),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center gap-1.5',
            pathname === item.href
              ? 'gradient-candy text-white shadow-md shadow-candy-purple/20'
              : 'bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text-sub)] hover:border-candy-purple/40'
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
