import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const classId = req.nextUrl.searchParams.get('class_id');

  const adminSb = createAdminClient();

  // 사용자의 반 목록
  const { data: userClasses } = await supabase
    .from('user_classes')
    .select('class_id')
    .eq('user_id', user.id);

  const classIds = userClasses?.map((uc) => uc.class_id) || [];
  if (classIds.length === 0) return NextResponse.json({ bulletins: [] });

  let query = adminSb
    .from('bulletins')
    .select('*, class:classes(name, department:departments(name)), author:users!bulletins_author_id_fkey(name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (classId) {
    if (!classIds.includes(classId)) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
    }
    query = query.eq('class_id', classId);
  } else {
    query = query.in('class_id', classIds);
  }

  const { data: bulletins } = await query;

  // 읽음 상태 조회
  const bulletinIds = bulletins?.map((b) => b.id) || [];
  const { data: reads } = bulletinIds.length > 0
    ? await adminSb.from('bulletin_reads').select('bulletin_id').eq('user_id', user.id).in('bulletin_id', bulletinIds)
    : { data: [] };

  const readSet = new Set(reads?.map((r) => r.bulletin_id) || []);
  const result = bulletins?.map((b) => ({ ...b, is_read: readSet.has(b.id) })) || [];

  return NextResponse.json({ bulletins: result });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const body = await req.json();
  const { class_id, title, content, category = 'general' } = body;

  if (!class_id || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 });
  }

  const adminSb = createAdminClient();
  const { data, error } = await adminSb
    .from('bulletins')
    .insert({
      class_id,
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: '작성에 실패했습니다' }, { status: 500 });

  // 해당 반 멤버에게 알림 생성
  const { data: classMembers } = await adminSb
    .from('user_classes')
    .select('user_id')
    .eq('class_id', class_id)
    .neq('user_id', user.id);

  if (classMembers?.length) {
    const notifications = classMembers.map((m) => ({
      user_id: m.user_id,
      type: 'new_bulletin',
      bulletin_id: data.id,
    }));
    await adminSb.from('notifications').insert(notifications);
  }

  return NextResponse.json(data, { status: 201 });
}
