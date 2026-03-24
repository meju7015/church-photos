'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoViewer from './PhotoViewer';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/components/ConfirmDialog';

interface PhotoItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  storage_path: string;
  uploader?: { name: string };
  canDelete?: boolean;
}

export default function PhotoGrid({
  photos: initialPhotos,
  albumId,
}: {
  photos: PhotoItem[];
  albumId: string;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();

  const canSelectAny = photos.some((p) => p.canDelete);

  const handleDelete = async (photoId: string) => {
    const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      router.refresh();
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchDelete = async () => {
    if (selected.size === 0) return;
    const ok = await confirm({
      title: '사진 일괄 삭제',
      message: `선택한 ${selected.size}장의 사진을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      confirmText: `${selected.size}장 삭제`,
      danger: true,
    });
    if (!ok) return;

    setDeleting(true);
    const res = await fetch('/api/photos/batch', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoIds: Array.from(selected) }),
    });

    if (res.ok) {
      const data = await res.json();
      setPhotos((prev) => prev.filter((p) => !selected.has(p.id)));
      setSelected(new Set());
      setSelectMode(false);
      toast(`${data.deleted}장이 삭제되었습니다`, 'success');
      router.refresh();
    } else {
      toast('삭제에 실패했습니다', 'error');
    }
    setDeleting(false);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 bg-[var(--surface-card)] rounded-3xl border border-[var(--border)]">
        <p className="text-[var(--text-sub)]">아직 사진이 없습니다</p>
        <p className="text-xs text-[var(--text-sub)] mt-1">사진을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <>
      {/* 선택 모드 토글 */}
      {canSelectAny && (
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              setSelectMode(!selectMode);
              setSelected(new Set());
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
              selectMode
                ? 'gradient-candy text-white'
                : 'bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text-sub)] hover:border-candy-purple/40'
            }`}
          >
            {selectMode ? '취소' : '선택'}
          </button>
          {selectMode && selected.size > 0 && (
            <span className="text-xs text-candy-purple font-semibold">{selected.size}장 선택</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => {
              if (selectMode && photo.canDelete) {
                toggleSelect(photo.id);
              } else {
                setViewerIndex(index);
              }
            }}
            className={`aspect-square bg-[var(--border)] rounded-2xl overflow-hidden transition-all relative ${
              selectMode ? '' : 'hover:opacity-90 hover:scale-[1.02]'
            } ${selected.has(photo.id) ? 'ring-3 ring-candy-purple ring-offset-2 ring-offset-[var(--bg)]' : ''}`}
          >
            <img
              src={photo.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {selectMode && photo.canDelete && (
              <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selected.has(photo.id)
                  ? 'bg-candy-purple border-candy-purple'
                  : 'bg-black/30 border-white/80'
              }`}>
                {selected.has(photo.id) && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 일괄 삭제 플로팅 바 */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100]">
          <button
            onClick={handleBatchDelete}
            disabled={deleting}
            className="px-6 py-3 bg-candy-red text-white rounded-2xl text-sm font-bold shadow-lg shadow-candy-red/30 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? '삭제 중...' : `${selected.size}장 삭제`}
          </button>
        </div>
      )}

      {viewerIndex !== null && (
        <PhotoViewer
          photos={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
