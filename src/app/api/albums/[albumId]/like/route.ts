import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('likes')
    .insert({ album_id: albumId, user_id: user.id });

  if (error?.code === '23505') {
    // 이미 좋아요 → 취소 (토글)
    await supabase
      .from('likes')
      .delete()
      .eq('album_id', albumId)
      .eq('user_id', user.id);

    return NextResponse.json({ liked: false });
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ liked: true });
}
