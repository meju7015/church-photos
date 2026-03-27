'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Verse {
  text: string;
  ref: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  pinned?: boolean;
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
        className="relative overflow-hidden rounded-2xl shadow-sm h-[160px]"
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
              <div className="bg-primary p-5 pb-7 text-white h-full flex flex-col justify-center">
                <p className="text-white/70 text-xs font-medium mb-1.5">오늘의 말씀</p>
                <p className="text-sm font-semibold leading-relaxed line-clamp-3">{verse.text}</p>
                <p className="text-white/60 text-xs mt-1.5 text-right">{verse.ref}</p>
              </div>
            ) : (
              <div className={`${slide.data!.pinned ? 'bg-warning' : 'bg-info'} p-5 pb-7 text-white h-full flex flex-col justify-center`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {slide.data!.pinned && <span className="text-white/90 text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded">고정</span>}
                  <p className="text-white/70 text-xs font-medium">공지사항</p>
                  <span className="text-white/50 text-[10px]">자세히 보기</span>
                </div>
                <p className="text-sm font-semibold leading-relaxed line-clamp-1">{slide.data!.title}</p>
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

      {/* 공지 상세 모달 - portal로 body에 직접 렌더 */}
      {detail && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={() => setDetail(null)} />
          <div className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center" onClick={() => setDetail(null)}>
            <div
              className="bg-[var(--surface-card)] w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 핸들바 (모바일) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
              </div>

              {/* 헤더 */}
              <div className="flex items-center justify-between px-6 pt-4 sm:pt-6 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-warning">공지사항</span>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--border)] text-[var(--text-sub)] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 제목 */}
              <div className="px-6 pb-4 border-b border-[var(--border)]">
                <h3 className="text-lg font-bold text-[var(--text)] leading-snug">{detail.title}</h3>
              </div>

              {/* 본문 */}
              <div className="px-6 py-5 overflow-y-auto">
                <p className="text-sm text-[var(--text)] whitespace-pre-line leading-relaxed">{detail.content}</p>
              </div>

              {/* 하단 닫기 */}
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={() => setDetail(null)}
                  className="w-full py-3 bg-[var(--bg)] text-[var(--text-sub)] rounded-xl text-sm font-semibold hover:bg-[var(--border)] transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
