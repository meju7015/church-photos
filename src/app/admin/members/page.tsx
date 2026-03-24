'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateInviteCode } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import type { Department, Class, InviteCode } from '@/types';

const inputClass = "px-4 pr-7 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-candy-purple outline-none text-[var(--text)] placeholder-[var(--text-sub)]";

export default function AdminMembersPage() {
  const confirm = useConfirm();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [inviteRole, setInviteRole] = useState<'parent' | 'teacher'>('parent');
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [newCode, setNewCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('departments').select('*').order('sort_order');
      if (data) setDepartments(data);
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    if (!selectedDept) return;
    const fetchClasses = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('classes').select('*').eq('department_id', selectedDept).order('name');
      if (data) setClasses(data);
    };
    fetchClasses();
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchData = async () => {
      const supabase = createClient();
      const { data: codes } = await supabase.from('invite_codes').select('*').eq('class_id', selectedClass).order('created_at', { ascending: false });
      if (codes) setInviteCodes(codes);
      const { data: mems } = await supabase.from('user_classes').select('*, user:users(*)').eq('class_id', selectedClass);
      if (mems) setMembers(mems);
    };
    fetchData();
  }, [selectedClass]);

  const handleCreateCode = async () => {
    if (!selectedClass) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data } = await supabase
      .from('invite_codes')
      .insert({ code, class_id: selectedClass, role: inviteRole, created_by: user.id, expires_at: expiresAt.toISOString() })
      .select()
      .single();

    if (data) {
      setInviteCodes((prev) => [data, ...prev]);
      setNewCode(code);
    }
    setLoading(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast('초대코드가 복사되었습니다', 'success');
  };

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[var(--text)] mb-6">학부모 관리</h1>

      {/* 반 선택 */}
      <div className="flex gap-3 mb-6">
        <select
          value={selectedDept}
          onChange={(e) => { setSelectedDept(e.target.value); setSelectedClass(''); }}
          className={inputClass}
        >
          <option value="">부서 선택</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          disabled={!selectedDept}
          className={`${inputClass} disabled:opacity-50`}
        >
          <option value="">반 선택</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {selectedClass && (
        <>
          {/* 초대코드 생성 */}
          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-6 mb-6">
            <h2 className="font-bold text-sm text-[var(--text)] mb-4">초대코드 생성</h2>
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-xs text-[var(--text-sub)] mb-1">역할</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'parent' | 'teacher')}
                  className="px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none"
                >
                  <option value="parent">학부모</option>
                  <option value="teacher">선생님</option>
                </select>
              </div>
              <button
                onClick={handleCreateCode}
                disabled={loading}
                className="px-4 py-2 gradient-candy text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40"
              >
                코드 생성
              </button>
            </div>

            {newCode && (
              <div className="mt-4 p-4 bg-candy-green/10 border border-candy-green/20 rounded-2xl">
                <p className="text-sm text-candy-green mb-2">초대코드가 생성되었습니다!</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-bold tracking-widest text-[var(--text)]">{newCode}</span>
                  <button
                    onClick={() => copyCode(newCode)}
                    className="px-3 py-1 bg-candy-green text-white rounded-lg text-xs font-bold"
                  >
                    복사
                  </button>
                </div>
                <p className="text-xs text-candy-green/70 mt-1">7일간 유효합니다</p>
              </div>
            )}
          </div>

          {/* 초대코드 목록 */}
          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-6 mb-6">
            <h2 className="font-bold text-sm text-[var(--text)] mb-4">초대코드 목록</h2>
            <div className="space-y-2">
              {inviteCodes.map((ic) => (
                <div key={ic.id} className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-xl">
                  <div>
                    <span className="font-mono font-bold text-sm text-[var(--text)]">{ic.code}</span>
                    <span className="ml-2 text-xs text-[var(--text-sub)]">
                      {ic.role === 'teacher' ? '선생님' : '학부모'}
                    </span>
                  </div>
                  <div className="text-right">
                    {ic.used_by ? (
                      <span className="text-xs text-candy-green">사용됨</span>
                    ) : new Date(ic.expires_at) < new Date() ? (
                      <span className="text-xs text-candy-red">만료</span>
                    ) : (
                      <button
                        onClick={() => copyCode(ic.code)}
                        className="text-xs text-candy-purple hover:underline"
                      >
                        복사
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {inviteCodes.length === 0 && (
                <p className="text-sm text-[var(--text-sub)] text-center py-4">초대코드가 없습니다</p>
              )}
            </div>
          </div>

          {/* 멤버 목록 */}
          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-6">
            <h2 className="font-bold text-sm text-[var(--text)] mb-4">
              멤버 ({members.length}명)
            </h2>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.user_id} className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl gradient-candy flex items-center justify-center text-xs font-bold text-white">
                      {m.user?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-semibold text-[var(--text)]">{m.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-sub)]">
                      {m.role === 'teacher' ? '선생님' : '학부모'}
                    </span>
                    <button
                      onClick={async () => {
                        const ok = await confirm({ message: `${m.user?.name}님을 이 반에서 제거하시겠습니까?`, confirmText: '제거', danger: true });
                        if (!ok) return;
                        const supabase = createClient();
                        await supabase.from('user_classes').delete().eq('user_id', m.user_id).eq('class_id', selectedClass);
                        setMembers((prev) => prev.filter((x) => x.user_id !== m.user_id));
                        toast('멤버가 제거되었습니다', 'success');
                      }}
                      className="text-xs text-candy-red/60 hover:text-candy-red"
                    >
                      제거
                    </button>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-sm text-[var(--text-sub)] text-center py-4">멤버가 없습니다</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
