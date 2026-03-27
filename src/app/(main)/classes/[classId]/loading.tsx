export default function ClassLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 bg-[var(--border)] rounded w-20" />
      <div className="h-8 bg-[var(--border)] rounded-2xl w-1/2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-[var(--border)] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
