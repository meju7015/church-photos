'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

export default function AlbumUploadPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const router = useRouter();
  const { files, previews, uploading, progress, error, addFiles, removeFile, upload } = usePhotoUpload();
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async () => {
    const supabase = createClient();
    const { data: album } = await supabase.from('albums').select('class_id').eq('id', albumId).single();
    if (!album) return;

    const success = await upload({ albumId, classId: album.class_id });
    if (success) {
      router.push(`/albums/${albumId}`);
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-extrabold text-[var(--text)] mb-6">사진 추가</h1>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
          dragOver ? 'border-candy-purple bg-candy-purple/5 scale-[1.01]' : 'border-[var(--border)] bg-[var(--surface-card)]'
        }`}
      >
        <p className="text-[var(--text-sub)] text-sm mb-3">
          사진을 드래그하거나 클릭하여 선택하세요
        </p>
        <p className="text-xs text-[var(--text-sub)] mb-3">최대 10MB, JPG/PNG/WebP</p>
        <label className="inline-block px-5 py-2.5 gradient-candy text-white rounded-2xl text-sm font-bold cursor-pointer hover:opacity-90 transition-all shadow-md shadow-candy-purple/20">
          파일 선택
          <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} className="hidden" />
        </label>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-candy-red/10 border border-candy-red/20 rounded-2xl text-sm text-candy-red whitespace-pre-line">
          {error}
        </div>
      )}

      {previews.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-[var(--text)] mb-2">선택된 사진 ({previews.length}장)</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--border)]">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeFile(index)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-xs hover:bg-black/70">&times;</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6">
          {uploading && (
            <div className="mb-3">
              <div className="h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full gradient-candy transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-[var(--text-sub)] mt-1 text-center">{progress}%</p>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-3.5 gradient-candy text-white rounded-2xl font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-md shadow-candy-purple/20"
          >
            {uploading ? '업로드 중...' : `${files.length}장 업로드`}
          </button>
        </div>
      )}
    </div>
  );
}
