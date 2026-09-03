"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "right" | "left" | "top" | "bottom";
  className?: string;
}

export default function Tooltip({
  content,
  children,
  side = "right",
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const sidePositions: Record<string, string> = {
    right: "left-full ml-3 top-1/2 -translate-y-1/2",
    left: "right-full mr-3 top-1/2 -translate-y-1/2",
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className="relative flex items-center justify-center group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2.5 py-1 text-xs font-medium text-foreground bg-[#1c232e] border border-border/80 rounded-md shadow-lg shadow-black/40 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100",
            sidePositions[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
