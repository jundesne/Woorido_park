import { Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface InteractionButtonsProps {
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  onLike: () => void;
  onComment: () => void;
  className?: string;
}

export function InteractionButtons({
  likeCount,
  isLiked,
  commentCount,
  onLike,
  onComment,
  className,
}: InteractionButtonsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn("flex-1", isLiked && "text-red-500")}
        onClick={onLike}
        aria-label={`좋아요 ${likeCount}개`}
        aria-pressed={isLiked}
      >
        <motion.div
          key={isLiked ? "liked" : "unliked"}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
        </motion.div>
        좋아요
        {likeCount > 0 && (
          <span className="ml-1 text-xs">({likeCount.toLocaleString()})</span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex-1"
        onClick={onComment}
        aria-label={`댓글 ${commentCount}개`}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        댓글
        {commentCount > 0 && (
          <span className="ml-1 text-xs">({commentCount.toLocaleString()})</span>
        )}
      </Button>
    </div>
  );
}
