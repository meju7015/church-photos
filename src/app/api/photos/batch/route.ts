import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  const { photoIds } = await request.json();

  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    return NextResponse.json({ error: 'No photos specified' }, { status: 400 });
  }

  if (photoIds.length > 50) {
    return NextResponse.json({ error: 'Too many photos (max 50)' }, { status: 400 });
  }

  const adminSb = createAdminClient();

  // 사진 목록 조회
  const { data: photos } = await adminSb
    .from('photos')
    .select('*')
    .in('id', photoIds);

  if (!photos || photos.length === 0) {
    return NextResponse.json({ error: 'No photos found' }, { status: 404 });
  }

  // 권한 체크: admin이 아니면 본인 업로드 사진만 삭제 가능
  if (profile?.role !== 'admin') {
    const unauthorized = photos.some((p) => p.uploaded_by !== user.id);
    if (unauthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Storage에서 삭제
  const paths = photos.flatMap((p) =>
    [p.storage_path, p.thumbnail_path].filter(Boolean) as string[]
  );
  if (paths.length > 0) {
    await adminSb.storage.from('photo').remove(paths);
  }

  // DB에서 삭제
  const { error } = await adminSb.from('photos').delete().in('id', photoIds);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, deleted: photos.length });
}
