import * as React from "react";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RelativeTimestampProps {
  date: string;
  className?: string;
  showTooltip?: boolean;
}

export function RelativeTimestamp({
  date,
  className,
  showTooltip = true,
}: RelativeTimestampProps) {
  const [relativeTime, setRelativeTime] = React.useState(() =>
    formatRelativeTime(date)
  );

  React.useEffect(() => {
    // Update relative time every minute
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(date));
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [date]);

  const absoluteTime = formatDate(date, "YYYY년 MM월 DD일 HH:mm");

  if (showTooltip) {
    return (
      <time
        dateTime={date}
        className={cn("text-sm text-gray-500", className)}
        title={absoluteTime}
      >
        {relativeTime}
      </time>
    );
  }

  return (
    <time dateTime={date} className={cn("text-sm text-gray-500", className)}>
      {relativeTime}
    </time>
  );
}
