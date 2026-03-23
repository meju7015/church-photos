import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor'); // created_at of last item
  const limit = Math.min(Number(searchParams.get('limit') || 12), 50);
  const search = searchParams.get('search');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 사용자가 속한 반 조회
  const { data: userClasses } = await supabase
    .from('user_classes')
    .select('class_id')
    .eq('user_id', user.id);

  const classIds = userClasses?.map((uc) => uc.class_id) || [];
  if (classIds.length === 0) {
    return NextResponse.json({ albums: [], hasMore: false });
  }

  let query = supabase
    .from('albums')
    .select(`
      *,
      class:classes(*, department:departments(*)),
      creator:users!albums_created_by_fkey(name),
      photos(id, thumbnail_path, storage_path)
    `)
    .in('class_id', classIds)
    .order('created_at', { ascending: false })
    .limit(limit + 1); // +1 to check if there's more

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: albums, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hasMore = (albums?.length || 0) > limit;
  const items = albums?.slice(0, limit) || [];

  return NextResponse.json({ albums: items, hasMore });
}
