"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";

export type AvatarStatus = "online" | "idle" | "dnd" | "offline";
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

export default function Avatar({
  src,
  alt = "User avatar",
  fallback,
  size = "md",
  status,
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses: Record<AvatarSize, { container: string; text: string; dot: string; dotOffset: string }> = {
    xs: { container: "w-6 h-6", text: "text-[10px]", dot: "w-2 h-2", dotOffset: "-bottom-0.5 -right-0.5" },
    sm: { container: "w-8 h-8", text: "text-xs", dot: "w-2.5 h-2.5", dotOffset: "-bottom-0.5 -right-0.5" },
    md: { container: "w-10 h-10", text: "text-sm", dot: "w-3 h-3", dotOffset: "-bottom-0.5 -right-0.5" },
    lg: { container: "w-12 h-12", text: "text-base", dot: "w-3.5 h-3.5", dotOffset: "-bottom-0.5 -right-0.5" },
    xl: { container: "w-16 h-16", text: "text-xl", dot: "w-4 h-4", dotOffset: "bottom-0 right-0" },
  };

  const statusColors: Record<AvatarStatus, string> = {
    online: "bg-emerald-500 ring-2 ring-card",
    idle: "bg-amber-500 ring-2 ring-card",
    dnd: "bg-red-500 ring-2 ring-card",
    offline: "bg-zinc-500 ring-2 ring-card",
  };

  const currentSize = sizeClasses[size];
  const initials = fallback
    ? fallback.slice(0, 2).toUpperCase()
    : alt.slice(0, 2).toUpperCase();

  return (
    <div className={cn("relative inline-block shrink-0", currentSize.container, className)}>
      <div className={cn("w-full h-full rounded-full overflow-hidden flex items-center justify-center font-bold bg-secondary text-secondary-foreground border border-border/80 select-none")}>
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={cn("font-medium tracking-tight", currentSize.text)}>
            {initials}
          </span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute rounded-full",
            currentSize.dot,
            currentSize.dotOffset,
            statusColors[status]
          )}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}
