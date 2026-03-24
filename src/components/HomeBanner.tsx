'use client';

import { useState, useEffect, useCallback } from 'react';

interface Verse {
  text: string;
  ref: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
}

export default function HomeBanner({
  verse,
  announcements,
}: {
  verse: Verse;
  announcements: Announcement[];
}) {
  const slides = [
    { type: 'verse' as const },
    ...announcements.map((a) => ({ type: 'announcement' as const, data: a })),
  ];

  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchDelta, setTouchDelta] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [detail, setDetail] = useState<Announcement | null>(null);

  const total = slides.length;

  const goTo = useCallback((idx: number) => {
    setCurrent(Math.max(0, Math.min(idx, total - 1)));
  }, [total]);

  useEffect(() => {
    if (total <= 1 || detail) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total, detail]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setSwiping(true);
    setTouchDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (Math.abs(touchDelta) > 50) {
      if (touchDelta < 0) goTo(current + 1);
      else goTo(current - 1);
    }
    setTouchDelta(0);
  };

  const handleSlideClick = (slide: typeof slides[number]) => {
    if (Math.abs(touchDelta) > 10) return;
    if (slide.type === 'announcement') {
      setDetail(slide.data!);
    }
  };

  return (
    <>
      <div
        className="relative overflow-hidden rounded-3xl shadow-lg shadow-candy-purple/20 h-[140px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            onClick={() => handleSlideClick(slide)}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } ${slide.type === 'announcement' ? 'cursor-pointer' : ''}`}
          >
            {slide.type === 'verse' ? (
              <div className="gradient-candy p-5 pb-7 text-white h-full flex flex-col justify-center">
                <p className="text-white/70 text-xs font-semibold mb-1.5">오늘의 말씀</p>
                <p className="text-sm font-bold leading-relaxed line-clamp-3">{verse.text}</p>
                <p className="text-white/60 text-xs mt-1.5 text-right">{verse.ref}</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-candy-orange to-candy-yellow p-5 pb-7 text-white h-full flex flex-col justify-center">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <p className="text-white/70 text-xs font-semibold">공지사항</p>
                  <span className="text-white/50 text-[10px]">자세히 보기</span>
                </div>
                <p className="text-sm font-bold leading-relaxed line-clamp-1">{slide.data!.title}</p>
                <p className="text-white/80 text-xs mt-1.5 line-clamp-2 whitespace-pre-line">{slide.data!.content}</p>
              </div>
            )}
          </div>
        ))}

        {total > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 공지 상세 모달 */}
      {detail && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[200]" onClick={() => setDetail(null)} />
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] w-full max-w-sm shadow-2xl max-h-[70vh] flex flex-col">
              <div className="p-5 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-candy-orange bg-candy-orange/10 px-2.5 py-0.5 rounded-full">공지사항</span>
                  <button
                    onClick={() => setDetail(null)}
                    className="p-1 rounded-lg hover:bg-[var(--border)] text-[var(--text-sub)]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <h3 className="text-base font-bold text-[var(--text)] mt-2">{detail.title}</h3>
              </div>
              <div className="p-5 overflow-y-auto">
                <p className="text-sm text-[var(--text)] whitespace-pre-line leading-relaxed">{detail.content}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
