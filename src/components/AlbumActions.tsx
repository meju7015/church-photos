'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/components/ConfirmDialog';

export default function AlbumActions({
  albumId,
  albumTitle,
  albumDescription,
  albumEventDate,
}: {
  albumId: string;
  albumTitle: string;
  albumDescription: string;
  albumEventDate: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(albumTitle);
  const [description, setDescription] = useState(albumDescription);
  const [eventDate, setEventDate] = useState(albumEventDate);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = async () => {
    setSaving(true);
    const res = await fetch(`/api/albums/${albumId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, event_date: eventDate }),
    });
    setSaving(false);
    if (res.ok) {
      toast('앨범이 수정되었습니다', 'success');
      setEditing(false);
      router.refresh();
    } else {
      toast('수정에 실패했습니다', 'error');
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: '앨범 삭제',
      message: '이 앨범과 모든 사진을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      confirmText: '삭제',
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    const res = await fetch(`/api/albums/${albumId}`, { method: 'DELETE' });
    if (res.ok) {
      toast('앨범이 삭제되었습니다', 'success');
      router.push('/');
    } else {
      toast('삭제에 실패했습니다', 'error');
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-4 space-y-3 min-w-[280px]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-primary"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={2}
          className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-2">
          <button onClick={handleEdit} disabled={saving} className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 btn-press">
            {saving ? '저장 중...' : '저장'}
          </button>
          <button onClick={() => setEditing(false)} className="flex-1 py-2 bg-[var(--border)] text-[var(--text-sub)] rounded-xl text-sm font-bold">
            취소
          </button>
        </div>
      </div>
    );
  }

  if (deleting) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--text-sub)]">
        <svg className="w-4 h-4 animate-spin text-danger" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        삭제 중...
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 rounded-xl hover:bg-[var(--border)] text-[var(--text-sub)] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 mt-1 w-36 bg-[var(--surface-card)] rounded-2xl shadow-xl border border-[var(--border)] py-1 z-50 animate-fade-up">
            <button
              onClick={() => { setMenuOpen(false); setEditing(true); }}
              className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--border)]/50"
            >
              수정
            </button>
            <button
              onClick={() => { setMenuOpen(false); handleDelete(); }}
              className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/5"
            >
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}
