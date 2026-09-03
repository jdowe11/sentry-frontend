"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        <div className="relative flex items-center w-full">
          {icon && (
            <span className="absolute left-3 text-muted-foreground pointer-events-none flex items-center justify-center">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-input text-foreground placeholder:text-muted-foreground/60 border border-border rounded-lg px-3 py-2 text-sm transition-colors duration-150 outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pl-9",
              rightIcon && "pr-9",
              error && "border-destructive focus:border-destructive focus:ring-destructive",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-muted-foreground flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <span className="text-xs text-destructive font-medium px-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
