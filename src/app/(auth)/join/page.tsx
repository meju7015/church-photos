'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function JoinPage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('로그인이 필요합니다.'); return; }

      const { data: invite, error: inviteErr } = await supabase
        .from('invite_codes')
        .select('*, class:classes(*, department:departments(*))')
        .eq('code', code.toUpperCase())
        .is('used_by', null)
        .single();

      if (inviteErr || !invite) { setError('유효하지 않은 초대코드입니다.'); return; }
      if (new Date(invite.expires_at) < new Date()) { setError('만료된 초대코드입니다.'); return; }

      const { error: profileErr } = await supabase
        .from('users')
        .upsert({ id: user.id, name, kakao_id: user.user_metadata?.provider_id || null, avatar_url: user.user_metadata?.avatar_url || null, role: invite.role });
      if (profileErr) { setError('프로필 생성에 실패했습니다.'); return; }

      const { error: classErr } = await supabase
        .from('user_classes')
        .upsert({ user_id: user.id, class_id: invite.class_id, role: invite.role });
      if (classErr) { setError('반 배정에 실패했습니다.'); return; }

      await supabase.from('invite_codes').update({ used_by: user.id }).eq('id', invite.id);
      router.push('/');
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-candy-soft px-4 relative overflow-hidden">
      <div className="absolute top-20 right-16 w-20 h-20 bg-candy-yellow/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-32 left-16 w-24 h-24 bg-candy-pink/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-[var(--text)]">환영해요!</h1>
          <p className="text-[var(--text-sub)] mt-1 text-sm">선생님에게 받은 초대코드를 입력해주세요</p>
        </div>

        <form onSubmit={handleJoin} className="bg-[var(--surface-card)] rounded-3xl p-6 shadow-xl shadow-candy-purple/5 border border-[var(--border)] space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[var(--text)] mb-1.5">이름</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              required
              className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-candy-purple focus:border-transparent outline-none text-[var(--text)] placeholder-[var(--text-sub)]"
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-[var(--text)] mb-1.5">초대코드</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              required
              className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-candy-purple focus:border-transparent outline-none text-[var(--text)] placeholder-[var(--text-sub)]"
            />
          </div>

          {error && (
            <div className="text-candy-red text-sm text-center bg-candy-red/10 rounded-xl py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 6 || !name}
            className="w-full py-3.5 px-4 gradient-candy text-white rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-candy-purple/20"
          >
            {loading ? '처리 중...' : '가입하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
