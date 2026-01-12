export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col w-full animate-pulse">
      <div className="w-full aspect-[2/3] rounded-3xl bg-zinc-800/50" />
      <div className="mt-4 h-4 w-3/4 bg-zinc-800/50 rounded" />
      <div className="mt-2 h-4 w-1/2 bg-zinc-800/50 rounded" />
    </div>
  );
}
