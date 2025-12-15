import * as React from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";
import { EmptyState } from "./shared/EmptyState";
import { useComments, useReplies } from "@/hooks/queries";
import { useCommentEditorStore } from "@/hooks/stores";
import { cn } from "@/lib/utils";

interface CommentListProps {
  postId: string;
  className?: string;
}

export function CommentList({ postId, className }: CommentListProps) {
  const { data: comments, isLoading } = useComments({ postId });
  const { replyingToCommentId, setReplyingToCommentId } = useCommentEditorStore();

  const [expandedReplies, setExpandedReplies] = React.useState<Record<string, boolean>>(
    {}
  );

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReply = (commentId: string) => {
    setReplyingToCommentId(commentId);
    // Ensure replies are expanded when replying
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: true,
    }));
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <CommentInputSkeleton />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CommentItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Comment Input */}
      <CommentInput postId={postId} />

      {/* Comments List */}
      <AnimatePresence mode="popLayout">
        {!comments || comments.comments.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={MessageCircle}
              title="아직 댓글이 없습니다"
              description="첫 댓글을 남겨보세요!"
            />
          </motion.div>
        ) : (
          <motion.div layout className="space-y-3">
            {comments.comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <CommentItem
                  comment={comment}
                  onReply={handleReply}
                  showReplies={expandedReplies[comment.id]}
                >
                  {/* Replies Section */}
                  {comment.replyCount > 0 && !expandedReplies[comment.id] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplies(comment.id)}
                      className="mt-2 h-auto px-0 py-1 text-xs text-gray-600"
                    >
                      답글 {comment.replyCount}개 보기
                    </Button>
                  )}

                  {expandedReplies[comment.id] && (
                    <RepliesList
                      commentId={comment.id}
                      onCollapse={() => toggleReplies(comment.id)}
                      showReplyInput={replyingToCommentId === comment.id}
                      postId={postId}
                    />
                  )}
                </CommentItem>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Replies List Component
interface RepliesListProps {
  commentId: string;
  postId: string;
  onCollapse: () => void;
  showReplyInput: boolean;
}

function RepliesList({
  commentId,
  postId,
  onCollapse,
  showReplyInput,
}: RepliesListProps) {
  const { data: replies, isLoading } = useReplies(commentId);

  if (isLoading) {
    return (
      <div className="ml-12 mt-3 space-y-3">
        <CommentItemSkeleton />
      </div>
    );
  }

  return (
    <div className="ml-12 mt-3 space-y-3">
      <AnimatePresence mode="popLayout">
        {replies?.comments.map((reply) => (
          <motion.div
            key={reply.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <CommentItem comment={reply} depth={1} />
          </motion.div>
        ))}
      </AnimatePresence>

      {showReplyInput && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CommentInput
            postId={postId}
            parentCommentId={commentId}
            autoFocus
          />
        </motion.div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onCollapse}
        className="h-auto px-0 py-1 text-xs text-gray-600"
      >
        답글 접기
      </Button>
    </div>
  );
}

// Loading Skeletons
function CommentInputSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="flex-1 h-20" />
      <Skeleton className="h-10 w-10" />
    </div>
  );
}

function CommentItemSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
