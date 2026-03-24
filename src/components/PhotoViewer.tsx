'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Zoom, Virtual } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/zoom';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/hooks/useToast';

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
  const swiperRef = useRef<SwiperType | null>(null);
  const confirm = useConfirm();
  const { toast } = useToast();
  const photo = photos[index];

  const prev = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const next = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.storage_path.split('/').pop() || 'photo';
    link.click();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: '사진 공유', url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast('링크가 복사되었습니다', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 z-10 shrink-0">
        <span className="text-white/80 text-sm font-semibold bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
          {index + 1} / {photos.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl transition-colors"
            title="공유"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
          </button>
          <button
            onClick={handleDownload}
            className="p-2.5 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl transition-colors"
            title="다운로드"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          {photo?.canDelete && onDelete && (
            <button
              onClick={async () => {
                const ok = await confirm({
                  message: '이 사진을 삭제하시겠습니까?',
                  confirmText: '삭제',
                  danger: true,
                });
                if (ok) {
                  onDelete(photo.id);
                  toast('사진이 삭제되었습니다', 'success');
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

      {/* Swiper */}
      <div className="flex-1 min-h-0 relative">
        <Swiper
          modules={[Zoom, Virtual]}
          zoom={true}
          virtual
          initialSlide={initialIndex}
          spaceBetween={0}
          slidesPerView={1}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          onSlideChange={(swiper) => setIndex(swiper.activeIndex)}
          className="w-full h-full"
        >
          {photos.map((p, i) => (
            <SwiperSlide key={p.id} virtualIndex={i}>
              <div className="swiper-zoom-container flex items-center justify-center w-full h-full">
                <img
                  src={p.url}
                  alt=""
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Desktop nav buttons */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-colors hidden sm:block"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-colors hidden sm:block"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
