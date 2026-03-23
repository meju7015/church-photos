import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminSb = createAdminClient();

  // 기존 좋아요 확인
  const { data: existing } = await adminSb
    .from('likes')
    .select('id')
    .eq('album_id', albumId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // 이미 좋아요 → 취소
    await adminSb.from('likes').delete().eq('id', existing.id);

    const { count } = await adminSb
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('album_id', albumId);

    return NextResponse.json({ liked: false, count: count || 0 });
  }

  // 좋아요 추가
  await adminSb.from('likes').insert({ album_id: albumId, user_id: user.id });

  const { count } = await adminSb
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('album_id', albumId);

  return NextResponse.json({ liked: true, count: count || 0 });
}
