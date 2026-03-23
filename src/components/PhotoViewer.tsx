'use client';

import { useState, useEffect, useCallback } from 'react';

interface PhotoItem {
  id: string;
  url: string;
  storage_path: string;
  canDelete?: boolean;
}

export default function PhotoViewer({
  photos,
  initialIndex,
  onClose,
  onDelete,
}: {
  photos: PhotoItem[];
  initialIndex: number;
  onClose: () => void;
  onDelete?: (photoId: string) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const photo = photos[index];

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  }, [photos.length]);

  const next = useCallback(() => {
    setIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.storage_path.split('/').pop() || 'photo';
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart === null) return;
        const diff = e.changedTouches[0].clientX - touchStart;
        if (Math.abs(diff) > 50) { diff > 0 ? prev() : next(); }
        setTouchStart(null);
      }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <span className="text-white/80 text-sm font-semibold bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
          {index + 1} / {photos.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="p-2.5 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl transition-colors"
            title="다운로드"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          {photo.canDelete && onDelete && (
            <button
              onClick={() => {
                if (confirm('이 사진을 삭제하시겠습니까?')) {
                  onDelete(photo.id);
                  if (photos.length <= 1) onClose();
                  else if (index >= photos.length - 1) setIndex(index - 1);
                }
              }}
              className="p-2.5 text-red-400 bg-white/10 backdrop-blur-sm hover:bg-red-500/20 rounded-2xl transition-colors"
              title="삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2.5 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav buttons */}
      <button
        onClick={prev}
        className="absolute left-3 p-3 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-colors hidden sm:block"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-3 p-3 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-colors hidden sm:block"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <img
        src={photo.url}
        alt=""
        className="max-w-full max-h-full object-contain select-none"
        draggable={false}
      />
    </div>
  );
}
