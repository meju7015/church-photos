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
    await supabase.from('classes').insert({
      department_id: deptId,
      name,
    });
    setNewClassNames((prev) => ({ ...prev, [deptId]: '' }));
    await fetchData();
  };

  const deleteClass = async (classId: string) => {
    if (!confirm('이 반을 삭제하시겠습니까?')) return;
    const supabase = createClient();
    await supabase.from('classes').delete().eq('id', classId);
    await fetchData();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">부서/반 관리</h1>

      {/* 부서 추가 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="새 부서 이름"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={addDepartment}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300"
          >
            부서 추가
          </button>
        </div>
      </div>

      {/* 부서별 반 목록 */}
      <div className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-2xl border border-gray-200 p-4">
            <h2 className="font-bold text-sm mb-3">{dept.name}</h2>

            <div className="space-y-2 mb-3">
              {(classesMap[dept.id] || []).map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{cls.name}</span>
                  <button
                    onClick={() => deleteClass(cls.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              ))}
              {(classesMap[dept.id] || []).length === 0 && (
                <p className="text-xs text-gray-400 py-2">반이 없습니다</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newClassNames[dept.id] || ''}
                onChange={(e) =>
                  setNewClassNames((prev) => ({ ...prev, [dept.id]: e.target.value }))
                }
                placeholder="새 반 이름"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={() => addClass(dept.id)}
                className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
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
