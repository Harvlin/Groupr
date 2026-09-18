import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-card bg-black/[0.06]',
        className
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container-content py-10 lg:py-14">
      <div className="mb-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-10 w-96" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80" />
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

export function TeacherReportSkeleton() {
  return (
    <div className="container-content py-10 lg:py-14">
      <div className="mb-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-10 w-96" />
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="mt-6 h-64" />
    </div>
  );
}
