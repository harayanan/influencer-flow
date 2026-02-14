"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadStepProps {
  imagePreview: string | null;
  onImageSelect: (file: File, preview: string) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";

export function UploadStep({ imagePreview, onImageSelect }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please upload a JPG, PNG, or WebP image.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be under 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Upload Your AI Character
        </h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Upload a high-quality portrait photo. This will become your
          AI-generated talking avatar for the video.
        </p>
      </div>

      {imagePreview ? (
        /* Preview State */
        <div className="relative group">
          <div className="relative w-64 overflow-hidden rounded-2xl border-2 border-violet-200 shadow-lg shadow-violet-100/50 bg-black" style={{ aspectRatio: "9/16" }}>
            <img
              src={imagePreview}
              alt="Uploaded character"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
              <ImageIcon className="size-4 text-white/80" />
              <span className="text-xs text-white/80 font-medium">
                9:16 Portrait
              </span>
            </div>
          </div>

          {/* Replace button */}
          <Button
            variant="outline"
            size="sm"
            className="absolute -top-3 -right-3 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleClick}
          >
            <X className="size-3.5" />
            <span className="sr-only">Replace image</span>
          </Button>

          {/* Replace prompt */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Click the <span className="font-medium">X</span> or drag a new
            image to replace
          </p>
        </div>
      ) : (
        /* Drop Zone */
        <button
          type="button"
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative w-full max-w-sm cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
            isDragging
              ? "border-violet-500 bg-violet-50 scale-[1.02] shadow-lg shadow-violet-100/50"
              : "border-muted-foreground/25 hover:border-violet-400 hover:bg-violet-50/50 hover:shadow-md",
          )}
          style={{ aspectRatio: "9/16" }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-4">
            {/* Icon with gradient background */}
            <div
              className={cn(
                "flex items-center justify-center rounded-2xl p-4 transition-all duration-300",
                isDragging
                  ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white scale-110"
                  : "bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600"
              )}
            >
              <Upload className="size-8" />
            </div>

            {/* Text */}
            <div className="text-center space-y-1.5">
              <p className="text-sm font-semibold text-foreground">
                {isDragging ? "Drop your image here" : "Drag & drop your photo"}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse
              </p>
            </div>

            {/* File type badges */}
            <div className="flex gap-2">
              {["JPG", "PNG", "WebP"].map((ext) => (
                <span
                  key={ext}
                  className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {ext}
                </span>
              ))}
            </div>

            {/* Size limit */}
            <p className="text-[10px] text-muted-foreground/60">
              Max file size: 10MB
            </p>
          </div>

          {/* Decorative corner accents */}
          <div className="absolute top-3 left-3 h-4 w-4 rounded-tl-lg border-t-2 border-l-2 border-violet-300/50" />
          <div className="absolute top-3 right-3 h-4 w-4 rounded-tr-lg border-t-2 border-r-2 border-violet-300/50" />
          <div className="absolute bottom-3 left-3 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-violet-300/50" />
          <div className="absolute bottom-3 right-3 h-4 w-4 rounded-br-lg border-b-2 border-r-2 border-violet-300/50" />
        </button>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
