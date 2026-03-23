'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Department, Class } from '@/types';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classesMap, setClassesMap] = useState<Record<string, Class[]>>({});
  const [newDeptName, setNewDeptName] = useState('');
  const [newClassNames, setNewClassNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: depts } = await supabase
      .from('departments')
      .select('*')
      .order('sort_order');

    if (depts) {
      setDepartments(depts);
      const { data: allClasses } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      const map: Record<string, Class[]> = {};
      depts.forEach((d) => {
        map[d.id] = allClasses?.filter((c) => c.department_id === d.id) || [];
      });
      setClassesMap(map);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addDepartment = async () => {
    if (!newDeptName.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from('departments').insert({
      name: newDeptName.trim(),
      sort_order: departments.length + 1,
    });
    setNewDeptName('');
    await fetchData();
    setLoading(false);
  };

  const addClass = async (deptId: string) => {
    const name = newClassNames[deptId]?.trim();
    if (!name) return;
    const supabase = createClient();
    await supabase.from('classes').insert({ department_id: deptId, name });
    setNewClassNames((prev) => ({ ...prev, [deptId]: '' }));
    await fetchData();
  };

  const deleteClass = async (classId: string) => {
    if (!confirm('이 반을 삭제하시겠습니까?')) return;
    const supabase = createClient();
    await supabase.from('classes').delete().eq('id', classId);
    await fetchData();
  };

  const moveDepartment = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= departments.length) return;

    const supabase = createClient();
    const a = departments[index];
    const b = departments[swapIndex];

    await Promise.all([
      supabase.from('departments').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('departments').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);

    await fetchData();
  };

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[var(--text)] mb-6">부서/반 관리</h1>

      {/* 부서 추가 */}
      <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="새 부서 이름"
            className="flex-1 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm focus:ring-2 focus:ring-candy-purple outline-none text-[var(--text)] placeholder-[var(--text-sub)]"
          />
          <button
            onClick={addDepartment}
            disabled={loading}
            className="px-4 py-2.5 gradient-candy text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-40"
          >
            부서 추가
          </button>
        </div>
      </div>

      {/* 부서별 반 목록 */}
      <div className="space-y-4">
        {departments.map((dept, index) => (
          <div key={dept.id} className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-[var(--text)]">{dept.name}</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => moveDepartment(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg hover:bg-[var(--border)] disabled:opacity-20 text-[var(--text-sub)]"
                  title="위로"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveDepartment(index, 'down')}
                  disabled={index === departments.length - 1}
                  className="p-1.5 rounded-lg hover:bg-[var(--border)] disabled:opacity-20 text-[var(--text-sub)]"
                  title="아래로"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {(classesMap[dept.id] || []).map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-2.5 bg-[var(--bg)] rounded-xl">
                  <span className="text-sm text-[var(--text)]">{cls.name}</span>
                  <button
                    onClick={() => deleteClass(cls.id)}
                    className="text-xs text-candy-red/60 hover:text-candy-red"
                  >
                    삭제
                  </button>
                </div>
              ))}
              {(classesMap[dept.id] || []).length === 0 && (
                <p className="text-xs text-[var(--text-sub)] py-2">반이 없습니다</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newClassNames[dept.id] || ''}
                onChange={(e) => setNewClassNames((prev) => ({ ...prev, [dept.id]: e.target.value }))}
                placeholder="새 반 이름"
                className="flex-1 px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm focus:ring-2 focus:ring-candy-purple outline-none text-[var(--text)] placeholder-[var(--text-sub)]"
              />
              <button
                onClick={() => addClass(dept.id)}
                className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-xl text-sm font-semibold hover:border-candy-purple/40"
              >
                반 추가
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
