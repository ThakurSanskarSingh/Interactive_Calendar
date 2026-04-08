import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "soft" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "soft", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-body font-semibold",

        variant === "primary" && "bg-cal-primary text-white",
        variant === "soft" && "bg-cal-primary-soft text-cal-primary",
        variant === "muted" && "bg-cal-soft-muted text-cal-text-muted",

        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
