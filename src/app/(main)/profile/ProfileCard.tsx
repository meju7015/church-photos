'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: string;
    created_at: string;
  };
  supabaseUrl: string;
}

export default function ProfileCard({ profile, supabaseUrl }: ProfileCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const roleLabel = profile.role === 'admin' ? '관리자' : profile.role === 'teacher' ? '선생님' : '학부모';
  const roleColor = profile.role === 'admin' ? 'bg-danger' : profile.role === 'teacher' ? 'bg-primary' : 'bg-info';

  const avatarSrc = previewUrl
    || (profile.avatar_url ? `${supabaseUrl}/storage/v1/object/public/photo/${profile.avatar_url}` : null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('5MB 이하의 이미지만 업로드 가능합니다', 'error');
      return;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast('이름을 입력해주세요', 'error');
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append('name', name);
    if (avatarFile) formData.append('avatar', avatarFile);

    const res = await fetch('/api/profile', { method: 'PATCH', body: formData });

    if (res.ok) {
      toast('프로필이 수정되었습니다', 'success');
      setEditing(false);
      setAvatarFile(null);
      router.refresh();
    } else {
      const data = await res.json();
      toast(data.error || '수정에 실패했습니다', 'error');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setName(profile.name);
    setAvatarFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-6">
      <div className="flex items-center gap-4">
        {/* 아바타 */}
        <div className="relative">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={profile.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#D1D5DB] dark:bg-[#4B5563] flex items-center justify-center text-2xl font-bold text-white">
              {profile.name.charAt(0)}
            </div>
          )}
          {editing && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center shadow-sm hover:bg-[var(--bg)] transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-[var(--text-sub)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.315z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-base font-bold text-[var(--text)] outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <h1 className="text-xl font-bold text-[var(--text)]">{profile.name}</h1>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold text-white px-2.5 py-0.5 rounded-full ${roleColor}`}>
              {roleLabel}
            </span>
            <span className="text-xs text-[var(--text-sub)]">
              {formatDate(profile.created_at)} 가입
            </span>
          </div>
        </div>

        {/* 편집 버튼 */}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="p-2 rounded-xl hover:bg-[var(--bg)] text-[var(--text-sub)] transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        )}
      </div>

      {/* 저장/취소 */}
      {editing && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 btn-press"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 bg-[var(--bg)] text-[var(--text-sub)] rounded-xl text-sm font-bold hover:bg-[var(--border)] transition-colors"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
