import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatWindowSkeleton() {
  return (
    <div className="flex h-full flex-col p-6 gap-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      
      <div className="flex-1 space-y-6 pt-4">
        <div className="flex justify-start">
          <Skeleton className="h-12 w-48 rounded-2xl rounded-tl-sm" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-16 w-64 rounded-2xl rounded-tr-sm" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-10 w-32 rounded-2xl rounded-tl-sm" />
        </div>
      </div>
      
      <div className="pt-4 border-t border-white/10">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
