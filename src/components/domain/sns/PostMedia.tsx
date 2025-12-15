import * as React from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import type { PostMedia as PostMediaType } from "@/types/post";
import { cn } from "@/lib/utils";

interface PostMediaProps {
  media: PostMediaType[];
  className?: string;
}

export function PostMedia({ media, className }: PostMediaProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  if (media.length === 0) return null;

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2";
    return "grid-cols-2";
  };

  const renderMedia = (item: PostMediaType, index: number) => {
    const isFirst = index === 0;
    const shouldSpan = media.length === 3 && isFirst;

    if (item.type === "video") {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "relative aspect-video",
            shouldSpan && "col-span-2"
          )}
        >
          <video
            src={item.url}
            controls
            poster={item.thumbnailUrl}
            className="w-full h-full object-cover rounded-lg"
            preload="metadata"
          >
            <track kind="captions" />
          </video>
        </motion.div>
      );
    }

    // Show "+N more" overlay on 4th item if more than 4 media
    const showOverlay = index === 3 && media.length > 4;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 }}
        className={cn(
          "relative aspect-square cursor-pointer group",
          shouldSpan && "col-span-2 aspect-video"
        )}
        onClick={() => handleImageClick(index)}
      >
        <img
          src={item.url}
          alt=""
          loading="lazy"
          className={cn(
            "w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105",
            showOverlay && "brightness-50"
          )}
        />

        {showOverlay && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              +{media.length - 4}
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  // Limit to first 4 media items in grid view
  const displayedMedia = media.slice(0, 4);

  return (
    <>
      <div className={cn("mt-4", className)}>
        {media.length === 1 && media[0] ? (
          // Single media - full width
          <div className="max-h-96 overflow-hidden rounded-lg">
            {renderMedia(media[0], 0)}
          </div>
        ) : media.length > 1 ? (
          // Multiple media - grid
          <div className={cn("grid gap-2", getGridClass(media.length))}>
            {displayedMedia.map((item, index) => renderMedia(item, index))}
          </div>
        ) : null}
      </div>

      {/* Lightbox for images */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <img
              src={media[selectedIndex]?.url}
              alt=""
              className="w-full h-auto max-h-[90vh] object-contain"
            />

            {/* Navigation buttons if multiple images */}
            {media.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev > 0 ? prev - 1 : media.length - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="이전 이미지"
                >
                  ‹
                </button>
                <button
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev < media.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="다음 이미지"
                >
                  ›
                </button>

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedIndex + 1} / {media.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
