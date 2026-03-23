'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoViewer from './PhotoViewer';

interface PhotoItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  storage_path: string;
  uploader?: { name: string };
  canDelete?: boolean;
}

export default function PhotoGrid({
  photos: initialPhotos,
  albumId,
}: {
  photos: PhotoItem[];
  albumId: string;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const router = useRouter();

  const handleDelete = async (photoId: string) => {
    const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      router.refresh();
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 bg-[var(--surface-card)] rounded-3xl border border-[var(--border)]">
        <p className="text-[var(--text-sub)]">아직 사진이 없습니다</p>
        <p className="text-xs text-[var(--text-sub)] mt-1">사진을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setViewerIndex(index)}
            className="aspect-square bg-[var(--border)] rounded-2xl overflow-hidden hover:opacity-90 transition-all hover:scale-[1.02]"
          >
            <img
              src={photo.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {viewerIndex !== null && (
        <PhotoViewer
          photos={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
