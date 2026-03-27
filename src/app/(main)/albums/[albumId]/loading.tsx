export default function AlbumLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 bg-[var(--border)] rounded w-20" />
      <div className="h-8 bg-[var(--border)] rounded-2xl w-3/4" />
      <div className="h-4 bg-[var(--border)] rounded w-1/3" />
      <div className="h-4 bg-[var(--border)] rounded w-1/2" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-square bg-[var(--border)] rounded-2xl" />
        ))}
      </div>
      <div className="h-24 bg-[var(--border)] rounded-2xl" />
    </div>
  );
}
