'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils';

const categories = [
  { value: 'lesson', label: '공과', color: 'bg-info/10 text-info border-info/20' },
  { value: 'supply', label: '준비물', color: 'bg-success/10 text-success border-success/20' },
  { value: 'event', label: '행사', color: 'bg-warning/10 text-warning border-warning/20' },
  { value: 'general', label: '일반', color: 'bg-primary/10 text-primary border-primary/20' },
];

export default function AdminBulletinHistoryPage() {
  const { toast } = useToast();
  const confirm = useConfirm();

  const [bulletins, setBulletins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBulletins = async () => {
      const res = await fetch('/api/bulletins');
      const data = await res.json();
      setBulletins(data.bulletins || []);
      setLoading(false);
    };
    fetchBulletins();
  }, []);

  const startEdit = (b: any) => {
    setEditingId(b.id);
    setEditTitle(b.title);
    setEditContent(b.content);
    setEditCategory(b.category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleSave = async () => {
    if (!editingId || !editTitle.trim() || !editContent.trim()) return;
    setSaving(true);

    const res = await fetch(`/api/bulletins/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, content: editContent, category: editCategory }),
    });

    if (res.ok) {
      const updated = await res.json();
      setBulletins((prev) =>
        prev.map((b) => (b.id === editingId ? { ...b, ...updated } : b))
      );
      toast('수정되었습니다', 'success');
      cancelEdit();
    } else {
      toast('수정에 실패했습니다', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: '알림장 삭제',
      message: '이 알림장을 삭제하시겠습니까?',
      confirmText: '삭제',
      danger: true,
    });
    if (!ok) return;

    const res = await fetch(`/api/bulletins/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setBulletins((prev) => prev.filter((b) => b.id !== id));
      toast('삭제되었습니다', 'success');
    } else {
      toast('삭제에 실패했습니다', 'error');
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-primary";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[var(--text)]">알림장 내역</h1>
        <Link
          href="/admin/bulletins"
          className="px-4 py-2 bg-primary text-white rounded-2xl text-sm font-bold btn-press"
        >
          새 알림장
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      ) : bulletins.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4">
          <svg className="w-10 h-10 mx-auto text-[var(--text-sub)] mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm font-semibold text-[var(--text-sub)]">작성한 알림장이 없습니다</p>
          <Link href="/admin/bulletins" className="inline-block mt-4 px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold btn-press">
            첫 알림장 작성하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bulletins.map((b) => {
            const cat = categories.find((c) => c.value === b.category);
            const isEditing = editingId === b.id;

            if (isEditing) {
              return (
                <div key={b.id} className="bg-[var(--surface-card)] rounded-2xl border border-primary/30 p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[var(--text-sub)]">
                      {b.class?.department?.name} · {b.class?.name}
                    </span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {categories.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setEditCategory(c.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          editCategory === c.value ? c.color : 'bg-[var(--bg)] text-[var(--text-sub)] border-[var(--border)]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={inputClass}
                    maxLength={100}
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving || !editTitle.trim() || !editContent.trim()}
                      className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 btn-press"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 py-2.5 bg-[var(--border)] text-[var(--text-sub)] rounded-xl text-sm font-bold"
                    >
                      취소
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={b.id} className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-4 flex items-start gap-4 hover:bg-[var(--border)]/10 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cat?.color?.replace(' border-info/20', '').replace(' border-success/20', '').replace(' border-warning/20', '').replace(' border-primary/20', '') || 'bg-primary/10 text-primary'}`}>
                      {cat?.label || '일반'}
                    </span>
                    <span className="text-xs text-[var(--text-sub)]">
                      {b.class?.department?.name} · {b.class?.name}
                    </span>
                    <span className="text-xs text-[var(--text-sub)]">{formatDate(b.created_at)}</span>
                  </div>
                  <Link href={`/bulletins/${b.id}`} className="text-sm font-semibold text-[var(--text)] hover:underline truncate block">
                    {b.title}
                  </Link>
                  <p className="text-xs text-[var(--text-sub)] mt-0.5 line-clamp-1">{b.content}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(b)}
                    className="p-2 rounded-xl hover:bg-[var(--border)] text-[var(--text-sub)] hover:text-[var(--text)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 rounded-xl hover:bg-danger/10 text-[var(--text-sub)] hover:text-danger transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
