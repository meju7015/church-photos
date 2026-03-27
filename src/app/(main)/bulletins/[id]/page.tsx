import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import BulletinReadMarker from './BulletinReadMarker';
import CommentSection from '@/components/CommentSection';

export const dynamic = 'force-dynamic';

const categoryLabels: Record<string, { label: string; color: string }> = {
  lesson: { label: '공과', color: 'bg-info/10 text-info' },
  supply: { label: '준비물', color: 'bg-success/10 text-success' },
  event: { label: '행사', color: 'bg-warning/10 text-warning' },
  general: { label: '일반', color: 'bg-primary/10 text-primary' },
};

export default async function BulletinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const adminSb = createAdminClient();
  const { data: bulletin } = await adminSb
    .from('bulletins')
    .select('*, class:classes(name, department:departments(name)), author:users!bulletins_author_id_fkey(name, avatar_url)')
    .eq('id', id)
    .single();

  if (!bulletin) notFound();

  // 댓글 조회
  const { data: comments } = await adminSb
    .from('comments')
    .select('*, user:users(*)')
    .eq('bulletin_id', id)
    .order('created_at', { ascending: true });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  const isTeacherOrAdmin = profile?.role === 'admin' || profile?.role === 'teacher';

  // 읽음 현황 (선생님/관리자만)
  let readStats = null;
  if (isTeacherOrAdmin) {
    const { count: totalMembers } = await adminSb
      .from('user_classes')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', bulletin.class_id);

    const { data: reads } = await adminSb
      .from('bulletin_reads')
      .select('user_id, read_at, user:users(name)')
      .eq('bulletin_id', id);

    readStats = { total: totalMembers || 0, readCount: reads?.length || 0, reads: reads || [] };
  }

  const cat = categoryLabels[bulletin.category] || categoryLabels.general;

  return (
    <div>
      {/* 읽음 처리 클라이언트 컴포넌트 */}
      <BulletinReadMarker bulletinId={id} />

      <Link
        href="/bulletins"
        className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 mb-4"
      >
        <span>&larr;</span> 알림장
      </Link>

      <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${cat.color}`}>{cat.label}</span>
            <span className="text-xs text-[var(--text-sub)]">
              {(bulletin.class as any)?.department?.name} · {(bulletin.class as any)?.name}
            </span>
          </div>
          <h1 className="text-lg font-bold text-[var(--text)]">{bulletin.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-sub)]">
            <span>{(bulletin.author as any)?.name}</span>
            <span>{formatDateTime(bulletin.created_at)}</span>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <p className="text-sm text-[var(--text)] whitespace-pre-line leading-relaxed">{bulletin.content}</p>
        </div>

        {/* 읽음 현황 (선생님/관리자만) */}
        {readStats && (
          <div className="px-6 pb-6">
            <div className="bg-[var(--bg)] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--text)]">읽음 현황</h3>
                <span className="text-sm font-bold text-primary">
                  {readStats.readCount}/{readStats.total}명
                </span>
              </div>
              {/* 진행 바 */}
              <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${readStats.total > 0 ? (readStats.readCount / readStats.total) * 100 : 0}%` }}
                />
              </div>
              {readStats.reads.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {readStats.reads.map((r: any) => (
                    <span key={r.user_id} className="text-xs bg-[var(--surface-card)] border border-[var(--border)] px-2 py-0.5 rounded-full text-[var(--text-sub)]">
                      {r.user?.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 댓글 */}
      <div className="mt-6">
        <CommentSection
          bulletinId={id}
          initialComments={comments || []}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
