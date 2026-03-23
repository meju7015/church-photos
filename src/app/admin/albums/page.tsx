import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function AdminAlbumsPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; class?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('sort_order');

  let query = supabase
    .from('albums')
    .select(`
      *,
      class:classes(*, department:departments(*)),
      creator:users!albums_created_by_fkey(name),
      photos(id)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (params.class) {
    query = query.eq('class_id', params.class);
  }

  const { data: albums } = await query;

  // 부서 필터가 있으면 클라이언트에서 필터
  const filteredAlbums = params.dept
    ? albums?.filter((a) => (a.class as any)?.department_id === params.dept)
    : albums;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">앨범 히스토리</h1>

      {/* 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Link
          href="/admin/albums"
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
            !params.dept ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}
        >
          전체
        </Link>
        {departments?.map((d) => (
          <Link
            key={d.id}
            href={`/admin/albums?dept=${d.id}`}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
              params.dept === d.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {d.name}
          </Link>
        ))}
      </div>

      {/* 앨범 목록 */}
      <div className="bg-white rounded-2xl border border-gray-200 divide-y">
        {filteredAlbums?.map((album) => (
          <Link
            key={album.id}
            href={`/albums/${album.id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div>
              <p className="font-medium text-sm">{album.title}</p>
              <p className="text-xs text-gray-500">
                {(album.class as any)?.department?.name} - {(album.class as any)?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{formatDate(album.event_date)}</p>
              <p className="text-xs text-gray-400">{(album.photos as any[])?.length || 0}장</p>
            </div>
          </Link>
        ))}
        {(!filteredAlbums || filteredAlbums.length === 0) && (
          <p className="p-8 text-sm text-gray-400 text-center">앨범이 없습니다</p>
        )}
      </div>
    </div>
  );
}
