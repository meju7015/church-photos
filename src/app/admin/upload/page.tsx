'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useToast } from '@/hooks/useToast';
import type { Department, Class } from '@/types';

const inputClass = "w-full px-4 pr-7 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-[var(--text)] placeholder-[var(--text-sub)]";
const labelClass = "block text-sm font-semibold text-[var(--text)] mb-1.5";

export default function AdminUploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { files, previews, uploading, progress, error: uploadError, addFiles, removeFile, upload } = usePhotoUpload();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('departments').select('*').order('sort_order');
      if (data) setDepartments(data);
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    if (!selectedDept) { setClasses([]); return; }
    const fetchClasses = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('classes').select('*').eq('department_id', selectedDept).order('name');
      if (data) setClasses(data);
    };
    fetchClasses();
  }, [selectedDept]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !title || files.length === 0) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: album, error: albumErr } = await supabase
      .from('albums')
      .insert({ class_id: selectedClass, title, description: description || null, event_date: eventDate, created_by: user.id })
      .select()
      .single();

    if (albumErr || !album) { toast('앨범 생성에 실패했습니다', 'error'); return; }

    const success = await upload({ albumId: album.id, classId: selectedClass });
    if (!success) return;

    // 알림 생성
    const { data: classMembers } = await supabase.from('user_classes').select('user_id').eq('class_id', selectedClass);
    if (classMembers) {
      const notifications = classMembers
        .filter((m) => m.user_id !== user.id)
        .map((m) => ({ user_id: m.user_id, album_id: album.id, type: 'new_album' as const }));
      if (notifications.length > 0) await supabase.from('notifications').insert(notifications);
    }

    router.push(`/albums/${album.id}`);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-[var(--text)] mb-6">새 앨범 생성</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>부서</label>
              <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedClass(''); }} required className={inputClass}>
                <option value="">선택</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>반</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required disabled={!selectedDept} className={`${inputClass} disabled:opacity-50`}>
                <option value="">선택</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>앨범 제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 3월 셋째주 주일예배" required maxLength={100} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>행사 날짜</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>설명 (선택)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="앨범에 대한 간단한 설명" rows={2} maxLength={500} className={`${inputClass} resize-none`} />
          </div>
        </div>

        {/* Photo upload */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-[var(--border)] bg-[var(--surface-card)]'
          }`}
        >
          <p className="text-[var(--text-sub)] text-sm mb-1">사진을 드래그하거나 클릭하여 선택</p>
          <p className="text-xs text-[var(--text-sub)] mb-3">최대 10MB, JPG/PNG/WebP</p>
          <label className="inline-block px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold cursor-pointer hover:opacity-90 shadow-sm">
            파일 선택
            <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} className="hidden" />
          </label>
        </div>

        {uploadError && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-2xl text-sm text-danger whitespace-pre-line">
            {uploadError}
          </div>
        )}

        {previews.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[var(--text)] mb-2">{files.length}장 선택됨</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--border)]">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFile(index)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-xs">&times;</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div>
            <div className="h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-[var(--text-sub)] mt-1 text-center">{progress}%</p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !selectedClass || !title || files.length === 0}
          className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {uploading ? '업로드 중...' : `앨범 생성 (${files.length}장)`}
        </button>
      </form>
    </div>
  );
}
