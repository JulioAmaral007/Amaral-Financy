import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div>
      <Skeleton className="mb-5 h-4 w-16" />
      <div className="max-w-[420px] rounded-2xl border border-border/7 bg-surface p-8">
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="mb-5 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
