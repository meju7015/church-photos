'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AlbumCard from './AlbumCard';
import { CameraIcon, SearchIcon } from './icons';
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
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    setAlbums(initialAlbums);
    setHasMore(initialAlbums.length >= 12);
    hasMoreRef.current = initialAlbums.length >= 12;
  }, [initialAlbums]);

  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    setAlbums((prev) => {
      const lastAlbum = prev[prev.length - 1];
      if (!lastAlbum) return prev;

      const params = new URLSearchParams({
        cursor: lastAlbum.created_at,
        limit: '12',
      });
      if (search) params.set('search', search);

      fetch(`/api/albums?${params}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.albums?.length) {
            setAlbums((p) => [...p, ...data.albums]);
          }
          setHasMore(data.hasMore ?? false);
          hasMoreRef.current = data.hasMore ?? false;
        })
        .finally(() => {
          loadingRef.current = false;
          setLoading(false);
        });

      return prev;
    });
  }, [search]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (albums.length === 0) {
    return (
      <div className="text-center py-16 bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4">
        <div className="flex justify-center mb-3 text-[var(--text-sub)]">
          {search ? <SearchIcon className="w-8 h-8" /> : <CameraIcon className="w-8 h-8" />}
        </div>
        <p className="text-sm font-semibold text-[var(--text-sub)]">
          {search ? `"${search}"에 대한 결과가 없습니다` : '아직 앨범이 없습니다'}
        </p>
        <p className="text-xs text-[var(--text-sub)] mt-1.5">
          {search ? '다른 검색어로 시도해보세요' : '선생님이 사진을 올리면 여기에 나타나요'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} currentUserId={currentUserId} />
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          {loading && (
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
