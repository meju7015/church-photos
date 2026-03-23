import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import type { Album } from '@/types';
import LikeButton from './LikeButton';

interface AlbumCardProps {
  album: Album & {
    class?: { name: string; department?: { name: string } };
    creator?: { name: string };
    photos?: { id: string; thumbnail_path: string | null; storage_path: string }[];
    likes?: { user_id: string }[];
  };
  currentUserId?: string;
}

const deptColors: Record<string, string> = {
  '영아부': 'from-candy-pink to-candy-orange',
  '유아부': 'from-candy-yellow to-candy-orange',
  '유치부': 'from-candy-green to-candy-blue',
  '초등부': 'from-candy-blue to-candy-purple',
  '중등부': 'from-candy-purple to-candy-pink',
  '고등부': 'from-candy-red to-candy-orange',
  '청년부': 'from-candy-blue to-candy-green',
};

export default function AlbumCard({ album, currentUserId }: AlbumCardProps) {
  const photoCount = album.photos?.length || 0;
  const coverPhoto = album.photos?.[0];
  const deptName = album.class?.department?.name || '';
  const gradient = deptColors[deptName] || 'from-candy-purple to-candy-blue';
  const likeCount = album.likes?.length || 0;
  const isLiked = currentUserId ? album.likes?.some((l) => l.user_id === currentUserId) || false : false;

  return (
    <Link
      href={`/albums/${album.id}`}
      className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] overflow-hidden card-hover"
    >
      <div className="aspect-[4/3] bg-[var(--border)] relative">
        {coverPhoto ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photo/${coverPhoto.thumbnail_path || coverPhoto.storage_path}`}
            alt={album.title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-80`} />
        )}
        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-semibold">
          {photoCount}장
        </div>
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-semibold text-candy-purple">
            {deptName} · {album.class?.name}
          </span>
        </div>
        <h3 className="font-bold text-sm text-[var(--text)] line-clamp-1">{album.title}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-[var(--text-sub)]">{formatDate(album.event_date)}</span>
          <div className="flex items-center gap-2">
            <LikeButton
              albumId={album.id}
              initialLiked={isLiked}
              initialCount={likeCount}
              size="small"
            />
            <span className="text-xs text-[var(--text-sub)]">{album.creator?.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
