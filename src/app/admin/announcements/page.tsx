'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/components/ConfirmDialog';
import { formatDateTime } from '@/lib/utils';

export default function AdminAnnouncementsPage() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const res = await fetch('/api/announcements');
    if (res.ok) {
      const data = await res.json();
      setAnnouncements(data);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), content: content.trim(), pinned }),
    });

    if (res.ok) {
      toast('공지사항이 등록되었습니다', 'success');
      setTitle('');
      setContent('');
      setPinned(false);
      await fetchData();
    } else {
      toast('등록에 실패했습니다', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ message: '이 공지사항을 삭제하시겠습니까?', confirmText: '삭제', danger: true });
    if (!ok) return;

    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast('삭제되었습니다', 'success');
      await fetchData();
    }
  };

  const togglePin = async (id: string, current: boolean) => {
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !current }),
    });
    if (res.ok) {
      toast(!current ? '공지가 고정되었습니다' : '고정이 해제되었습니다', 'success');
      await fetchData();
    }
  };

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[var(--text)] mb-6">공지사항 관리</h1>

      {/* 작성 폼 */}
      <form onSubmit={handleCreate} className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지사항 제목"
            maxLength={100}
            required
            className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-candy-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="공지사항 내용"
            rows={4}
            maxLength={2000}
            required
            className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-candy-purple resize-none"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 rounded accent-candy-purple"
            />
            <span className="text-sm text-[var(--text)]">상단 고정</span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 gradient-candy text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-40"
          >
            {saving ? '등록 중...' : '공지 등록'}
          </button>
        </div>
      </form>

      {/* 목록 */}
      <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
        {announcements.map((ann) => (
          <div key={ann.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {ann.pinned && (
                    <span className="text-xs font-bold text-candy-orange bg-candy-orange/10 px-2 py-0.5 rounded-full">고정</span>
                  )}
                  <h3 className="text-sm font-bold text-[var(--text)] truncate">{ann.title}</h3>
                </div>
                <p className="text-xs text-[var(--text-sub)] mt-1 line-clamp-2 whitespace-pre-line">{ann.content}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-sub)]">
                  <span>{ann.creator?.name}</span>
                  <span>{formatDateTime(ann.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePin(ann.id, ann.pinned)}
                  className={`p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors ${ann.pinned ? 'text-candy-orange' : 'text-[var(--text-sub)]'}`}
                  title={ann.pinned ? '고정 해제' : '고정'}
                >
                  <svg className="w-4 h-4" fill={ann.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75h9z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1.5 rounded-lg hover:bg-candy-red/10 text-[var(--text-sub)] hover:text-candy-red transition-colors"
                  title="삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="p-8 text-sm text-[var(--text-sub)] text-center">공지사항이 없습니다</p>
        )}
      </div>
    </div>
  );
}
