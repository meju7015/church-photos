'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';

interface UserData {
  id: string;
  name: string;
  role: string;
  created_at: string;
  user_classes: { class: { name: string; department: { name: string } } }[];
}

const roleLabels: Record<string, string> = {
  admin: '관리자',
  teacher: '선생님',
  parent: '학부모',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

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
    const res = await window.fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-[var(--border)]" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[var(--text)] mb-6">사용자 관리</h1>

      <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
        {users.map((user) => (
          <div key={user.id} className="p-4">
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
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] outline-none focus:ring-2 focus:ring-candy-purple"
              >
                <option value="parent">학부모</option>
                <option value="teacher">선생님</option>
                <option value="admin">관리자</option>
              </select>
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
