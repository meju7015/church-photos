'use client';

import { useState, useRef } from 'react';

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
  const pendingRef = useRef(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pendingRef.current) return;
    pendingRef.current = true;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    try {
      const res = await fetch(`/api/albums/${albumId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.count);
      }
    } finally {
      pendingRef.current = false;
    }
  };

  const heartSvg = (
    <svg
      className={`transition-all ${liked ? 'text-candy-pink' : ''} ${animating ? 'scale-125' : ''} ${size === 'small' ? 'w-3.5 h-3.5' : 'w-5 h-5'}`}
      fill={liked ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

  if (size === 'small') {
    return (
      <button
        onClick={handleToggle}
        className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-candy-pink' : 'text-[var(--text-sub)] hover:text-candy-pink'}`}
      >
        {heartSvg}
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
      {heartSvg}
      <span>{count}</span>
    </button>
  );
}
