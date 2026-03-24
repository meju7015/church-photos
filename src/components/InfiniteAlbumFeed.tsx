'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AlbumCard from './AlbumCard';
import type { Album } from '@/types';

type AlbumWithRelations = Album & {
  class?: { name: string; department?: { name: string } };
  creator?: { name: string };
  photos?: { id: string; thumbnail_path: string | null; storage_path: string }[];
  likes?: { user_id: string }[];
};

export default function InfiniteAlbumFeed({
  initialAlbums,
  search,
  currentUserId,
}: {
  initialAlbums: AlbumWithRelations[];
  search?: string;
  currentUserId?: string;
}) {
  const [albums, setAlbums] = useState<AlbumWithRelations[]>(initialAlbums);
  const [hasMore, setHasMore] = useState(initialAlbums.length >= 12);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // 검색어 변경 시 리셋
  useEffect(() => {
    setAlbums(initialAlbums);
    setHasMore(initialAlbums.length >= 12);
  }, [initialAlbums]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const lastAlbum = albums[albums.length - 1];
    const params = new URLSearchParams({
      cursor: lastAlbum.created_at,
      limit: '12',
    });
    if (search) params.set('search', search);

    const res = await fetch(`/api/albums?${params}`);
    const data = await res.json();

    if (data.albums) {
      setAlbums((prev) => [...prev, ...data.albums]);
      setHasMore(data.hasMore);
    }
    setLoading(false);
  }, [albums, hasMore, loading, search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  if (albums.length === 0) {
    return (
      <div className="text-center py-16 bg-[var(--surface-card)] rounded-3xl border border-[var(--border)]">
        <div className="text-4xl mb-3">
          {search ? '🔍' : '📷'}
        </div>
        <p className="text-sm font-semibold text-[var(--text-sub)]">
          {search ? `"${search}"에 대한 결과가 없습니다` : '아직 앨범이 없습니다'}
        </p>
        <p className="text-xs text-[var(--text-sub)] mt-1.5">
          {search ? '다른 검색어로 시도해보세요' : '선생님이 사진을 올리면 여기에 나타나요!'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} currentUserId={currentUserId} />
        ))}
      </div>

      {/* 로더 트리거 */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          {loading && (
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-candy-purple/40 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 rounded-full bg-candy-purple/40 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-2 rounded-full bg-candy-purple/40 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
