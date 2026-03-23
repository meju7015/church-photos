import { createClient } from '@/lib/supabase/server';
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
      photos(id, thumbnail_path, storage_path),
      likes(user_id)
    `)
    .eq('class_id', classId)
    .order('event_date', { ascending: false });

  return (
    <div>
      <Link
        href={`/departments/${cls.department_id}`}
        className="text-sm text-candy-purple font-semibold hover:underline flex items-center gap-1"
      >
        <span>&larr;</span> {(cls.department as any)?.name}
      </Link>
      <h1 className="text-xl font-extrabold text-[var(--text)] mt-3 mb-6">
        {(cls.department as any)?.name} - {cls.name}
      </h1>

      {albums && albums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album as any} currentUserId={user?.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--surface-card)] rounded-3xl border border-[var(--border)]">
          <span className="text-5xl mb-4 block">📷</span>
          <p className="text-[var(--text-sub)]">아직 앨범이 없습니다</p>
        </div>
      )}
    </div>
  );
}
