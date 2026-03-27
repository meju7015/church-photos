export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-32 rounded-lg bg-[var(--border)]" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[var(--border)]" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 rounded-2xl bg-[var(--border)]" />
        <div className="h-32 rounded-2xl bg-[var(--border)]" />
      </div>

      <div className="h-64 rounded-2xl bg-[var(--border)]" />
    </div>
  );
}
