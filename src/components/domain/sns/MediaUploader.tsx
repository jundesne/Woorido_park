import * as React from "react";
import { ImagePlus, X, FileVideo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useUploadMedia } from "@/hooks/queries";
import { usePostEditorStore } from "@/hooks/stores";
import { MEDIA_CONSTRAINTS } from "@/types/post";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MediaUploaderProps {
  gyeId: string;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function MediaUploader({
  gyeId,
  maxFiles = MEDIA_CONSTRAINTS.MAX_FILES,
  disabled = false,
  className,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadMedia();

  const { uploadedMedia, addMedia, removeMedia, setIsUploading, setUploadProgress } =
    usePostEditorStore();

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MEDIA_CONSTRAINTS.MAX_FILE_SIZE) {
      return `파일 크기는 ${MEDIA_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다.`;
    }

    // Check file type
    const isImage = MEDIA_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(file.type as any);
    const isVideo = MEDIA_CONSTRAINTS.ALLOWED_VIDEO_TYPES.includes(file.type as any);

    if (!isImage && !isVideo) {
      return "지원하지 않는 파일 형식입니다. 이미지 또는 동영상만 업로드 가능합니다.";
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    if (uploadedMedia.length >= maxFiles) {
      toast.error(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev: number) => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadMutation.mutateAsync({ gyeId, file });

      clearInterval(progressInterval);
      setUploadProgress(100);

      addMedia(result);
      toast.success("파일이 업로드되었습니다.");
    } catch (error) {
      toast.error("파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFilesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    for (const file of fileArray) {
      await handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    handleFilesSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemove = (mediaId: string) => {
    removeMedia(mediaId);
    toast.success("파일이 제거되었습니다.");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drag & Drop Zone */}
      {uploadedMedia.length < maxFiles && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-colors",
            isDragging
              ? "border-woorido bg-woorido-50"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelect(e.target.files)}
            disabled={disabled}
          />

          <div className="flex flex-col items-center justify-center text-center">
            <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              이미지/동영상을 끌어다 놓으세요
            </p>
            <p className="text-xs text-gray-500 mb-3">
              또는 클릭해서 파일 선택 (최대 {maxFiles}개, 각 10MB 이하)
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              파일 선택
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadMutation.isPending && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">업로드 중...</span>
            <span className="text-gray-500">
              {usePostEditorStore.getState().uploadProgress}%
            </span>
          </div>
          <Progress value={usePostEditorStore.getState().uploadProgress} />
        </div>
      )}

      {/* Preview Grid */}
      {uploadedMedia.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {uploadedMedia.map((media) => (
              <motion.div
                key={media.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="relative aspect-square group"
              >
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <FileVideo className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(media.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg">
                  {(media.size / 1024 / 1024).toFixed(2)}MB
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
