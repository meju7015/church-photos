'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';

const categories = [
  { value: 'lesson', label: '공과', color: 'bg-info/10 text-info border-info/20' },
  { value: 'supply', label: '준비물', color: 'bg-success/10 text-success border-success/20' },
  { value: 'event', label: '행사', color: 'bg-warning/10 text-warning border-warning/20' },
  { value: 'general', label: '일반', color: 'bg-primary/10 text-primary border-primary/20' },
];

export default function AdminBulletinWritePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('lesson');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();

      let classQuery = supabase.from('classes').select('*, department:departments(name)').order('department_id');
      if (profile?.role === 'teacher') {
        const { data: uc } = await supabase.from('user_classes').select('class_id').eq('user_id', user.id);
        const ids = uc?.map((u) => u.class_id) || [];
        if (ids.length > 0) classQuery = classQuery.in('id', ids);
      }

      const { data: classData } = await classQuery;
      setClasses(classData || []);
      if (classData?.length) setClassId(classData[0].id);
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !title.trim() || !content.trim()) return;
    setSubmitting(true);

    const res = await fetch('/api/bulletins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId, title, content, category }),
    });

    if (res.ok) {
      toast('알림장이 작성되었습니다', 'success');
      router.push('/admin/bulletins/history');
    } else {
      toast('작성에 실패했습니다', 'error');
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-primary";

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--text)] mb-6">알림장 작성</h1>

      <form onSubmit={handleSubmit} className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-2">반 선택</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className={inputClass}
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.department?.name} - {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-2">카테고리</label>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  category === cat.value ? cat.color : 'bg-[var(--bg)] text-[var(--text-sub)] border-[var(--border)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-2">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="이번주 공과: 예수님의 사랑"
            maxLength={100}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-2">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="이번주 공과 내용, 준비물, 안내사항 등을 작성해주세요"
            rows={8}
            required
            className={`${inputClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !title.trim() || !content.trim()}
          className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm disabled:opacity-40 transition-all btn-press"
        >
          {submitting ? '작성 중...' : '알림장 보내기'}
        </button>
      </form>
    </div>
  );
}
