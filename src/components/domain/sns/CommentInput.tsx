import * as React from "react";
import { Send, X } from "lucide-react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useCreateComment } from "@/hooks/queries";
import { useCommentEditorStore } from "@/hooks/stores";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommentInputProps {
  postId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function CommentInput({
  postId,
  parentCommentId,
  onSuccess,
  placeholder = "댓글을 입력하세요...",
  autoFocus = false,
  className,
}: CommentInputProps) {
  const createCommentMutation = useCreateComment();
  const { commentDrafts, setCommentDraft, clearCommentDraft, setReplyingToCommentId } =
    useCommentEditorStore();

  const [, setIsFocused] = React.useState(autoFocus);

  // Get draft from store
  const draftKey = parentCommentId ? `${postId}:${parentCommentId}` : postId;
  const content = commentDrafts[draftKey] || "";

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentDraft(draftKey, e.target.value);
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    if (content.length > 500) {
      toast.error("댓글은 최대 500자까지 작성할 수 있습니다.");
      return;
    }

    createCommentMutation.mutate(
      {
        postId,
        content: content.trim(),
        parentCommentId,
      },
      {
        onSuccess: () => {
          clearCommentDraft(draftKey);
          if (parentCommentId) {
            setReplyingToCommentId(undefined);
          }
          toast.success("댓글이 작성되었습니다.");
          onSuccess?.();
        },
        onError: () => {
          toast.error("댓글 작성에 실패했습니다.");
        },
      }
    );
  };

  const handleCancel = () => {
    if (parentCommentId) {
      setReplyingToCommentId(undefined);
    }
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      layout
      initial={autoFocus ? { height: "auto" } : undefined}
      className={cn("space-y-2", className)}
    >
      {parentCommentId && (
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
          <span>답글 작성 중...</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-auto px-2 py-1"
          >
            <X className="h-3 w-3 mr-1" />
            취소
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoResize
          maxRows={5}
          className="flex-1"
          disabled={createCommentMutation.isPending}
        />

        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!content.trim() || createCommentMutation.isPending}
          className="shrink-0"
        >
          {createCommentMutation.isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">댓글 작성</span>
        </Button>
      </div>

      {content.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between text-xs text-gray-500"
        >
          <span>Ctrl + Enter로 작성</span>
          <span className={cn(content.length > 500 && "text-error font-medium")}>
            {content.length} / 500
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
