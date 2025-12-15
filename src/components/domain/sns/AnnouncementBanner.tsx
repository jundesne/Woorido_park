import * as React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMarkAnnouncementAsRead } from "@/hooks/queries";
import type { Announcement } from "@/types/announcement";
import { cn } from "@/lib/utils";

interface AnnouncementBannerProps {
  announcement: Announcement;
  onDismiss?: () => void;
  onClick?: () => void;
  className?: string;
}

export function AnnouncementBanner({
  announcement,
  onDismiss,
  onClick,
  className,
}: AnnouncementBannerProps) {
  const [expanded, setExpanded] = React.useState(false);
  const markAsReadMutation = useMarkAnnouncementAsRead();

  const getPriorityColor = () => {
    switch (announcement.priority) {
      case "urgent":
        return {
          border: "border-l-red-500",
          bg: "bg-red-50",
          badge: "destructive" as const,
          label: "긴급",
        };
      case "important":
        return {
          border: "border-l-woorido",
          bg: "bg-woorido-50",
          badge: "default" as const,
          label: "중요",
        };
      case "normal":
      default:
        return {
          border: "border-l-blue-500",
          bg: "bg-blue-50",
          badge: "secondary" as const,
          label: "공지",
        };
    }
  };

  const handleClick = () => {
    if (!announcement.isRead) {
      markAsReadMutation.mutate(announcement.id);
    }
    onClick?.();
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
    if (!announcement.isRead) {
      markAsReadMutation.mutate(announcement.id);
    }
  };

  const priorityStyle = getPriorityColor();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={className}
    >
      <Card
        className={cn(
          "border-l-4 cursor-pointer transition-shadow hover:shadow-md",
          priorityStyle.border,
          priorityStyle.bg,
          !announcement.isRead && "ring-2 ring-woorido ring-opacity-20",
          className
        )}
        onClick={handleClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={priorityStyle.badge}>{priorityStyle.label}</Badge>

              {announcement.isPinned && (
                <Badge variant="outline" className="text-xs">
                  📌 고정
                </Badge>
              )}

              {!announcement.isRead && (
                <Badge variant="outline" className="bg-woorido text-white text-xs">
                  NEW
                </Badge>
              )}
            </div>

            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">닫기</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <h3 className="font-bold text-gray-900 mb-2">{announcement.title}</h3>

          <p
            className={cn(
              "text-sm text-gray-700 whitespace-pre-wrap",
              !expanded && "line-clamp-2"
            )}
          >
            {announcement.content}
          </p>

          {announcement.content.length > 100 && (
            <Button
              variant="link"
              size="sm"
              onClick={handleExpand}
              className="px-0 h-auto mt-1 text-xs"
            >
              {expanded ? "접기" : "자세히 보기"}
            </Button>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>{announcement.author.nickname}</span>
            <span>·</span>
            <span>
              {new Date(announcement.createdAt).toLocaleDateString("ko-KR")}
            </span>
            {announcement.viewCount > 0 && (
              <>
                <span>·</span>
                <span>조회 {announcement.viewCount.toLocaleString()}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
