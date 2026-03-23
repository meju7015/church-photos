import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, album:albums(title, class:classes(name, department:departments(name)))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[var(--text)] mb-6">
        알림
      </h1>

      <div className="space-y-2">
        {notifications?.map((n) => {
          const album = n.album as any;
          return (
            <Link
              key={n.id}
              href={`/albums/${n.album_id}`}
              className={`block p-4 rounded-2xl border transition-all card-hover ${
                n.is_read
                  ? 'bg-[var(--surface-card)] border-[var(--border)]'
                  : 'bg-candy-purple/5 border-candy-purple/20'
              }`}
            >
              <p className="text-sm text-[var(--text)]">
                {n.type === 'new_album' ? (
                  <>
                    <span className="font-semibold">
                      {album?.class?.department?.name} {album?.class?.name}
                    </span>
                    에 새 앨범 &quot;{album?.title}&quot;이 등록되었습니다
                  </>
                ) : (
                  <>
                    &quot;{album?.title}&quot; 앨범에 새 댓글이 달렸습니다
                  </>
                )}
              </p>
              <p className="text-xs text-[var(--text-sub)] mt-1">
                {formatDateTime(n.created_at)}
              </p>
            </Link>
          );
        })}
        {(!notifications || notifications.length === 0) && (
          <div className="text-center py-16 bg-[var(--surface-card)] rounded-3xl border border-[var(--border)]">
            <p className="text-[var(--text-sub)]">알림이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
