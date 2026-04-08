import { clsx, type ClassValue } from "clsx";

/**
 * Merge class names safely using clsx.
 *
 * Accepts any mix of strings, arrays, objects, and falsy values.
 * Falsy values are ignored, conditional classes work naturally:
 *
 *   cn("base", isActive && "active", { "disabled": !enabled })
 *
 * At this project scale, clsx alone is sufficient — tailwind-merge is only
 * needed when you have conflicting Tailwind utility classes that need
 * deduplication (e.g. two `p-*` values). Add it if that becomes an issue.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
