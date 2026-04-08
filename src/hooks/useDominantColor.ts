"use client";

import { useCallback, useRef } from "react";
import { useCalendarStore } from "@/store/useCalendarStore";
import {
  extractDominantColor,
  generatePalette,
  applyPaletteToDOM,
  resetPalette,
} from "@/lib/color";

/**
 * useDominantColor
 *
 * Extracts the dominant color from the current hero image and applies it
 * as a live theme across the calendar UI.
 *
 * Architecture:
 *   1. HeroImage component calls `extractFromImage(imgEl)` once the image loads.
 *   2. We canvas-sample the image, derive a soft palette, and write it to the
 *      Zustand store (for React state awareness) AND as CSS custom properties
 *      on `document.documentElement` (for Tailwind utility class reactivity).
 *   3. When the user navigates to a new month, `reset()` removes the overrides
 *      and the next hero image triggers a fresh extraction.
 *
 * The CSS var approach is intentional: because globals.css uses `@theme inline`,
 * Tailwind classes like `bg-cal-primary` resolve at runtime through the CSS var
 * chain. Updating the vars via JS causes the entire UI to retheme without any
 * React re-renders beyond the store subscriber.
 *
 * Error handling:
 *   - CORS-restricted images fall back silently to the brand primary (#2872A1).
 *   - Extraction is debounced via a ref flag to prevent duplicate calls on
 *     images that fire multiple load events (e.g. cached images in Safari).
 */
export function useDominantColor() {
  const { setExtractedPalette, extractedPalette } = useCalendarStore();

  // Guard against running extraction multiple times for the same image element
  const extractingRef = useRef(false);
  // Track the last image src we extracted from — skip if it hasn't changed
  const lastSrcRef = useRef<string | null>(null);

  /**
   * Extract dominant color from a loaded HTMLImageElement and apply as theme.
   *
   * Call this from the `onLoad` handler of the hero <img> element.
   * It is safe to call on every render — duplicate calls for the same src
   * are deduplicated via the lastSrcRef guard.
   *
   * @param imgElement - A fully loaded HTMLImageElement (naturalWidth > 0)
   */
  const extractFromImage = useCallback(
    async (imgElement: HTMLImageElement) => {
      // Deduplicate: skip if same image or already extracting
      const src = imgElement.currentSrc || imgElement.src;
      if (extractingRef.current || src === lastSrcRef.current) return;

      // Guard against images that fired onLoad before fully decoding
      if (!imgElement.naturalWidth || !imgElement.complete) return;

      extractingRef.current = true;

      try {
        const dominantHex = await extractDominantColor(imgElement);
        const palette = generatePalette(dominantHex);

        // 1. Update Zustand store — React components that read extractedPalette
        //    can respond (e.g. ThemeOverlay, debug displays).
        setExtractedPalette(palette);

        // 2. Apply directly to the DOM — this is what actually updates all
        //    Tailwind utility classes via the CSS var chain in globals.css.
        applyPaletteToDOM(palette);

        lastSrcRef.current = src;
      } catch (err) {
        // Non-fatal: extraction can fail on CORS-restricted images.
        // The calendar falls back to the static brand palette gracefully.
        if (process.env.NODE_ENV === "development") {
          console.warn("[useDominantColor] Extraction failed:", err);
        }
      } finally {
        extractingRef.current = false;
      }
    },
    [setExtractedPalette]
  );

  /**
   * Reset the dynamic theme back to the static brand palette.
   *
   * Call this when:
   *   - The user navigates to a month whose hero image hasn't loaded yet
   *   - The user explicitly toggles off dynamic theming
   *   - The component unmounts (via useEffect cleanup in HeroImage)
   */
  const reset = useCallback(() => {
    setExtractedPalette(null);
    resetPalette();
    lastSrcRef.current = null;
    extractingRef.current = false;
  }, [setExtractedPalette]);

  /**
   * Force a re-extraction on the next call to extractFromImage.
   * Useful when the user manually changes the hero image URL.
   */
  const invalidate = useCallback(() => {
    lastSrcRef.current = null;
  }, []);

  return {
    /** The currently applied palette, or null if using brand defaults */
    extractedPalette,

    /** True when a custom palette is currently active */
    isThemed: extractedPalette !== null,

    /** Extract and apply theme from a loaded image element */
    extractFromImage,

    /** Remove the dynamic theme and restore brand defaults */
    reset,

    /** Force the next extractFromImage call to re-extract even for the same src */
    invalidate,
  };
}
