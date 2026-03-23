import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default async function MainLayout({
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

  if (!profile) redirect('/join');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation user={profile} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 pb-24 sm:pb-6">
        {children}
      </main>
    </div>
  );
}
