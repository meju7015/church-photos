'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface PhotoItem {
  url: string;
  storage_path: string;
}

export default function ZipDownloadButton({
  photos,
  albumTitle,
}: {
  photos: PhotoItem[];
  albumTitle: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);

    try {
      const zip = new JSZip();

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const fileName = photo.storage_path.split('/').pop() || `photo_${i + 1}.jpg`;

        const response = await fetch(photo.url);
        const blob = await response.blob();
        zip.file(fileName, blob);

        setProgress(Math.round(((i + 1) / photos.length) * 100));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${albumTitle}.zip`);
    } catch (err) {
      console.error('ZIP download error:', err);
    }

    setDownloading(false);
    setProgress(0);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="px-4 py-2.5 bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text)] rounded-2xl text-sm font-semibold hover:border-primary/30 transition-all disabled:opacity-50"
    >
      {downloading ? `다운로드 중 ${progress}%` : '전체 다운로드'}
    </button>
  );
}
