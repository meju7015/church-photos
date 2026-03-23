import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ deptId: string }>;
}) {
  const { deptId } = await params;
  const supabase = await createClient();

  const { data: department } = await supabase
    .from('departments')
    .select('*')
    .eq('id', deptId)
    .single();

  if (!department) notFound();

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('department_id', deptId)
    .order('name');

  return (
    <div>
      <Link href="/" className="text-sm text-candy-purple font-semibold hover:underline flex items-center gap-1">
        <span>&larr;</span> 홈
      </Link>
      <h1 className="text-xl font-extrabold text-[var(--text)] mt-3 mb-6">
        {department.name}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {classes?.map((cls) => (
          <Link
            key={cls.id}
            href={`/classes/${cls.id}`}
            className="bg-[var(--surface-card)] border border-[var(--border)] rounded-3xl p-5 text-center card-hover"
          >
            <div className="w-14 h-14 gradient-candy rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md shadow-candy-purple/20">
              <span className="text-2xl font-bold text-white">{cls.name.charAt(0)}</span>
            </div>
            <p className="font-bold text-sm text-[var(--text)]">{cls.name}</p>
          </Link>
        ))}
        {(!classes || classes.length === 0) && (
          <p className="text-[var(--text-sub)] text-sm col-span-full text-center py-8">
            아직 반이 없습니다
          </p>
        )}
      </div>
    </div>
  );
}
