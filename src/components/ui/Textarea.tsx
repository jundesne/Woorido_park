import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  autoResize?: boolean;
  maxRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, autoResize = false, maxRows, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    const handleResize = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      // Reset height to auto to get proper scrollHeight
      textarea.style.height = "auto";

      // Calculate new height
      let newHeight = textarea.scrollHeight;

      // Apply max rows limit if specified
      if (maxRows) {
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const maxHeight = lineHeight * maxRows;
        newHeight = Math.min(newHeight, maxHeight);
      }

      textarea.style.height = `${newHeight}px`;
    }, [autoResize, maxRows]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        handleResize();
      }
      onChange?.(e);
    };

    React.useEffect(() => {
      if (autoResize) {
        handleResize();
      }
    }, [autoResize, handleResize]);

    // Merge refs
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-woorido focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none", // Disable manual resize when autoResize is true
          error && "border-error focus-visible:ring-error",
          className
        )}
        ref={setRefs}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
