import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AlbumCard from '@/components/AlbumCard';

export const dynamic = 'force-dynamic';

export default async function ClassPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cls } = await supabase
    .from('classes')
    .select('*, department:departments(*)')
    .eq('id', classId)
    .single();

  if (!cls) notFound();

  const { data: albums } = await supabase
    .from('albums')
    .select(`
      *,
      class:classes(*, department:departments(*)),
      creator:users!albums_created_by_fkey(name),
      photos(id, thumbnail_path, storage_path)
    `)
    .eq('class_id', classId)
    .order('event_date', { ascending: false });

  // likes를 admin client로 별도 조회
  const adminSb = createAdminClient();
  const albumIds = albums?.map((a) => a.id) || [];
  const { data: allLikes } = albumIds.length > 0
    ? await adminSb.from('likes').select('album_id, user_id').in('album_id', albumIds)
    : { data: [] };

  const albumsWithLikes = albums?.map((album) => ({
    ...album,
    likes: allLikes?.filter((l) => l.album_id === album.id) || [],
  })) || [];

  return (
    <div>
      <Link
        href={`/departments/${cls.department_id}`}
        className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
      >
        <span>&larr;</span> {(cls.department as any)?.name}
      </Link>
      <h1 className="text-xl font-bold text-[var(--text)] mt-3 mb-6">
        {(cls.department as any)?.name} - {cls.name}
      </h1>

      {albumsWithLikes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {albumsWithLikes.map((album) => (
            <AlbumCard key={album.id} album={album as any} currentUserId={user?.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4">
          <p className="text-[var(--text-sub)]">아직 앨범이 없습니다</p>
        </div>
      )}
    </div>
  );
}
