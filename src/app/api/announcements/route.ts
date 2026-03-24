import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const adminSb = createAdminClient();
  const { data, error } = await adminSb
    .from('announcements')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // creator 이름 조회
  const userIds = [...new Set(data?.map((a) => a.created_by) || [])];
  const { data: users } = userIds.length > 0
    ? await adminSb.from('users').select('id, name').in('id', userIds)
    : { data: [] };
  const userMap = new Map(users?.map((u) => [u.id, u.name]) || []);

  const result = data?.map((a) => ({
    ...a,
    creator: { name: userMap.get(a.created_by) || '알 수 없음' },
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('role, name').eq('id', user.id).single();
  if (!profile || !['admin', 'teacher'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, department_id, pinned } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
  }

  const adminSb = createAdminClient();
  const { data, error } = await adminSb
    .from('announcements')
    .insert({
      title: title.trim(),
      content: content.trim(),
      department_id: department_id || null,
      pinned: pinned || false,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ...data,
    creator: { name: profile.name },
  });
}
