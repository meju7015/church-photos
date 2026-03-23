'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const THUMBNAIL_MAX_WIDTH = 800;
const THUMBNAIL_QUALITY = 0.7;

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    return `"${file.name}"은(는) 지원하지 않는 파일 형식입니다.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return `"${file.name}" (${sizeMB}MB)이(가) 10MB를 초과합니다.`;
  }
  return null;
}

async function createThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > THUMBNAIL_MAX_WIDTH) {
        height = (height * THUMBNAIL_MAX_WIDTH) / width;
        width = THUMBNAIL_MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob || file),
        'image/jpeg',
        THUMBNAIL_QUALITY
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

interface UploadOptions {
  albumId: string;
  classId: string;
}

export function usePhotoUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(newFiles).forEach((file) => {
      const err = validateFile(file);
      if (err) {
        errors.push(err);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      setTimeout(() => setError(null), 5000);
    }

    setFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setPreviews([]);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(async ({ albumId, classId }: UploadOptions) => {
    if (files.length === 0) return false;
    setUploading(true);
    setProgress(0);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('로그인이 필요합니다.'); setUploading(false); return false; }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        const originalPath = `${classId}/${albumId}/${timestamp}_${i}.${ext}`;
        const thumbPath = `${classId}/${albumId}/thumb_${timestamp}_${i}.jpg`;

        // 원본 업로드
        const { error: uploadErr } = await supabase.storage
          .from('photo')
          .upload(originalPath, file, { contentType: file.type });

        if (uploadErr) {
          setError(`업로드 실패: ${uploadErr.message}`);
          setUploading(false);
          return false;
        }

        // 썸네일 생성 및 업로드
        const thumbnail = await createThumbnail(file);
        await supabase.storage
          .from('photo')
          .upload(thumbPath, thumbnail, { contentType: 'image/jpeg' });

        // DB 기록
        await supabase.from('photos').insert({
          album_id: albumId,
          storage_path: originalPath,
          thumbnail_path: thumbPath,
          uploaded_by: user.id,
        });

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
    } catch (err) {
      setError('업로드 중 오류가 발생했습니다.');
      setUploading(false);
      return false;
    }

    setUploading(false);
    return true;
  }, [files]);

  return {
    files,
    previews,
    uploading,
    progress,
    error,
    addFiles,
    removeFile,
    clearFiles,
    upload,
  };
}
