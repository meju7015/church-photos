import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import SearchBar from '@/components/SearchBar';

export const dynamic = 'force-dynamic';

export default async function AdminAlbumsPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; from?: string; to?: string; search?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

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
    .limit(100);

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`);
  }

  if (params.from) {
    query = query.gte('event_date', params.from);
  }

  if (params.to) {
    query = query.lte('event_date', params.to);
  }

  const { data: albums } = await query;

  const filteredAlbums = params.dept
    ? albums?.filter((a) => (a.class as any)?.department_id === params.dept)
    : albums;

  // URL 파라미터 유지하면서 dept만 변경하는 헬퍼
  const buildUrl = (deptId?: string) => {
    const p = new URLSearchParams();
    if (deptId) p.set('dept', deptId);
    if (params.from) p.set('from', params.from);
    if (params.to) p.set('to', params.to);
    if (params.search) p.set('search', params.search);
    const qs = p.toString();
    return `/admin/albums${qs ? `?${qs}` : ''}`;
  };

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[var(--text)] mb-6">앨범 히스토리</h1>

      {/* 검색 */}
      <div className="mb-4">
        <SearchBar basePath="/admin/albums" />
      </div>

      {/* 날짜 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <form className="flex items-center gap-2" action="/admin/albums">
          {params.dept && <input type="hidden" name="dept" value={params.dept} />}
          {params.search && <input type="hidden" name="search" value={params.search} />}
          <input
            type="date"
            name="from"
            defaultValue={params.from || ''}
            className="px-3 py-1.5 bg-[var(--surface-card)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] outline-none"
            placeholder="시작일"
          />
          <span className="text-[var(--text-sub)] text-xs">~</span>
          <input
            type="date"
            name="to"
            defaultValue={params.to || ''}
            className="px-3 py-1.5 bg-[var(--surface-card)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] outline-none"
            placeholder="종료일"
          />
          <button
            type="submit"
            className="px-3 py-1.5 gradient-candy text-white rounded-xl text-xs font-bold"
          >
            적용
          </button>
          {(params.from || params.to) && (
            <Link
              href={buildUrl(params.dept)}
              className="px-3 py-1.5 bg-[var(--border)] text-[var(--text-sub)] rounded-xl text-xs font-semibold"
            >
              초기화
            </Link>
          )}
        </form>
      </div>

      {/* 부서 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Link
          href={buildUrl()}
          className={`px-3 py-1.5 rounded-2xl text-sm whitespace-nowrap font-semibold transition-all ${
            !params.dept ? 'gradient-candy text-white shadow-md' : 'bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text-sub)]'
          }`}
        >
          전체
        </Link>
        {departments?.map((d) => (
          <Link
            key={d.id}
            href={buildUrl(d.id)}
            className={`px-3 py-1.5 rounded-2xl text-sm whitespace-nowrap font-semibold transition-all ${
              params.dept === d.id ? 'gradient-candy text-white shadow-md' : 'bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text-sub)]'
            }`}
          >
            {d.name}
          </Link>
        ))}
      </div>

      {/* 앨범 목록 */}
      <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
        {filteredAlbums?.map((album) => (
          <Link
            key={album.id}
            href={`/albums/${album.id}`}
            className="flex items-center justify-between p-4 hover:bg-[var(--border)]/30 transition-colors"
          >
            <div>
              <p className="font-semibold text-sm text-[var(--text)]">{album.title}</p>
              <p className="text-xs text-[var(--text-sub)]">
                {(album.class as any)?.department?.name} - {(album.class as any)?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-sub)]">{formatDate(album.event_date)}</p>
              <p className="text-xs text-[var(--text-sub)]">{(album.photos as any[])?.length || 0}장</p>
            </div>
          </Link>
        ))}
        {(!filteredAlbums || filteredAlbums.length === 0) && (
          <p className="p-8 text-sm text-[var(--text-sub)] text-center">앨범이 없습니다</p>
        )}
      </div>
    </div>
  );
}
