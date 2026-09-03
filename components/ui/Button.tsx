"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "destructive-outline";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      isLoading = false,
      variant = "primary",
      size = "md",
      disabled,
      className,
      icon,
      ...props
    },
    ref
  ) => {
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-primary hover:bg-primary-hover active:bg-primary-active text-white shadow-sm shadow-primary/20",
      secondary:
        "bg-secondary hover:bg-accent text-secondary-foreground border border-border/80",
      outline:
        "border border-border bg-transparent hover:bg-accent text-foreground hover:border-border-strong",
      ghost:
        "bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground",
      destructive:
        "bg-destructive hover:bg-destructive-hover text-white shadow-sm shadow-destructive/20",
      "destructive-outline":
        "border border-destructive/40 text-destructive hover:bg-destructive/10",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      xs: "px-2.5 py-1 text-xs rounded-md gap-1.5 font-medium",
      sm: "px-3 py-1.5 text-xs rounded-md gap-1.5 font-medium",
      md: "px-3.5 py-2 text-sm rounded-lg gap-2 font-medium",
      lg: "px-5 py-2.5 text-base rounded-lg gap-2.5 font-semibold",
      icon: "h-9 w-9 p-0 rounded-lg justify-center",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "relative inline-flex flex-row items-center justify-center font-sans transition-colors duration-150 cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
        ) : (
          icon && <span className="shrink-0 inline-flex items-center">{icon}</span>
        )}
        {children && (
          <span className="inline-flex items-center gap-1.5 leading-none">
            {children}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
