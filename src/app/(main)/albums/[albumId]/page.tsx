import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import PhotoGrid from '@/components/PhotoGrid';
import CommentSection from '@/components/CommentSection';

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: album } = await supabase
    .from('albums')
    .select(`
      *,
      class:classes(*, department:departments(*)),
      creator:users!albums_created_by_fkey(name, avatar_url),
      photos(*, uploader:users!photos_uploaded_by_fkey(name))
    `)
    .eq('id', albumId)
    .single();

  if (!album) notFound();

  const { data: comments } = await supabase
    .from('comments')
    .select('*, user:users(*)')
    .eq('album_id', albumId)
    .order('created_at', { ascending: true });

  const photos = (album.photos || []).map((p: any) => ({
    ...p,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photo/${p.storage_path}`,
    thumbnailUrl: p.thumbnail_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photo/${p.thumbnail_path}`
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photo/${p.storage_path}`,
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/classes/${album.class_id}`}
          className="text-sm text-candy-purple font-semibold hover:underline flex items-center gap-1"
        >
          <span>&larr;</span> {(album.class as any)?.department?.name} - {(album.class as any)?.name}
        </Link>
        <h1 className="text-xl font-extrabold text-[var(--text)] mt-3">{album.title}</h1>
        {album.description && (
          <p className="text-[var(--text-sub)] text-sm mt-1">{album.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-sub)]">
          <span>{formatDate(album.event_date)}</span>
          <span>{(album.creator as any)?.name}</span>
          <span>{photos.length}장</span>
        </div>
      </div>

      {/* Upload button */}
      <div className="flex justify-end mb-4">
        <Link
          href={`/albums/${albumId}/upload`}
          className="px-5 py-2.5 gradient-candy text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-candy-purple/20 flex items-center gap-1.5"
        >
          사진 추가
        </Link>
      </div>

      <PhotoGrid photos={photos} albumId={albumId} />

      <div className="mt-8">
        <CommentSection
          albumId={albumId}
          initialComments={comments || []}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
