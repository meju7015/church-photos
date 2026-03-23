'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(albumTitle);
  const [description, setDescription] = useState(albumDescription);
  const [eventDate, setEventDate] = useState(albumEventDate);
  const [saving, setSaving] = useState(false);

  const handleEdit = async () => {
    setSaving(true);
    const res = await fetch(`/api/albums/${albumId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, event_date: eventDate }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 앨범과 모든 사진을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    const res = await fetch(`/api/albums/${albumId}`, { method: 'DELETE' });
    if (res.ok) router.push('/');
  };

  if (editing) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-4 space-y-3 min-w-[280px]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-candy-purple"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={2}
          className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-candy-purple resize-none"
        />
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-candy-purple"
        />
        <div className="flex gap-2">
          <button onClick={handleEdit} disabled={saving} className="flex-1 py-2 gradient-candy text-white rounded-xl text-sm font-bold disabled:opacity-50">
            {saving ? '저장 중...' : '저장'}
          </button>
          <button onClick={() => setEditing(false)} className="flex-1 py-2 bg-[var(--border)] text-[var(--text-sub)] rounded-xl text-sm font-bold">
            취소
          </button>
        </div>
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
          <div className="absolute right-0 mt-1 w-36 bg-[var(--surface-card)] rounded-2xl shadow-xl border border-[var(--border)] py-1 z-50">
            <button
              onClick={() => { setMenuOpen(false); setEditing(true); }}
              className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--border)]/50"
            >
              수정
            </button>
            <button
              onClick={() => { setMenuOpen(false); handleDelete(); }}
              className="w-full text-left px-4 py-2 text-sm text-candy-red hover:bg-candy-red/5"
            >
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}
