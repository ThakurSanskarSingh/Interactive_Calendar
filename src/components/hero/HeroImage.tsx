"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendarStore } from "@/store/useCalendarStore";
import { useDominantColor } from "@/hooks/useDominantColor";
import { getSeasonalImageForDate } from "@/lib/images";
import { getMonthLabel } from "@/lib/date";
import { ThemeOverlay } from "./ThemeOverlay";
import { cn } from "@/lib/utils";

export function HeroImage() {
  const currentMonth = useCalendarStore((s) => s.currentMonth);
  const { extractFromImage, reset } = useDominantColor();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const image = getSeasonalImageForDate(currentMonth);
  const monthKey = getMonthLabel(currentMonth);

  // Reset loaded state when the month (and therefore image src) changes.
  // This re-shows the skeleton while the new image fetches.
  useEffect(() => {
    setIsImageLoaded(false);
    // Reset the dominant color so the old palette doesn't linger while the
    // new image is still loading.
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setIsImageLoaded(true);
      extractFromImage(e.currentTarget);
    },
    [extractFromImage],
  );

  return (
    <div
      className="relative w-full overflow-hidden flex-shrink-0"
      style={{ height: "220px" }}
      aria-hidden="true"
    >
      {/* ── Loading skeleton ─────────────────────────────────────────── */}
      {/*
        A soft gradient background that shows while the image fetches.
        Uses a CSS transition (not Framer Motion) for a simple fade-out
        once isImageLoaded becomes true. This avoids flicker when the
        image is already cached (near-instant load).
      */}
      <div
        className={cn(
          "absolute inset-0 z-0 transition-opacity duration-500",
          "bg-gradient-to-br from-cal-soft to-cal-soft-muted",
          isImageLoaded ? "opacity-0" : "opacity-100",
        )}
      >
        {/* Subtle shimmer sweep */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: isImageLoaded ? "none" : "shimmer 1.6s infinite",
          }}
        />
      </div>

      {/* ── Seasonal image with crossfade ────────────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={monthKey}
          className="absolute inset-0 z-10"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          {/*
           * Plain <img> — intentional. next/image wraps in a <span> that makes
           * the underlying DOM element inaccessible for canvas color sampling.
           * The eslint suppression is justified and documented.
           */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={image.src}
            alt={image.alt}
            onLoad={handleLoad}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            style={{ display: "block" }}
          />

          {/* Bottom gradient — keeps UI readable over any image */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(24,48,66,0.65) 0%, rgba(24,48,66,0.10) 50%, transparent 100%)",
            }}
          />

          {/* Image credit */}
          {image.credit && (
            <p className="absolute bottom-2 right-3 text-white/40 text-[10px] font-body tracking-wide select-none">
              {image.credit}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Theme overlay indicator ───────────────────────────────────── */}
      {/* Sits above everything; shows extracted palette status */}
      <div className="absolute bottom-3 left-3 z-20">
        <ThemeOverlay />
      </div>
    </div>
  );
}
