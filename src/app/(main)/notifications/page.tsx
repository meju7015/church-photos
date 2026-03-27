import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const adminSb = createAdminClient();

  const { data: notifications } = await adminSb
    .from('notifications')
    .select(`
      *,
      album:albums(title, class:classes(name, department:departments(name))),
      bulletin:bulletins(title, class:classes(name, department:departments(name)))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  await adminSb
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--text)] mb-6">알림</h1>

      <div className="space-y-2">
        {notifications?.map((n) => {
          const album = n.album as any;
          const bulletin = n.bulletin as any;

          const href = n.type === 'new_bulletin'
            ? `/bulletins/${n.bulletin_id}`
            : `/albums/${n.album_id}`;

          let message: React.ReactNode;
          if (n.type === 'new_album') {
            message = (
              <>
                <span className="font-semibold">
                  {album?.class?.department?.name} {album?.class?.name}
                </span>
                에 새 앨범 &quot;{album?.title}&quot;이 등록되었습니다
              </>
            );
          } else if (n.type === 'new_comment') {
            message = (
              <>
                &quot;{album?.title}&quot; 앨범에 새 댓글이 달렸습니다
              </>
            );
          } else if (n.type === 'new_bulletin') {
            message = (
              <>
                <span className="font-semibold">
                  {bulletin?.class?.department?.name} {bulletin?.class?.name}
                </span>
                에 새 알림장 &quot;{bulletin?.title}&quot;이 등록되었습니다
              </>
            );
          }

          return (
            <Link
              key={n.id}
              href={href}
              className={`block p-4 rounded-2xl transition-all card-hover ${
                n.is_read
                  ? 'bg-[var(--surface-card)] shadow-sm shadow-black/4'
                  : 'bg-primary/5 border border-primary/20'
              }`}
            >
              <p className="text-sm text-[var(--text)]">{message}</p>
              <p className="text-xs text-[var(--text-sub)] mt-1">
                {formatDateTime(n.created_at)}
              </p>
            </Link>
          );
        })}
        {(!notifications || notifications.length === 0) && (
          <div className="text-center py-16 bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4">
            <p className="text-[var(--text-sub)]">알림이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
