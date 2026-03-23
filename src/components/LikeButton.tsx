'use client';

import { useState } from 'react';

export default function LikeButton({
  albumId,
  initialLiked,
  initialCount,
  size = 'default',
}: {
  albumId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: 'default' | 'small';
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    // 낙관적 업데이트
    setLiked(!liked);
    setCount((c) => (liked ? c - 1 : c + 1));

    const res = await fetch(`/api/albums/${albumId}/like`, { method: 'POST' });
    if (!res.ok) {
      // 롤백
      setLiked(liked);
      setCount(count);
    }
  };

  if (size === 'small') {
    return (
      <button
        onClick={handleToggle}
        className="flex items-center gap-1 text-xs text-[var(--text-sub)] hover:text-candy-pink transition-colors"
      >
        <svg
          className={`w-3.5 h-3.5 transition-all ${liked ? 'text-candy-pink fill-candy-pink scale-110' : ''} ${animating ? 'scale-125' : ''}`}
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {count > 0 && <span>{count}</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
        liked
          ? 'bg-candy-pink/10 text-candy-pink border border-candy-pink/20'
          : 'bg-[var(--surface-card)] text-[var(--text-sub)] border border-[var(--border)] hover:border-candy-pink/40'
      }`}
    >
      <svg
        className={`w-5 h-5 transition-all ${liked ? 'fill-candy-pink' : ''} ${animating ? 'scale-125' : ''}`}
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}
