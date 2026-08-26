function Block({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/10 ${className}`} />;
}

/** Skeleton that mirrors the loaded layout to minimize shift when data arrives. */
export function LoadingSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <p role="status" className="sr-only">
        Loading weather…
      </p>

      {/* Current conditions */}
      <div className="glass p-6 sm:p-8" aria-hidden="true">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Block className="h-7 w-40" />
            <Block className="h-4 w-28" />
            <Block className="h-4 w-48" />
          </div>
          <Block className="h-11 w-11 rounded-full" />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="space-y-3">
            <Block className="h-20 w-36" />
            <Block className="h-5 w-28" />
          </div>
          <Block className="h-24 w-24 rounded-2xl" />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-soft space-y-3 p-4">
            <Block className="h-4 w-20" />
            <Block className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Hourly */}
      <div className="glass p-5 sm:p-6" aria-hidden="true">
        <Block className="mb-4 h-5 w-32" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex min-w-[68px] flex-col items-center gap-2">
              <Block className="h-3 w-8" />
              <Block className="h-7 w-7 rounded-full" />
              <Block className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
