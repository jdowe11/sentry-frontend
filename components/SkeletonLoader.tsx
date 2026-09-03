"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface SkeletonLoaderProps {
  type?: "list" | "card" | "text" | "profile";
  count?: number;
  className?: string;
}

export default function SkeletonLoader({
  type = "list",
  count = 3,
  className,
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count });

  return (
    <div className={cn("flex flex-col gap-3 w-full select-none", className)}>
      {/* 1. List Skeleton */}
      {type === "list" && (
        <div className="flex flex-col gap-2.5">
          {items.map((_, idx) => (
            <div
              key={idx}
              className="bg-secondary/40 border border-border/60 rounded-xl p-3.5 flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-secondary shrink-0" />
                <div className="flex flex-col gap-2 flex-1 max-w-xs">
                  <div className="h-3.5 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary/60 rounded w-1/2" />
                </div>
              </div>
              <div className="h-7 bg-secondary rounded-lg w-20 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* 2. Card Skeleton */}
      {type === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((_, idx) => (
            <div
              key={idx}
              className="bg-card border border-border/80 rounded-xl p-5 flex flex-col gap-4 animate-pulse shadow-sm"
            >
              <div className="h-4 bg-secondary rounded w-1/2" />
              <div className="flex flex-col gap-2">
                <div className="h-3 bg-secondary/80 rounded w-full" />
                <div className="h-3 bg-secondary/60 rounded w-5/6" />
              </div>
              <div className="h-8 bg-secondary rounded-lg w-24 mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* 3. Text Skeleton */}
      {type === "text" && (
        <div className="flex flex-col gap-2.5">
          {items.map((_, idx) => (
            <div key={idx} className="flex flex-col gap-2 animate-pulse">
              <div className="h-3.5 bg-secondary rounded w-full" />
              <div className="h-3.5 bg-secondary/80 rounded w-11/12" />
              <div className="h-3.5 bg-secondary/60 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* 4. Profile Skeleton */}
      {type === "profile" && (
        <div className="flex items-center gap-4 bg-card p-6 border border-border rounded-xl animate-pulse">
          <div className="w-16 h-16 rounded-full bg-secondary shrink-0" />
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="h-4 bg-secondary rounded w-1/3" />
            <div className="h-3 bg-secondary/70 rounded w-1/2" />
          </div>
        </div>
      )}
    </div>
  );
}
