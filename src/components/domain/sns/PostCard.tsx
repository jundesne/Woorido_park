import * as React from "react";
import { MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { UserAvatar } from "./shared/UserAvatar";
import { RelativeTimestamp } from "./shared/RelativeTimestamp";
import { InteractionButtons } from "./shared/InteractionButtons";
import { PostMedia } from "./PostMedia";
import { useLikePost, useUnlikePost, useDeletePost } from "@/hooks/queries";
import { useAuthStore } from "@/hooks/stores";
import type { Post } from "@/types/post";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  onCommentClick?: () => void;
  showComments?: boolean;
  className?: string;
}

export function PostCard({
  post,
  onCommentClick,
  showComments = false,
  className,
}: PostCardProps) {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const deleteMutation = useDeletePost();

  const [showFullContent, setShowFullContent] = React.useState(false);
  const isAuthor = userId === post.authorId;

  const handleLike = () => {
    if (post.isLiked) {
      unlikeMutation.mutate(post.id);
    } else {
      likeMutation.mutate(post.id);
    }
  };

  const handleComment = () => {
    onCommentClick?.();
  };

  const handleEdit = () => {
    // TODO: Open edit modal
    toast.info("포스트 수정 기능은 곧 추가됩니다.");
  };

  const handleDelete = () => {
    if (confirm("정말로 이 포스트를 삭제하시겠습니까?")) {
      deleteMutation.mutate(post.id, {
        onSuccess: () => {
          toast.success("포스트가 삭제되었습니다.");
        },
        onError: () => {
          toast.error("포스트 삭제에 실패했습니다.");
        },
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLAnchorElement ||
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a")
    ) {
      return;
    }

    navigate(`/gye/${post.gyeId}/posts/${post.id}`);
  };

  // Truncate long content
  const contentLines = post.content.split("\n");
  const shouldTruncate = contentLines.length > 3 && !showFullContent;
  const displayContent = shouldTruncate
    ? contentLines.slice(0, 3).join("\n")
    : post.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar user={post.author} showCreditScore />

              <div>
                <p className="font-semibold text-gray-900">
                  {post.author.nickname}
                </p>
                <RelativeTimestamp date={post.createdAt} />
              </div>
            </div>

            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">메뉴</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>수정</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="whitespace-pre-wrap text-gray-900">{displayContent}</p>

          {shouldTruncate && (
            <Button
              variant="link"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullContent(true);
              }}
              className="px-0 h-auto mt-1"
            >
              더 보기
            </Button>
          )}

          {/* Post Media */}
          {post.media.length > 0 && <PostMedia media={post.media} />}

          {/* Quoted Post */}
          {post.quotedPost && (
            <Card className="mt-4 bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserAvatar user={post.quotedPost.author} size="sm" />
                  <span className="text-sm font-medium text-gray-700">
                    {post.quotedPost.author.nickname}
                  </span>
                  <span className="text-xs text-gray-500">·</span>
                  <RelativeTimestamp
                    date={post.quotedPost.createdAt}
                    className="text-xs"
                  />
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {post.quotedPost.content}
                </p>
                {post.quotedPost.media.length > 0 && post.quotedPost.media[0] && (
                  <div className="mt-2">
                    <img
                      src={post.quotedPost.media[0].url}
                      alt=""
                      className="rounded-md max-h-40 w-auto"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {/* Stats */}
          <div className="flex items-center justify-between w-full text-sm text-gray-500">
            <span>좋아요 {post.likeCount.toLocaleString()}개</span>
            <span>댓글 {post.commentCount.toLocaleString()}개</span>
          </div>

          <Separator />

          {/* Interaction Buttons */}
          <InteractionButtons
            likeCount={post.likeCount}
            isLiked={post.isLiked}
            commentCount={post.commentCount}
            onLike={handleLike}
            onComment={handleComment}
            className="w-full"
          />

          {/* Comments Section (if showComments is true) */}
          {showComments && (
            <div className="w-full pt-3 border-t">
              {/* CommentList will be added later */}
              <p className="text-sm text-gray-500 text-center">
                댓글 목록이 여기에 표시됩니다
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
