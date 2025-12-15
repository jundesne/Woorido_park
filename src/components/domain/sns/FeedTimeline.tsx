import * as React from "react";
import { Plus, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { PostCreateModal } from "./PostCreateModal";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { EmptyState } from "./shared/EmptyState";
import { useGyeFeed, useAnnouncements } from "@/hooks/queries";
import { useFeedFilterStore } from "@/hooks/stores";
import { cn } from "@/lib/utils";

interface FeedTimelineProps {
  gyeId: string;
  className?: string;
}

export function FeedTimeline({ gyeId, className }: FeedTimelineProps) {
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = React.useState<
    Set<string>
  >(new Set());

  const infiniteScrollRef = React.useRef<HTMLDivElement>(null);

  const { sortBy, showAnnouncementsOnly, setSortBy, setShowAnnouncementsOnly } =
    useFeedFilterStore();

  // Fetch feed data
  const {
    data: feedData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGyeFeed({
    gyeId,
    sortBy,
    limit: 10,
  });

  // Fetch announcements
  const { data: announcementsData } = useAnnouncements({ gyeId });

  // Flatten posts from all pages
  const posts = React.useMemo(() => {
    return feedData?.pages.flatMap((page) => page.posts) || [];
  }, [feedData]);

  // Filter unread announcements
  const unreadAnnouncements = React.useMemo(() => {
    return (
      announcementsData?.announcements.filter(
        (a) => !a.isRead && !dismissedAnnouncements.has(a.id)
      ) || []
    );
  }, [announcementsData, dismissedAnnouncements]);

  // Intersection Observer for infinite scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = infiniteScrollRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleDismissAnnouncement = (announcementId: string) => {
    setDismissedAnnouncements((prev) => new Set(prev).add(announcementId));
    // Optionally persist to localStorage
    const dismissed = Array.from(dismissedAnnouncements);
    dismissed.push(announcementId);
    localStorage.setItem(
      `dismissed-announcements-${gyeId}`,
      JSON.stringify(dismissed)
    );
  };

  // Load dismissed announcements from localStorage
  React.useEffect(() => {
    const dismissed = localStorage.getItem(`dismissed-announcements-${gyeId}`);
    if (dismissed) {
      try {
        const parsed = JSON.parse(dismissed);
        setDismissedAnnouncements(new Set(parsed));
      } catch (error) {
        // Ignore parse errors
      }
    }
  }, [gyeId]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filter Tabs */}
      <Tabs
        value={showAnnouncementsOnly ? "announcements" : "all"}
        onValueChange={(value) =>
          setShowAnnouncementsOnly(value === "announcements")
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="announcements">공지사항</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sort Buttons */}
      {!showAnnouncementsOnly && (
        <div className="flex gap-2">
          <Button
            variant={sortBy === "latest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("latest")}
          >
            최신순
          </Button>
          <Button
            variant={sortBy === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("popular")}
          >
            인기순
          </Button>
        </div>
      )}

      {/* Mobile FAB */}
      <motion.div
        className="fixed bottom-20 right-4 md:hidden z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">포스트 작성</span>
        </Button>
      </motion.div>

      {/* Desktop Create Button */}
      <Card className="hidden md:block">
        <CardContent className="pt-6">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-400 hover:text-gray-900"
            onClick={() => setCreateModalOpen(true)}
          >
            무슨 생각을 하고 계신가요?
          </Button>
        </CardContent>
      </Card>

      {/* Unread Announcements */}
      {!showAnnouncementsOnly && unreadAnnouncements.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {unreadAnnouncements.map((announcement) => (
              <AnnouncementBanner
                key={announcement.id}
                announcement={announcement}
                onDismiss={() => handleDismissAnnouncement(announcement.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Post List or Announcements List */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : showAnnouncementsOnly ? (
          /* Announcements View */
          <motion.div
            key="announcements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {announcementsData?.announcements.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="공지사항이 없습니다"
                description="아직 작성된 공지사항이 없습니다."
              />
            ) : (
              announcementsData?.announcements.map((announcement) => (
                <AnnouncementBanner
                  key={announcement.id}
                  announcement={announcement}
                />
              ))
            )}
          </motion.div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={MessageSquare}
              title="아직 포스트가 없습니다"
              description="첫 포스트를 작성해보세요!"
              action={
                <Button onClick={() => setCreateModalOpen(true)}>
                  포스트 작성
                </Button>
              }
            />
          </motion.div>
        ) : (
          /* Posts Feed */
          <motion.div layout className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Infinite Scroll Trigger */}
      {!showAnnouncementsOnly && (
        <div ref={infiniteScrollRef} className="py-4">
          {isFetchingNextPage ? (
            <PostCardSkeleton />
          ) : hasNextPage ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fetchNextPage()}
            >
              더 보기
            </Button>
          ) : posts.length > 0 ? (
            <p className="text-center text-sm text-gray-500">
              모든 포스트를 확인했습니다
            </p>
          ) : null}
        </div>
      )}

      {/* Create Post Modal */}
      <PostCreateModal
        gyeId={gyeId}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
