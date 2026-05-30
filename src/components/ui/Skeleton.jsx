export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <Skeleton className="h-44 w-full rounded-[1.5rem]" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-4 flex-1" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => <Skeleton key={j} className="h-8 flex-1" />)}
        </div>
      ))}
    </div>
  );
}
