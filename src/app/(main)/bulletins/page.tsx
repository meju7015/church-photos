import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const categoryConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  lesson: {
    label: '공과',
    color: 'bg-info/10 text-info',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
  },
  supply: {
    label: '준비물',
    color: 'bg-success/10 text-success',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  event: {
    label: '행사',
    color: 'bg-warning/10 text-warning',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  },
  general: {
    label: '일반',
    color: 'bg-primary/10 text-primary',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59" /></svg>,
  },
};

export default async function BulletinsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const adminSb = createAdminClient();

  const { data: userClasses } = await supabase
    .from('user_classes')
    .select('class_id')
    .eq('user_id', user.id);

  const classIds = userClasses?.map((uc) => uc.class_id) || [];

  const { data: bulletins } = classIds.length > 0
    ? await adminSb
        .from('bulletins')
        .select('*, class:classes(name, department:departments(name)), author:users!bulletins_author_id_fkey(name, avatar_url)')
        .in('class_id', classIds)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] };

  // 읽음 상태
  const bulletinIds = bulletins?.map((b) => b.id) || [];
  const { data: reads } = bulletinIds.length > 0
    ? await adminSb.from('bulletin_reads').select('bulletin_id').eq('user_id', user.id).in('bulletin_id', bulletinIds)
    : { data: [] };

  const readSet = new Set(reads?.map((r) => r.bulletin_id) || []);

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--text)] mb-6">알림장</h1>

      {(!bulletins || bulletins.length === 0) ? (
        <div className="text-center py-16 bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4">
          <svg className="w-10 h-10 mx-auto text-[var(--text-sub)] mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm font-semibold text-[var(--text-sub)]">아직 알림장이 없습니다</p>
          <p className="text-xs text-[var(--text-sub)] mt-1">선생님이 알림장을 작성하면 여기에 나타나요</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {bulletins.map((bulletin) => {
            const isRead = readSet.has(bulletin.id);
            const cat = categoryConfig[bulletin.category] || categoryConfig.general;
            return (
              <Link
                key={bulletin.id}
                href={`/bulletins/${bulletin.id}`}
                className={`block bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-4 transition-all hover:shadow-sm ${
                  !isRead ? 'border-l-3 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cat.color}`}>{cat.label}</span>
                      <span className="text-xs text-[var(--text-sub)]">
                        {(bulletin.class as any)?.department?.name} · {(bulletin.class as any)?.name}
                      </span>
                    </div>
                    <h3 className={`text-sm text-[var(--text)] line-clamp-1 ${!isRead ? 'font-bold' : 'font-medium'}`}>
                      {bulletin.title}
                    </h3>
                    <p className="text-xs text-[var(--text-sub)] line-clamp-1 mt-0.5">{bulletin.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-[var(--text-sub)]">{(bulletin.author as any)?.name}</span>
                      <span className="text-[11px] text-[var(--text-sub)]">{formatDate(bulletin.created_at)}</span>
                    </div>
                  </div>
                  {!isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
