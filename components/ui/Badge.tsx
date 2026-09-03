"use client";

import React from "react";
import { cn } from "@/utils/cn";

export type BadgeVariant =
  | "default"
  | "emerald"
  | "destructive"
  | "warning"
  | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export default function Badge({
  children,
  variant = "default",
  icon,
  className,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-secondary text-secondary-foreground border-border/80",
    emerald: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
    destructive: "bg-red-950/60 text-red-400 border-red-800/50",
    warning: "bg-amber-950/60 text-amber-400 border-amber-800/50",
    outline: "bg-transparent text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border select-none transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
