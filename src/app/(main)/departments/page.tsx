import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const deptColors: Record<string, string> = {
  '영아부': 'bg-dept-infant',
  '유아부': 'bg-dept-toddler',
  '유치부': 'bg-dept-kinder',
  '초등부': 'bg-dept-elementary',
  '중등부': 'bg-dept-middle',
  '고등부': 'bg-dept-high',
  '청년부': 'bg-dept-youth',
};

export default async function AllDepartmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: departments } = await supabase
    .from('departments')
    .select('*, classes(id)')
    .order('sort_order');

  return (
    <div>
      <Link href="/" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
        <span>&larr;</span> 홈
      </Link>
      <h1 className="text-xl font-bold text-[var(--text)] mt-3 mb-6">전체 부서</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 stagger-children">
        {departments?.map((dept) => {
          const bgColor = deptColors[dept.name] || 'bg-primary/40';
          const classCount = (dept.classes as any[])?.length || 0;
          return (
            <Link
              key={dept.id}
              href={`/departments/${dept.id}`}
              className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-5 text-center card-hover"
            >
              <div className={`w-14 h-14 ${bgColor} rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-sm`}>
                <span className="text-2xl font-bold text-white">{dept.name.charAt(0)}</span>
              </div>
              <p className="font-semibold text-sm text-[var(--text)]">{dept.name}</p>
              <p className="text-xs text-[var(--text-sub)] mt-1">{classCount}개 반</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
