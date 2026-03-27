'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-bold text-[var(--text)] mb-2">관리자 페이지 오류</h2>
      <p className="text-sm text-[var(--text-sub)] mb-6">다시 시도해주세요.</p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all"
      >
        다시 시도
      </button>
    </div>
  );
}
