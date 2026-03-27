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
  '영아부': 'bg-dept-infant',
  '유아부': 'bg-dept-toddler',
  '유치부': 'bg-dept-kinder',
  '초등부': 'bg-dept-elementary',
  '중등부': 'bg-dept-middle',
  '고등부': 'bg-dept-high',
  '청년부': 'bg-dept-youth',
};

export default function AlbumCard({ album, currentUserId }: AlbumCardProps) {
  const photoCount = album.photos?.length || 0;
  const coverPhoto = album.photos?.[0];
  const deptName = album.class?.department?.name || '';
  const bgColor = deptColors[deptName] || 'bg-primary/40';
  const likeCount = album.likes?.length || 0;
  const isLiked = currentUserId ? album.likes?.some((l) => l.user_id === currentUserId) || false : false;

  return (
    <Link
      href={`/albums/${album.id}`}
      className="bg-[var(--surface-card)] rounded-2xl overflow-hidden card-hover shadow-sm shadow-black/4"
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
          <div className={`w-full h-full ${bgColor} opacity-60`} />
        )}
        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-semibold">
          {photoCount}장
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-xs font-medium text-primary tracking-wide">
            {deptName} · {album.class?.name}
          </span>
        </div>
        <h3 className="font-semibold text-base text-[var(--text)] line-clamp-1">{album.title}</h3>
        <div className="flex items-center justify-between mt-2">
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
