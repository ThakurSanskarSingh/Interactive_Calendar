import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  position?: "top" | "bottom";
}

export function Tooltip({
  content,
  position = "top",
  className,
  children,
  ...props
}: TooltipProps) {
  return (
    <div className={cn("relative group inline-flex", className)} {...props}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-50 px-2 py-1 rounded-lg",
          "text-[11px] font-body font-medium text-white bg-cal-text whitespace-nowrap",
          "opacity-0 pointer-events-none group-hover:opacity-100",
          "transition-opacity duration-150",
          "shadow-[var(--shadow-cal-sm)]",
          position === "top" && "bottom-full mb-1.5",
          position === "bottom" && "top-full mt-1.5"
        )}
      >
        {content}
        {/* Arrow */}
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 w-0 h-0",
            "border-x-4 border-x-transparent",
            position === "top" && "top-full border-t-4 border-t-cal-text",
            position === "bottom" && "bottom-full border-b-4 border-b-cal-text"
          )}
          aria-hidden="true"
        />
      </span>
    </div>
  );
}
