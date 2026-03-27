import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const adminSb = createAdminClient();
  await adminSb
    .from('bulletin_reads')
    .upsert({ bulletin_id: id, user_id: user.id }, { onConflict: 'bulletin_id,user_id' });

  return NextResponse.json({ success: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const adminSb = createAdminClient();

  // 전체 반 인원 수
  const { data: bulletin } = await adminSb.from('bulletins').select('class_id').eq('id', id).single();
  if (!bulletin) return NextResponse.json({ error: '알림장을 찾을 수 없습니다' }, { status: 404 });

  const { count: totalMembers } = await adminSb
    .from('user_classes')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', bulletin.class_id);

  const { data: reads } = await adminSb
    .from('bulletin_reads')
    .select('user_id, read_at, user:users(name)')
    .eq('bulletin_id', id);

  return NextResponse.json({
    total: totalMembers || 0,
    readCount: reads?.length || 0,
    reads: reads || [],
  });
}
