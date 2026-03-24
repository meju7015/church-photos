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

  const verse = getDailyVerse();

  return (
    <div className="space-y-5">
      {/* 배너 (오늘의 말씀 + 공지사항 슬라이드) */}
      <HomeBanner verse={verse} announcements={recentAnnouncements || []} />

      {/* 내 반 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[var(--text)]">내 반</h2>
          <Link href="/departments" className="text-xs font-semibold text-candy-purple hover:underline">
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
                className="px-4 py-2.5 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] hover:border-candy-purple/40 hover:shadow-md hover:shadow-candy-purple/10 transition-all"
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
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[var(--text)]">최근 앨범</h2>
        </div>
        <InfiniteAlbumFeed initialAlbums={albumsWithLikes as any} currentUserId={user.id} />
      </div>
    </div>
  );
}
