export default function DepartmentLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 bg-[var(--border)] rounded w-20" />
      <div className="h-8 bg-[var(--border)] rounded-2xl w-1/3" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-[var(--border)] rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
