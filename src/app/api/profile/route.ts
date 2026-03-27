import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const formData = await req.formData();
  const name = formData.get('name') as string | null;
  const avatarFile = formData.get('avatar') as File | null;

  const adminSb = createAdminClient();
  const updates: Record<string, unknown> = {};

  if (name?.trim()) {
    if (name.trim().length < 1 || name.trim().length > 20) {
      return NextResponse.json({ error: '이름은 1~20자로 입력해주세요' }, { status: 400 });
    }
    updates.name = name.trim();
  }

  if (avatarFile && avatarFile.size > 0) {
    if (avatarFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 5MB 이하만 가능합니다' }, { status: 400 });
    }

    const ext = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `avatars/${user.id}.${ext}`;

    const buffer = await avatarFile.arrayBuffer();
    const { error: uploadError } = await adminSb.storage
      .from('photo')
      .upload(path, buffer, {
        contentType: avatarFile.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: '이미지 업로드에 실패했습니다' }, { status: 500 });
    }

    updates.avatar_url = path;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: '변경할 내용이 없습니다' }, { status: 400 });
  }

  const { data, error } = await adminSb
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: '프로필 수정에 실패했습니다' }, { status: 500 });

  return NextResponse.json(data);
}
