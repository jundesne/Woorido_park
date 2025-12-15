import * as React from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent } from "@/components/ui/Card";
import { MediaUploader } from "./MediaUploader";
import { UserAvatar } from "./shared/UserAvatar";
import { RelativeTimestamp } from "./shared/RelativeTimestamp";
import { useCreatePost, useUpdatePost } from "@/hooks/queries";
import { usePostEditorStore } from "@/hooks/stores";
import type { Post } from "@/types/post";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PostCreateModalProps {
  gyeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPost?: Post;
  quotedPost?: Post;
}

export function PostCreateModal({
  gyeId,
  open,
  onOpenChange,
  editingPost,
  quotedPost,
}: PostCreateModalProps) {
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  const { content, setContent, uploadedMedia, quotedPostId, setQuotedPostId, reset } =
    usePostEditorStore();

  const isEditing = !!editingPost;

  // Initialize with editing post or quoted post
  React.useEffect(() => {
    if (open) {
      if (editingPost) {
        setContent(editingPost.content);
        // Note: Media cannot be edited, would need to re-upload
      } else if (quotedPost) {
        setQuotedPostId(quotedPost.id);
      }
    }
  }, [open, editingPost, quotedPost, setContent, setQuotedPostId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleCancel = () => {
    // Confirm if content exists
    if (content.trim() || uploadedMedia.length > 0) {
      if (!confirm("작성 중인 내용이 있습니다. 정말로 취소하시겠습니까?")) {
        return;
      }
    }

    reset();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("포스트 내용을 입력해주세요.");
      return;
    }

    if (content.length > 2000) {
      toast.error("포스트는 최대 2000자까지 작성할 수 있습니다.");
      return;
    }

    const postData = {
      gyeId,
      content: content.trim(),
      mediaIds: uploadedMedia.map((m) => m.id),
      quotedPostId: quotedPostId || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(
        { postId: editingPost.id, data: { content: content.trim() } },
        {
          onSuccess: () => {
            toast.success("포스트가 수정되었습니다.");
            reset();
            onOpenChange(false);
          },
          onError: () => {
            toast.error("포스트 수정에 실패했습니다.");
          },
        }
      );
    } else {
      createMutation.mutate(postData, {
        onSuccess: () => {
          toast.success("포스트가 작성되었습니다.");
          reset();
          onOpenChange(false);
        },
        onError: () => {
          toast.error("포스트 작성에 실패했습니다.");
        },
      });
    }
  };

  const canSubmit = content.trim().length > 0 && content.length <= 2000;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "포스트 수정" : "새 포스트 작성"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content Input */}
          <Textarea
            value={content}
            onChange={handleChange}
            placeholder="무슨 생각을 하고 계신가요?"
            rows={5}
            autoResize
            autoFocus
            disabled={isSubmitting}
            className="resize-none"
          />

          {/* Quoted Post Preview */}
          {(quotedPost || (quotedPostId && editingPost?.quotedPost)) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserAvatar
                      user={
                        quotedPost?.author || editingPost?.quotedPost?.author!
                      }
                      size="sm"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {quotedPost?.author.nickname ||
                        editingPost?.quotedPost?.author.nickname}
                    </span>
                    <span className="text-xs text-gray-500">·</span>
                    <RelativeTimestamp
                      date={
                        quotedPost?.createdAt ||
                        editingPost?.quotedPost?.createdAt ||
                        ""
                      }
                      className="text-xs"
                    />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {quotedPost?.content || editingPost?.quotedPost?.content}
                  </p>
                  {((quotedPost?.media && quotedPost.media.length > 0) ||
                    (editingPost?.quotedPost?.media &&
                      editingPost.quotedPost.media.length > 0)) && (
                    <div className="mt-2">
                      <img
                        src={
                          quotedPost?.media[0]?.url ||
                          editingPost?.quotedPost?.media[0]?.url
                        }
                        alt=""
                        className="rounded-md max-h-40 w-auto"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Media Uploader (not available in edit mode) */}
          {!isEditing && <MediaUploader gyeId={gyeId} disabled={isSubmitting} />}

          {/* Character Counter */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {isEditing
                ? "미디어는 수정할 수 없습니다. 필요시 삭제 후 재작성해주세요."
                : "최대 10개의 이미지/동영상을 업로드할 수 있습니다."}
            </span>
            <span
              className={cn(
                "font-medium",
                content.length > 2000 ? "text-error" : "text-gray-600"
              )}
            >
              {content.length} / 2,000
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting
              ? "게시 중..."
              : isEditing
                ? "수정"
                : "게시"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
