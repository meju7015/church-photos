import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { album_id, content } = await request.json();
  if (!album_id || !content?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const adminSb = createAdminClient();

  // 댓글 삽입
  const { data: comment, error } = await adminSb
    .from('comments')
    .insert({ album_id, user_id: user.id, content: content.trim() })
    .select('*, user:users(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 앨범의 class_id 조회
  const { data: album } = await adminSb
    .from('albums')
    .select('class_id')
    .eq('id', album_id)
    .single();

  if (album) {
    // 같은 반 멤버들에게 알림 생성 (본인 제외)
    const { data: classMembers } = await adminSb
      .from('user_classes')
      .select('user_id')
      .eq('class_id', album.class_id);

    if (classMembers) {
      const notifications = classMembers
        .filter((m) => m.user_id !== user.id)
        .map((m) => ({ user_id: m.user_id, album_id, type: 'new_comment' as const }));

      if (notifications.length > 0) {
        await adminSb.from('notifications').insert(notifications);
      }
    }
  }

  return NextResponse.json(comment);
}
