import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import PhotoGrid from '@/components/PhotoGrid';
import CommentSection from '@/components/CommentSection';
import AlbumActions from '@/components/AlbumActions';
import ZipDownloadButton from '@/components/ZipDownloadButton';
import ExpandableText from '@/components/ExpandableText';
import LikeButton from '@/components/LikeButton';
import ShareButton from '@/components/ShareButton';

export const dynamic = 'force-dynamic';

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();

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

  // 좋아요 데이터 조회 (admin client로 RLS 우회)
  const adminSb = createAdminClient();
  const { count: likeCount } = await adminSb
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('album_id', albumId);

  const { data: userLike } = await adminSb
    .from('likes')
    .select('id')
    .eq('album_id', albumId)
    .eq('user_id', user.id)
    .single();

  const canManage = album.created_by === user.id || profile?.role === 'admin';

  const photos = (album.photos || []).map((p: any) => ({
    ...p,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photo/${p.storage_path}`,
    thumbnailUrl: p.thumbnail_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photo/${p.thumbnail_path}`
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photo/${p.storage_path}`,
    canDelete: p.uploaded_by === user.id || profile?.role === 'admin',
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/classes/${album.class_id}`}
          className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
        >
          <span>&larr;</span> {(album.class as any)?.department?.name} - {(album.class as any)?.name}
        </Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">{album.title}</h1>
            {album.description && (
              <ExpandableText text={album.description} />
            )}
            <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-sub)]">
              <span>{formatDate(album.event_date)}</span>
              <span>{(album.creator as any)?.name}</span>
              <span>{photos.length}장</span>
            </div>
            <div className="mt-3">
              <LikeButton
                albumId={albumId}
                initialLiked={!!userLike}
                initialCount={likeCount || 0}
              />
            </div>
          </div>
          {canManage && (
            <AlbumActions
              albumId={albumId}
              albumTitle={album.title}
              albumDescription={album.description || ''}
              albumEventDate={album.event_date}
            />
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <ShareButton title={album.title} />
        {photos.length > 0 && <ZipDownloadButton photos={photos} albumTitle={album.title} />}
        <Link
          href={`/albums/${albumId}/upload`}
          className="px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all btn-press shadow-sm"
        >
          사진 추가
        </Link>
      </div>

      <PhotoGrid photos={photos} albumId={albumId} />

      <div className="mt-10">
        <CommentSection
          albumId={albumId}
          initialComments={comments || []}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
