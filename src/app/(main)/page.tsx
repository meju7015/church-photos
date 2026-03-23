import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InfiniteAlbumFeed from '@/components/InfiniteAlbumFeed';
import SearchBar from '@/components/SearchBar';

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

  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single();

  return (
    <div>
      {/* Welcome */}
      <div className="gradient-candy rounded-3xl p-6 mb-6 text-white shadow-lg shadow-candy-purple/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">안녕하세요</p>
            <h1 className="text-xl font-extrabold mt-0.5">{profile?.name}님!</h1>
          </div>
        </div>
      </div>

      {/* 내 반 */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-[var(--text)] mb-3">내 반</h2>
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
        <InfiniteAlbumFeed initialAlbums={(albums as any) || []} search={params.search} />
      </div>
    </div>
  );
}
