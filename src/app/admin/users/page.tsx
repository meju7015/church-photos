'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { useToast } from '@/hooks/useToast';

interface UserData {
  id: string;
  name: string;
  role: string;
  created_at: string;
  user_classes: { class: { name: string; department: { name: string } } }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const confirm = useConfirm();
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select('*, user_classes(class:classes(name, department:departments(name)))')
        .order('created_at', { ascending: false });
      if (data) setUsers(data as any);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setProcessingId(userId);
    const res = await window.fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      toast('역할이 변경되었습니다', 'success');
    }
    setProcessingId(null);
  };

  const handleDelete = async (user: UserData) => {
    const ok = await confirm({
      title: '사용자 삭제',
      message: `"${user.name}"님을 삭제하시겠습니까?\n모든 반 배정과 계정이 영구 삭제됩니다.`,
      confirmText: '삭제',
      danger: true,
    });
    if (!ok) return;

    setProcessingId(user.id);
    const res = await window.fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast('사용자가 삭제되었습니다', 'success');
    } else {
      const data = await res.json();
      toast(data.error || '삭제에 실패했습니다', 'error');
    }
    setProcessingId(null);
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-[var(--border)]" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[var(--text)] mb-6">사용자 관리</h1>

      <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
        {users.map((user) => (
          <div key={user.id} className={`p-4 transition-opacity ${processingId === user.id ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl gradient-candy flex items-center justify-center text-sm font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--text)]">{user.name}</p>
                  <p className="text-xs text-[var(--text-sub)]">{formatDateTime(user.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {processingId === user.id ? (
                  <svg className="w-5 h-5 animate-spin text-candy-purple" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] outline-none focus:ring-2 focus:ring-candy-purple pr-7"
                    >
                      <option value="parent">학부모</option>
                      <option value="teacher">선생님</option>
                      <option value="admin">관리자</option>
                    </select>
                    <button
                      onClick={() => handleDelete(user)}
                      className="p-1.5 rounded-lg hover:bg-candy-red/10 text-[var(--text-sub)] hover:text-candy-red transition-colors"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
            {user.user_classes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 ml-13">
                {user.user_classes.map((uc: any, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-candy-purple/10 rounded-full text-xs text-candy-purple font-medium">
                    {uc.class?.department?.name} - {uc.class?.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {users.length === 0 && (
          <p className="p-8 text-sm text-[var(--text-sub)] text-center">사용자가 없습니다</p>
        )}
      </div>
    </div>
  );
}
