'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinClassPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/join-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      setSuccess(`${data.className}에 추가되었습니다!`);
      setCode('');
      setTimeout(() => router.push('/'), 1500);
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto py-8">
      <h1 className="text-xl font-bold text-[var(--text)] mb-2">반 추가</h1>
      <p className="text-sm text-[var(--text-sub)] mb-6">다른 반의 초대코드를 입력하여 추가로 가입하세요</p>

      <form onSubmit={handleJoin} className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">초대코드</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            required
            className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-[var(--text)] placeholder-[var(--text-sub)]"
          />
        </div>

        {error && (
          <div className="text-danger text-sm text-center bg-danger/10 rounded-xl py-2">{error}</div>
        )}
        {success && (
          <div className="text-success text-sm text-center bg-success/10 rounded-xl py-2">{success}</div>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
        >
          {loading ? '처리 중...' : '반 추가'}
        </button>
      </form>
    </div>
  );
}
