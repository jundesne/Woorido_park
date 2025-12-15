import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function PostCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="flex-1 space-y-2">
            {/* Author name skeleton */}
            <Skeleton className="h-4 w-24" />
            {/* Timestamp skeleton */}
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Menu button skeleton */}
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>

      <CardContent>
        {/* Content text skeletons */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Optional media skeleton */}
        <Skeleton className="h-64 w-full rounded-lg mt-4" />
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {/* Stats skeleton */}
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Separator */}
        <Skeleton className="h-[1px] w-full" />

        {/* Action buttons skeleton */}
        <div className="flex items-center gap-2 w-full">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardFooter>
    </Card>
  );
}
