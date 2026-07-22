import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-xl border border-[#BEB0A7]/5 bg-[#040303]/40">
          <Skeleton className="size-11 rounded-full bg-[#101413]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-28 bg-[#101413]" />
            <Skeleton className="h-3 w-4/5 bg-[#101413]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatWindowSkeleton() {
  return (
    <div className="flex h-full flex-col p-6 gap-6 bg-[#040303]">
      <div className="flex items-center gap-3 border-b border-[#BEB0A7]/10 pb-4">
        <Skeleton className="size-10 rounded-full bg-[#101413]" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32 bg-[#101413]" />
          <Skeleton className="h-3 w-16 bg-[#101413]" />
        </div>
      </div>
      
      <div className="flex-1 space-y-6 pt-4">
        <div className="flex justify-start">
          <Skeleton className="h-12 w-48 rounded-2xl rounded-tl-xs bg-[#0D1110]" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-16 w-64 rounded-2xl rounded-tr-xs bg-[#3A4E48]/30" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-10 w-32 rounded-2xl rounded-tl-xs bg-[#0D1110]" />
        </div>
      </div>
      
      <div className="pt-4 border-t border-[#BEB0A7]/10">
        <Skeleton className="h-12 w-full rounded-2xl bg-[#0A0C0B]" />
      </div>
    </div>
  );
}
