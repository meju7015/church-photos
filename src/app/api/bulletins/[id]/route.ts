import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const adminSb = createAdminClient();
  const { data: bulletin } = await adminSb.from('bulletins').select('author_id').eq('id', id).single();
  if (!bulletin) return NextResponse.json({ error: '알림장을 찾을 수 없습니다' }, { status: 404 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (bulletin.author_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  await adminSb.from('bulletins').delete().eq('id', id);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const adminSb = createAdminClient();
  const { data: bulletin } = await adminSb.from('bulletins').select('author_id').eq('id', id).single();
  if (!bulletin) return NextResponse.json({ error: '알림장을 찾을 수 없습니다' }, { status: 404 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (bulletin.author_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, category } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title?.trim()) updates.title = title.trim();
  if (content?.trim()) updates.content = content.trim();
  if (category) updates.category = category;

  const { data, error } = await adminSb.from('bulletins').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: '수정에 실패했습니다' }, { status: 500 });

  return NextResponse.json(data);
}
