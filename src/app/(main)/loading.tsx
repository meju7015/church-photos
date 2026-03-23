export default function MainLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Welcome skeleton */}
      <div className="h-24 rounded-3xl bg-[var(--border)]" />

      {/* Section title */}
      <div className="h-5 w-20 rounded-lg bg-[var(--border)]" />

      {/* Class chips */}
      <div className="flex gap-2">
        <div className="h-10 w-32 rounded-2xl bg-[var(--border)]" />
        <div className="h-10 w-28 rounded-2xl bg-[var(--border)]" />
      </div>

      {/* Section title */}
      <div className="h-5 w-24 rounded-lg bg-[var(--border)]" />

      {/* Album cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl border border-[var(--border)] overflow-hidden">
            <div className="aspect-[4/3] bg-[var(--border)]" />
            <div className="p-3.5 space-y-2">
              <div className="h-3 w-24 rounded bg-[var(--border)]" />
              <div className="h-4 w-40 rounded bg-[var(--border)]" />
              <div className="h-3 w-32 rounded bg-[var(--border)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
