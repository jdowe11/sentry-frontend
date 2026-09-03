"use client";

import React from "react";
import UiButton, { ButtonProps as UiButtonProps, ButtonVariant as UiVariant } from "@/components/ui/Button";

type LegacyVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "danger-outline"
  | "success"
  | "success-outline";

export interface ButtonProps extends Omit<UiButtonProps, "variant"> {
  variant?: LegacyVariant | UiVariant;
}

export default function Button({
  variant = "primary",
  ...props
}: ButtonProps) {
  let mappedVariant: UiVariant = "primary";

  if (variant === "danger") mappedVariant = "destructive";
  else if (variant === "danger-outline") mappedVariant = "destructive-outline";
  else if (variant === "success") mappedVariant = "primary";
  else if (variant === "success-outline") mappedVariant = "outline";
  else mappedVariant = variant as UiVariant;

  return <UiButton variant={mappedVariant} {...props} />;
}
