import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const deptColors: Record<string, string> = {
  '영아부': 'from-candy-pink to-candy-orange',
  '유아부': 'from-candy-yellow to-candy-orange',
  '유치부': 'from-candy-green to-candy-blue',
  '초등부': 'from-candy-blue to-candy-purple',
  '중등부': 'from-candy-purple to-candy-pink',
  '고등부': 'from-candy-red to-candy-orange',
  '청년부': 'from-candy-blue to-candy-green',
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
      <Link href="/" className="text-sm text-candy-purple font-semibold hover:underline flex items-center gap-1">
        <span>&larr;</span> 홈
      </Link>
      <h1 className="text-xl font-extrabold text-[var(--text)] mt-3 mb-6">전체 부서</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {departments?.map((dept) => {
          const gradient = deptColors[dept.name] || 'from-candy-purple to-candy-blue';
          const classCount = (dept.classes as any[])?.length || 0;
          return (
            <Link
              key={dept.id}
              href={`/departments/${dept.id}`}
              className="bg-[var(--surface-card)] border border-[var(--border)] rounded-3xl p-5 text-center card-hover"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md`}>
                <span className="text-2xl font-bold text-white">{dept.name.charAt(0)}</span>
              </div>
              <p className="font-bold text-sm text-[var(--text)]">{dept.name}</p>
              <p className="text-xs text-[var(--text-sub)] mt-1">{classCount}개 반</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
