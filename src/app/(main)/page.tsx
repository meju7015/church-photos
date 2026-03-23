import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AlbumCard from '@/components/AlbumCard';

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
    .limit(20);

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
        <h2 className="text-base font-bold text-[var(--text)] mb-3 flex items-center gap-2">
          내 반
        </h2>
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

      {/* 최근 앨범 */}
      <div>
        <h2 className="text-base font-bold text-[var(--text)] mb-3 flex items-center gap-2">
          최근 앨범
        </h2>
        {albums && albums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[var(--surface-card)] rounded-3xl border border-[var(--border)]">
            <p className="text-[var(--text-sub)]">아직 앨범이 없습니다</p>
            <p className="text-xs text-[var(--text-sub)] mt-1">선생님이 사진을 올리면 여기에 나타나요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
