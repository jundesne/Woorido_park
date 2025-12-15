import * as React from "react";
import { Heart, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "./shared/UserAvatar";
import { RelativeTimestamp } from "./shared/RelativeTimestamp";
import { useLikeComment, useUnlikeComment } from "@/hooks/queries";
import type { Comment } from "@/types/comment";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: string) => void;
  depth?: number;
  showReplies?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function CommentItem({
  comment,
  onReply,
  depth = 0,
  showReplies = false,
  children,
  className,
}: CommentItemProps) {
  const likeMutation = useLikeComment();
  const unlikeMutation = useUnlikeComment();

  const handleLike = () => {
    if (comment.isLiked) {
      unlikeMutation.mutate(comment.id);
    } else {
      likeMutation.mutate(comment.id);
    }
  };

  const handleReply = () => {
    onReply?.(comment.id);
  };

  return (
    <motion.div layout className={cn("flex gap-3", className)}>
      <UserAvatar user={comment.author} size="sm" />

      <div className="flex-1 min-w-0">
        {/* Comment Bubble */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900">
              {comment.author.nickname}
            </span>
            {comment.author.creditScore !== undefined && (
              <span className="text-xs text-gray-500">
                · 신용점수 {comment.author.creditScore}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-1 px-3">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-auto px-0 py-1 text-xs",
              comment.isLiked && "text-red-500"
            )}
            onClick={handleLike}
          >
            <Heart
              className={cn("h-3 w-3 mr-1", comment.isLiked && "fill-current")}
            />
            {comment.likeCount > 0 && comment.likeCount.toLocaleString()}
          </Button>

          {depth === 0 && onReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-0 py-1 text-xs"
              onClick={handleReply}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              답글
            </Button>
          )}

          <RelativeTimestamp date={comment.createdAt} className="text-xs" />
        </div>

        {/* Replies Section (only for top-level comments) */}
        {depth === 0 && children && (
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">{children}</div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
