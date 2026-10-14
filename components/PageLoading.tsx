import { Skeleton } from "./ui/skeleton";
export default function PageLoading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mx-auto w-full max-w-5xl space-y-6 p-8"
    >
      <span className="sr-only">Loading your workspace…</span>
      <Skeleton className="h-9 w-60" />
      <Skeleton className="h-5 w-80 max-w-full" />
      <div className="grid gap-5 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
