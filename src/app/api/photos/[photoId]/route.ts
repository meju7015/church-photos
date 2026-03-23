import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const { photoId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  const { data: photo } = await supabase.from('photos').select('*').eq('id', photoId).single();

  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (photo.uploaded_by !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Storage에서 삭제
  const paths = [photo.storage_path, photo.thumbnail_path].filter(Boolean) as string[];
  const adminSb = createAdminClient();
  await adminSb.storage.from('photo').remove(paths);

  // DB에서 삭제
  const { error } = await supabase.from('photos').delete().eq('id', photoId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
