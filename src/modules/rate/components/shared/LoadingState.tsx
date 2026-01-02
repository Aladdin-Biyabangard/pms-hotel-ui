import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  height?: string;
  className?: string;
}

export function LoadingState({
  title,
  subtitle,
  height = "h-96",
  className = ""
}: LoadingStateProps) {
  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      <Skeleton className={`${height} w-full`} />
      {title && subtitle && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
      )}
    </div>
  );
}
