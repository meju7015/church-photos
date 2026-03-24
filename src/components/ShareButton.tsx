'use client';

import { useToast } from '@/hooks/useToast';

export default function ShareButton({ title }: { title: string }) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast('링크가 복사되었습니다', 'success');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-4 py-2.5 bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text-sub)] rounded-2xl text-sm font-semibold hover:border-candy-purple/40 transition-colors flex items-center gap-1.5"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
      공유
    </button>
  );
}
