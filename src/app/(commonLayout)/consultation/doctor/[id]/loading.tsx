import { Skeleton } from "@/components/ui/skeleton";

export default function ConsultationDoctorLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8" aria-label="Loading doctor details">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Skeleton className="h-72 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
        </div>
      </div>
      <div className="mt-10 space-y-3"><Skeleton className="h-7 w-40" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
    </main>
  );
}
