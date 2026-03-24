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

  const total = slides.length;

  const goTo = useCallback((idx: number) => {
    setCurrent(Math.max(0, Math.min(idx, total - 1)));
  }, [total]);

  // 자동 슬라이드 (5초)
  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

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

  return (
    <div className="mb-4 relative overflow-hidden rounded-3xl shadow-lg shadow-candy-purple/20">
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-${current * 100}% + ${swiping ? touchDelta : 0}px))`,
          transition: swiping ? 'none' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full shrink-0">
            {slide.type === 'verse' ? (
              <div className="gradient-candy p-6 text-white">
                <p className="text-white/70 text-xs font-semibold mb-2">오늘의 말씀</p>
                <p className="text-base font-bold leading-relaxed">{verse.text}</p>
                <p className="text-white/60 text-xs mt-2 text-right">{verse.ref}</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-candy-orange to-candy-yellow p-6 text-white">
                <p className="text-white/70 text-xs font-semibold mb-2">공지사항</p>
                <p className="text-base font-bold leading-relaxed">{slide.data!.title}</p>
                <p className="text-white/80 text-sm mt-2 line-clamp-3 whitespace-pre-line">{slide.data!.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      {total > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
