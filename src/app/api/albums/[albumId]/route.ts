import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  const { data: album } = await supabase.from('albums').select('created_by').eq('id', albumId).single();

  if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (album.created_by !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, string> = {};
  if (body.title) updates.title = String(body.title).slice(0, 100);
  if (body.description !== undefined) updates.description = body.description ? String(body.description).slice(0, 500) : null as any;
  if (body.event_date) updates.event_date = body.event_date;

  // RLS에 UPDATE 정책이 없을 수 있으므로 admin client 사용
  const adminSb = createAdminClient();
  const { error } = await adminSb.from('albums').update(updates).eq('id', albumId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  const { data: album } = await supabase.from('albums').select('created_by, class_id').eq('id', albumId).single();

  if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (album.created_by !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Storage에서 사진 삭제
  const { data: photos } = await supabase.from('photos').select('storage_path, thumbnail_path').eq('album_id', albumId);
  if (photos && photos.length > 0) {
    const paths = photos.flatMap((p) => [p.storage_path, p.thumbnail_path].filter(Boolean) as string[]);
    const adminSb = createAdminClient();
    await adminSb.storage.from('photo').remove(paths);
  }

  // DB에서 앨범 삭제 (CASCADE로 photos, comments, notifications도 삭제)
  const { error } = await adminSb.from('albums').delete().eq('id', albumId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
