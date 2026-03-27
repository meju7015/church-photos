import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: albumCount },
    { count: photoCount },
    { count: userCount },
    { count: deptCount },
  ] = await Promise.all([
    supabase.from('albums').select('*', { count: 'exact', head: true }),
    supabase.from('photos').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('departments').select('*', { count: 'exact', head: true }),
  ]);

  const { data: recentAlbums } = await supabase
    .from('albums')
    .select('*, class:classes(name, department:departments(name)), creator:users!albums_created_by_fkey(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    { label: '총 앨범', value: albumCount || 0, color: 'bg-dept-infant' },
    { label: '총 사진', value: photoCount || 0, color: 'bg-dept-kinder' },
    { label: '사용자', value: userCount || 0, color: 'bg-dept-middle' },
    { label: '부서', value: deptCount || 0, color: 'bg-dept-elementary' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--text)] mb-6">
        대시보드
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 stagger-children">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-4 card-hover">
            <div className="flex items-center justify-end mb-2">
              <div className={`w-8 h-8 ${stat.color} rounded-xl opacity-30`} />
            </div>
            <p className="text-2xl font-bold text-[var(--text)] tabular-nums">{stat.value}</p>
            <p className="text-xs text-[var(--text-sub)] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/upload"
          className="bg-primary text-white rounded-2xl p-6 shadow-sm card-hover"
        >
          <p className="font-bold text-lg">새 앨범 생성</p>
          <p className="text-white/70 text-sm mt-1">사진을 업로드하세요</p>
        </Link>
        <Link
          href="/admin/members"
          className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 card-hover"
        >
          <p className="font-bold text-lg text-[var(--text)]">학부모 관리</p>
          <p className="text-[var(--text-sub)] text-sm mt-1">초대코드 생성 및 관리</p>
        </Link>
      </div>

      {/* Recent albums */}
      <div>
        <h2 className="font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
          최근 앨범
        </h2>
        <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 divide-y divide-[var(--border)] overflow-hidden">
          {recentAlbums?.map((album) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="flex items-center justify-between p-4 hover:bg-[var(--border)]/30 transition-colors"
            >
              <div>
                <p className="font-semibold text-sm text-[var(--text)]">{album.title}</p>
                <p className="text-xs text-[var(--text-sub)] mt-0.5">
                  {(album.class as any)?.department?.name} - {(album.class as any)?.name}
                </p>
              </div>
              <p className="text-xs text-[var(--text-sub)]">{(album.creator as any)?.name}</p>
            </Link>
          ))}
          {(!recentAlbums || recentAlbums.length === 0) && (
            <p className="p-8 text-sm text-[var(--text-sub)] text-center">앨범이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
