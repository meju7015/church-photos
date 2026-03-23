import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';

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
    <div className="min-h-screen">
      <nav className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">📸</span>
                <span className="font-extrabold text-lg bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue bg-clip-text text-transparent">
                  우리교회
                </span>
              </Link>
              <span className="text-xs font-semibold text-candy-purple bg-candy-purple/10 px-2.5 py-1 rounded-full">관리자</span>
            </div>
            <Link href="/" className="text-sm text-[var(--text-sub)] hover:text-[var(--text)] transition-colors flex items-center gap-1">
              사이트로
            </Link>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <AdminNav isAdmin={profile.role === 'admin'} />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
