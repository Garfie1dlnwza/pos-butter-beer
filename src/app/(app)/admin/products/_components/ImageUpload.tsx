"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { getFileUrl } from "@/lib/storage";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onDelete,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("รองรับเฉพาะ JPEG, PNG, WebP, GIF");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Upload failed");
      }

      const data = (await res.json()) as { url: string; key: string };
      // Save key instead of full URL
      onChange(data.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onDelete?.();
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={disabled ?? isUploading}
        className="hidden"
      />

      {value ? (
        // Show preview
        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-xl border border-[#D7CCC8]">
          <Image
            src={getFileUrl(value)}
            alt="Product"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled ?? isUploading}
            className="absolute top-2 right-2 cursor-pointer rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600 disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : (
        // Show upload button
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled ?? isUploading}
          className="flex aspect-square w-full max-w-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D7CCC8] bg-[#FAFAFA] transition hover:border-[#8D6E63] hover:bg-[#FFF8E1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8D6E63] border-t-transparent" />
              <span className="text-xs text-[#8D6E63]">Uploading...</span>
            </>
          ) : (
            <>
              <svg
                className="h-8 w-8 text-[#D7CCC8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-medium text-[#8D6E63]">
                อัพโหลดรูป
              </span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
