import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import AlbumCard from '@/components/AlbumCard';

export const dynamic = 'force-dynamic';

export default async function LikedAlbumsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const adminSb = createAdminClient();

  // 좋아한 앨범 ID 목록
  const { data: likes } = await adminSb
    .from('likes')
    .select('album_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const albumIds = likes?.map((l) => l.album_id) || [];

  let albums: any[] = [];
  if (albumIds.length > 0) {
    const { data } = await adminSb
      .from('albums')
      .select(`
        *,
        class:classes(*, department:departments(*)),
        creator:users!albums_created_by_fkey(name),
        photos(id, storage_path, thumbnail_path),
        likes(user_id)
      `)
      .in('id', albumIds);

    // 좋아요 순서대로 정렬
    if (data) {
      const albumMap = new Map(data.map((a) => [a.id, a]));
      albums = albumIds.map((id) => albumMap.get(id)).filter(Boolean);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--text)] mb-6">좋아한 앨범</h1>

      {albums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} currentUserId={user.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💜</div>
          <p className="text-sm text-[var(--text-sub)]">아직 좋아한 앨범이 없어요</p>
          <p className="text-xs text-[var(--text-sub)] mt-1">앨범의 하트를 눌러 저장해보세요</p>
        </div>
      )}
    </div>
  );
}
