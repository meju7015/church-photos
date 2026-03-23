import { createClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/utils';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('users')
    .select('*, user_classes(class:classes(name, department:departments(name)))')
    .order('created_at', { ascending: false });

  const roleLabels: Record<string, string> = {
    admin: '관리자',
    teacher: '선생님',
    parent: '학부모',
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">사용자 관리</h1>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y">
        {users?.map((user) => {
          const userClasses = (user.user_classes as any[]) || [];
          return (
            <div key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {roleLabels[user.role] || user.role}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {formatDateTime(user.created_at)}
                </p>
              </div>
              {userClasses.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 ml-13">
                  {userClasses.map((uc: any, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
                    >
                      {uc.class?.department?.name} - {uc.class?.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {(!users || users.length === 0) && (
          <p className="p-8 text-sm text-gray-400 text-center">사용자가 없습니다</p>
        )}
      </div>
    </div>
  );
}
