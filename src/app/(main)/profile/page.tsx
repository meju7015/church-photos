import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import ProfileActions from './ProfileActions';
import ProfileCard from './ProfileCard';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/join');

  // 소속 반 목록
  const { data: userClasses } = await supabase
    .from('user_classes')
    .select('*, class:classes(*, department:departments(*))')
    .eq('user_id', user.id);

  // 좋아한 앨범
  const adminSb = createAdminClient();
  const { data: likedAlbums } = await adminSb
    .from('likes')
    .select('album:albums(id, title, event_date, class:classes(name, department:departments(name)))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="space-y-6">
      {/* 프로필 카드 */}
      <ProfileCard
        profile={profile}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
      />

      {/* 소속 반 */}
      <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base text-[var(--text)]">소속 반</h2>
          <Link
            href="/join-class"
            className="text-xs font-semibold text-primary hover:underline"
          >
            반 추가
          </Link>
        </div>
        {userClasses && userClasses.length > 0 ? (
          <div className="space-y-2">
            {userClasses.map((uc: any) => (
              <Link
                key={uc.class_id}
                href={`/classes/${uc.class_id}`}
                className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-2xl hover:bg-[var(--border)]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-sm font-bold text-white">
                    {uc.class?.department?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{uc.class?.name}</p>
                    <p className="text-xs text-[var(--text-sub)]">{uc.class?.department?.name}</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-[var(--text-sub)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--text-sub)] mb-3">아직 소속된 반이 없어요</p>
            <Link href="/join-class" className="px-4 py-2 bg-primary text-white rounded-2xl text-sm font-bold btn-press">
              반 가입하기
            </Link>
          </div>
        )}
      </div>

      {/* 좋아한 앨범 */}
      {likedAlbums && likedAlbums.length > 0 && (
        <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base text-[var(--text)]">좋아한 앨범</h2>
            <Link href="/liked" className="text-xs font-semibold text-primary hover:underline">
              전체보기
            </Link>
          </div>
          <div className="space-y-2">
            {likedAlbums.map((item: any) => {
              if (!item.album) return null;
              return (
                <Link
                  key={item.album.id}
                  href={`/albums/${item.album.id}`}
                  className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-2xl hover:bg-[var(--border)]/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{item.album.title}</p>
                    <p className="text-xs text-[var(--text-sub)]">
                      {item.album.class?.department?.name} - {item.album.class?.name}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--text-sub)]">{formatDate(item.album.event_date)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 설정 */}
      <ProfileActions />
    </div>
  );
}
