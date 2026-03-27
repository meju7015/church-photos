import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InfiniteAlbumFeed from '@/components/InfiniteAlbumFeed';
import { getDailyVerse } from '@/lib/bible-verses';
import { createAdminClient } from '@/lib/supabase/admin';
import HomeBanner from '@/components/HomeBanner';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userClasses } = await supabase
    .from('user_classes')
    .select('class_id, class:classes(*, department:departments(*))')
    .eq('user_id', user.id);

  const classIds = userClasses?.map((uc) => uc.class_id) || [];

  const { data: albums } = await supabase
    .from('albums')
    .select(`
      *,
      class:classes(*, department:departments(*)),
      creator:users!albums_created_by_fkey(name),
      photos(id, thumbnail_path, storage_path)
    `)
    .in('class_id', classIds.length > 0 ? classIds : [''])
    .order('created_at', { ascending: false })
    .limit(12);

  // likes를 admin client로 별도 조회 (RLS 우회)
  const adminSb = createAdminClient();
  const albumIds = albums?.map((a) => a.id) || [];
  const { data: allLikes } = albumIds.length > 0
    ? await adminSb.from('likes').select('album_id, user_id').in('album_id', albumIds)
    : { data: [] };

  const albumsWithLikes = albums?.map((album) => ({
    ...album,
    likes: allLikes?.filter((l) => l.album_id === album.id) || [],
  })) || [];

  // 공지사항 조회 (고정 우선, 최근순)
  const { data: recentAnnouncements } = await adminSb
    .from('announcements')
    .select('id, title, content, pinned')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);

  // 읽지 않은 알림장 조회
  const { data: recentBulletins } = classIds.length > 0
    ? await adminSb
        .from('bulletins')
        .select('id, title, category, created_at, class:classes(name, department:departments(name))')
        .in('class_id', classIds)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] };

  const bulletinIds = recentBulletins?.map((b) => b.id) || [];
  const { data: bulletinReads } = bulletinIds.length > 0
    ? await adminSb.from('bulletin_reads').select('bulletin_id').eq('user_id', user.id).in('bulletin_id', bulletinIds)
    : { data: [] };
  const readBulletinSet = new Set(bulletinReads?.map((r) => r.bulletin_id) || []);
  const unreadBulletins = recentBulletins?.filter((b) => !readBulletinSet.has(b.id)) || [];

  const verse = getDailyVerse();

  const categoryColors: Record<string, string> = {
    lesson: 'bg-info/10 text-info',
    supply: 'bg-success/10 text-success',
    event: 'bg-warning/10 text-warning',
    general: 'bg-primary/10 text-primary',
  };
  const categoryLabels: Record<string, string> = {
    lesson: '공과', supply: '준비물', event: '행사', general: '일반',
  };

  return (
    <div className="space-y-8">
      {/* 배너 (오늘의 말씀 + 공지사항 슬라이드) */}
      <div className="animate-fade-up">
        <HomeBanner verse={verse} announcements={recentAnnouncements || []} />
      </div>

      {/* 읽지 않은 알림장 */}
      {unreadBulletins.length > 0 && (
        <div className="animate-fade-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
              새 알림장
              <span className="text-xs font-bold text-white bg-primary px-2 py-0.5 rounded-full">{unreadBulletins.length}</span>
            </h2>
            <Link href="/bulletins" className="text-xs font-semibold text-primary hover:underline">
              전체보기
            </Link>
          </div>
          <div className="space-y-2">
            {unreadBulletins.map((b) => (
              <Link
                key={b.id}
                href={`/bulletins/${b.id}`}
                className="flex items-center gap-3 p-3.5 bg-[var(--surface-card)] border border-[var(--border)] border-l-3 border-l-primary rounded-2xl hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${categoryColors[b.category] || categoryColors.general}`}>
                      {categoryLabels[b.category] || '일반'}
                    </span>
                    <span className="text-[11px] text-[var(--text-sub)]">
                      {(b.class as any)?.department?.name} · {(b.class as any)?.name}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[var(--text)] truncate">{b.title}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 내 반 */}
      <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">내 반</h2>
          <Link href="/departments" className="text-xs font-semibold text-primary hover:underline">
            전체 부서 보기
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {userClasses?.map((uc) => {
            const cls = uc.class as any;
            return (
              <Link
                key={uc.class_id}
                href={`/classes/${uc.class_id}`}
                className="px-4 py-2.5 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] hover:border-primary/30 hover:shadow-sm transition-all"
              >
                {cls?.department?.name} - {cls?.name}
              </Link>
            );
          })}
          {(!userClasses || userClasses.length === 0) && (
            <p className="text-[var(--text-sub)] text-sm">배정된 반이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 앨범 */}
      <div className="animate-fade-up" style={{ animationDelay: '250ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">최근 앨범</h2>
        </div>
        <InfiniteAlbumFeed initialAlbums={albumsWithLikes as any} currentUserId={user.id} />
      </div>
    </div>
  );
}
