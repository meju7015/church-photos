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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPinned, setEditPinned] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

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

  const startEdit = (ann: any) => {
    setEditingId(ann.id);
    setEditTitle(ann.title);
    setEditContent(ann.content);
    setEditPinned(ann.pinned);
  };

  const handleEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setEditSaving(true);

    const res = await fetch(`/api/announcements/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim(), pinned: editPinned }),
    });

    if (res.ok) {
      toast('수정되었습니다', 'success');
      setEditingId(null);
      await fetchData();
    } else {
      toast('수정에 실패했습니다', 'error');
    }
    setEditSaving(false);
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
      toast(!current ? '배너에 고정되었습니다' : '고정이 해제되었습니다', 'success');
      await fetchData();
    }
  };

  const pinnedList = announcements.filter((a) => a.pinned);
  const normalList = announcements.filter((a) => !a.pinned);

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--text)] mb-6">공지사항 관리</h1>

      {/* 작성 폼 */}
      <form onSubmit={handleCreate} className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지사항 제목"
            maxLength={100}
            required
            className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-primary"
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
            className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm text-[var(--text)]">배너 고정</span>
            <span className="text-xs text-[var(--text-sub)]">(홈 상단 슬라이드에 노출)</span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-40"
          >
            {saving ? '등록 중...' : '공지 등록'}
          </button>
        </div>
      </form>

      {/* 고정 공지 */}
      {pinnedList.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-warning mb-3 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75h9z" />
            </svg>
            배너 고정 공지
          </h2>
          <div className="bg-[var(--surface-card)] rounded-2xl border border-warning/30 divide-y divide-[var(--border)] overflow-hidden">
            {pinnedList.map((ann) => renderItem(ann))}
          </div>
        </div>
      )}

      {/* 일반 공지 */}
      <div>
        <h2 className="text-sm font-bold text-[var(--text-sub)] mb-3">전체 공지</h2>
        <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 divide-y divide-[var(--border)] overflow-hidden">
          {normalList.map((ann) => renderItem(ann))}
          {normalList.length === 0 && (
            <p className="p-8 text-sm text-[var(--text-sub)] text-center">일반 공지사항이 없습니다</p>
          )}
        </div>
      </div>

      {/* 수정 모달 */}
      {editingId && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[200]" onClick={() => setEditingId(null)} />
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 w-full max-w-md shadow-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-[var(--text)]">공지사항 수정</h3>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPinned}
                  onChange={(e) => setEditPinned(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-[var(--text)]">배너 고정</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 py-2.5 bg-[var(--border)] text-[var(--text-sub)] rounded-2xl text-sm font-bold"
                >
                  취소
                </button>
                <button
                  onClick={handleEdit}
                  disabled={editSaving}
                  className="flex-1 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold disabled:opacity-50"
                >
                  {editSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  function renderItem(ann: any) {
    return (
      <div key={ann.id} className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {ann.pinned && (
                <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">고정</span>
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
              onClick={() => startEdit(ann)}
              className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-sub)] transition-colors"
              title="수정"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button
              onClick={() => togglePin(ann.id, ann.pinned)}
              className={`p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors ${ann.pinned ? 'text-warning' : 'text-[var(--text-sub)]'}`}
              title={ann.pinned ? '고정 해제' : '배너 고정'}
            >
              <svg className="w-4 h-4" fill={ann.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75h9z" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(ann.id)}
              className="p-1.5 rounded-lg hover:bg-danger/10 text-[var(--text-sub)] hover:text-danger transition-colors"
              title="삭제"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
