import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { album_id, bulletin_id, content } = await request.json();
  if ((!album_id && !bulletin_id) || !content?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const adminSb = createAdminClient();

  const insertData: Record<string, unknown> = {
    user_id: user.id,
    content: content.trim(),
  };
  if (album_id) insertData.album_id = album_id;
  if (bulletin_id) insertData.bulletin_id = bulletin_id;

  const { data: comment, error } = await adminSb
    .from('comments')
    .insert(insertData)
    .select('*, user:users(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 알림 생성
  if (album_id) {
    const { data: album } = await adminSb.from('albums').select('class_id').eq('id', album_id).single();
    if (album) {
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
  }

  return NextResponse.json(comment);
}
