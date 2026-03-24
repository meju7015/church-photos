'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) setError('로그인에 실패했습니다. 다시 시도해주세요.');
  }, []);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKakaoLogin = () => {
    window.location.href = '/api/auth/kakao';
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        router.push('/join');
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        router.push(data.needsJoin ? '/join' : '/');
      }
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-candy-soft px-4 relative overflow-hidden">
      <div className="w-full max-w-sm text-center relative z-10">
        <div className="mb-8">
          <div className="w-24 h-24 gradient-candy rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-lg shadow-candy-purple/20 animate-bounce-soft rotate-3">
            <span className="text-5xl">📸</span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue bg-clip-text text-transparent">
            우리교회
          </h1>
          <h2 className="text-xl font-bold text-[var(--text)] mt-1">포토앨범</h2>
          <p className="text-[var(--text-sub)] mt-2 text-sm">
            우리 아이들의 소중한 순간을 함께해요
          </p>
        </div>

        <div className="bg-[var(--surface-card)] rounded-3xl p-6 shadow-xl shadow-candy-purple/5 border border-[var(--border)] space-y-4">
          {/* 카카오 로그인 */}
          <button
            onClick={handleKakaoLogin}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
            style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.722 1.812 5.108 4.54 6.458-.2.747-.724 2.708-.83 3.13-.13.528.193.52.407.378.168-.11 2.671-1.813 3.755-2.556.694.1 1.407.152 2.128.152 5.523 0 10-3.463 10-7.562C22 6.463 17.523 3 12 3z" />
            </svg>
            카카오로 시작하기
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-sub)]">또는</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* 이메일 로그인/회원가입 */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'signup' && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
                required
                className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm focus:ring-2 focus:ring-candy-purple focus:border-transparent outline-none text-[var(--text)] placeholder-[var(--text-sub)]"
              />
            )}
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="아이디 또는 이메일"
              required
              className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm focus:ring-2 focus:ring-candy-purple focus:border-transparent outline-none text-[var(--text)] placeholder-[var(--text-sub)]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (6자 이상)"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm focus:ring-2 focus:ring-candy-purple focus:border-transparent outline-none text-[var(--text)] placeholder-[var(--text-sub)]"
            />

            {error && (
              <div className="text-candy-red text-xs text-center bg-candy-red/10 rounded-xl py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 gradient-candy text-white rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-md shadow-candy-purple/20"
            >
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>

          <p className="text-xs text-[var(--text-sub)]">
            {mode === 'login' ? (
              <>
                계정이 없으신가요?{' '}
                <button onClick={() => { setMode('signup'); setError(''); }} className="text-candy-purple font-semibold">
                  회원가입
                </button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="text-candy-purple font-semibold">
                  로그인
                </button>
              </>
            )}
          </p>

          <p className="text-xs text-[var(--text-sub)]">
            최초 로그인 시 초대코드가 필요합니다
          </p>
        </div>
      </div>
    </div>
  );
}
