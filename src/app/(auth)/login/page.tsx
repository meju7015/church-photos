'use client';

export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href = '/api/auth/kakao';
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-candy-soft px-4 relative overflow-hidden">

      <div className="w-full max-w-sm text-center relative z-10">
        <div className="mb-8">
          {/* Cute camera icon */}
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

        <div className="bg-[var(--surface-card)] rounded-3xl p-6 shadow-xl shadow-candy-purple/5 border border-[var(--border)]">
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

          <p className="text-xs text-[var(--text-sub)] mt-4">
            최초 로그인 시 초대코드가 필요합니다
          </p>
        </div>

      </div>
    </div>
  );
}
