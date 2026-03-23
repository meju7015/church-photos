'use client';

import { useEffect } from 'react';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Main error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 gradient-candy rounded-2xl flex items-center justify-center mb-4 opacity-60">
        <span className="text-3xl">!</span>
      </div>
      <h2 className="text-lg font-bold text-[var(--text)] mb-2">문제가 발생했습니다</h2>
      <p className="text-sm text-[var(--text-sub)] mb-6 max-w-sm">
        페이지를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 gradient-candy text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all"
      >
        다시 시도
      </button>
    </div>
  );
}
