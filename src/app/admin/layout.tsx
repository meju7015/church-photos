import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
    redirect('/');
  }

  return (
    <AdminShell isAdmin={profile.role === 'admin'}>
      {children}
    </AdminShell>
  );
}
