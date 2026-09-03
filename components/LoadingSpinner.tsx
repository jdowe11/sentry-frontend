"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  message = "Loading Sentry workspace...",
  fullPage = false,
}: LoadingSpinnerProps) {
  const containerClass = fullPage
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
    : "w-full h-full min-h-[260px]";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 select-none animate-in fade-in duration-200",
        containerClass
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-secondary/80 border border-border flex items-center justify-center text-primary shadow-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>

      {message && (
        <span className="text-xs font-semibold text-muted-foreground tracking-wide">
          {message}
        </span>
      )}
    </div>
  );
}
