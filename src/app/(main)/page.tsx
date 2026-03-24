import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InfiniteAlbumFeed from '@/components/InfiniteAlbumFeed';
import SearchBar from '@/components/SearchBar';
import { getDailyVerse } from '@/lib/bible-verses';
import { createAdminClient } from '@/lib/supabase/admin';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userClasses } = await supabase
    .from('user_classes')
    .select('class_id, class:classes(*, department:departments(*))')
    .eq('user_id', user.id);

  const classIds = userClasses?.map((uc) => uc.class_id) || [];

  let query = supabase
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

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`);
  }

  const { data: albums } = await query;

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

  // 고정 공지사항 조회
  const { data: pinnedAnnouncements } = await adminSb
    .from('announcements')
    .select('id, title, content')
    .eq('pinned', true)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div>
      {/* 고정 공지 */}
      {pinnedAnnouncements && pinnedAnnouncements.length > 0 && (
        <AnnouncementBanner announcements={pinnedAnnouncements} />
      )}

      {/* 오늘의 말씀 */}
      {(() => {
        const verse = getDailyVerse();
        return (
          <div className="gradient-candy rounded-3xl p-6 mb-6 text-white shadow-lg shadow-candy-purple/20">
            <p className="text-white/70 text-xs font-semibold mb-2">오늘의 말씀</p>
            <p className="text-base font-bold leading-relaxed">{verse.text}</p>
            <p className="text-white/60 text-xs mt-2 text-right">{verse.ref}</p>
          </div>
        );
      })()}

      {/* 내 반 */}
      <div className="mb-6">
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

      {/* 검색 + 앨범 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[var(--text)]">
            {params.search ? `"${params.search}" 검색 결과` : '최근 앨범'}
          </h2>
        </div>
        <div className="mb-4">
          <SearchBar basePath="/" />
        </div>
        <InfiniteAlbumFeed initialAlbums={albumsWithLikes as any} search={params.search} currentUserId={user.id} />
      </div>
    </div>
  );
}
