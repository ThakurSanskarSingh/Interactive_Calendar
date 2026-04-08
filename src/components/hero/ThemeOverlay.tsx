"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCalendarStore } from "@/store/useCalendarStore";

/**
 * ThemeOverlay
 *
 * A tasteful indicator shown in the lower-left of the hero image when dynamic
 * color theming is active (i.e. dominant color has been extracted from the
 * current month's image and applied to the UI).
 *
 * Design intent:
 *   - Small enough not to distract from the hero image
 *   - Legible against any image (frosted glass pill)
 *   - Shows the extracted color as a swatch so users understand the theming
 *   - Fades in smoothly after extraction completes
 *
 * Placement: rendered inside HeroImage at absolute bottom-left.
 */
export function ThemeOverlay() {
  const extractedPalette = useCalendarStore((s) => s.extractedPalette);

  return (
    <AnimatePresence>
      {extractedPalette && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.92 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
          }}
          title={`Seasonal theme active: ${extractedPalette.primary}`}
        >
          {/* Color swatch — the extracted primary color */}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-white/30"
            style={{ backgroundColor: extractedPalette.primary }}
            aria-hidden="true"
          />
          {/* Label */}
          <span className="text-[10px] font-body font-medium text-white/90 leading-none whitespace-nowrap">
            Seasonal theme
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
