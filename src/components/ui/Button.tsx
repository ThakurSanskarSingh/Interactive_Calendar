"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-body font-medium transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cal-primary focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",

          // Size
          size === "sm" && "h-7 px-3 text-xs rounded-[var(--radius-button)]",
          size === "md" && "h-9 px-4 text-sm rounded-[var(--radius-button)]",
          size === "lg" && "h-11 px-6 text-base rounded-[var(--radius-button)]",

          // Variant
          variant === "primary" && [
            "bg-cal-primary text-white",
            "hover:bg-cal-primary-hover",
            "active:scale-[0.97]",
          ],
          variant === "ghost" && [
            "text-cal-primary bg-transparent",
            "hover:bg-cal-primary-soft",
          ],
          variant === "outline" && [
            "border border-cal-border text-cal-text bg-transparent",
            "hover:border-cal-primary hover:text-cal-primary hover:bg-cal-primary-soft",
          ],

          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
