import { ThemePalette } from "@/types/calendar";

// ---------------------------------------------------------------------------
// Canvas-based dominant color extraction
// ---------------------------------------------------------------------------

/**
 * Extract the dominant color from an HTMLImageElement using a canvas sample.
 * Downsamples to a small grid for performance, skips near-white, near-black,
 * and transparent pixels to find a meaningful representative hue.
 *
 * Returns a hex color string. Falls back to the brand primary on any error
 * (CORS restrictions, missing canvas support, etc.).
 */
export async function extractDominantColor(
  imgElement: HTMLImageElement
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve("#2872A1");
      return;
    }

    // Sample at 50×50 — enough color information, fast enough to be synchronous
    const SAMPLE_SIZE = 50;
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;

    try {
      ctx.drawImage(imgElement, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
      const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i];
        const pg = data[i + 1];
        const pb = data[i + 2];
        const pa = data[i + 3];

        // Skip transparent pixels
        if (pa < 128) continue;

        // Skip near-white (washes out palette) and near-black (too dark to use)
        const brightness = (pr + pg + pb) / 3;
        if (brightness > 225 || brightness < 30) continue;

        r += pr;
        g += pg;
        b += pb;
        count++;
      }

      if (count === 0) {
        resolve("#2872A1");
        return;
      }

      const avgR = Math.round(r / count);
      const avgG = Math.round(g / count);
      const avgB = Math.round(b / count);

      resolve(rgbToHex(avgR, avgG, avgB));
    } catch {
      // Swallow CORS and security errors — fall back gracefully
      resolve("#2872A1");
    }
  });
}

// ---------------------------------------------------------------------------
// Color conversion helpers
// ---------------------------------------------------------------------------

/**
 * Convert individual R, G, B channel values (0–255) to a hex color string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((channel) =>
        Math.max(0, Math.min(255, Math.round(channel)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

/**
 * Parse a CSS hex color string ("#RRGGBB" or "#RGB") into [r, g, b] channels.
 * Returns [40, 114, 161] (brand primary) as fallback.
 */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return [40, 114, 161];
  return [r, g, b];
}

/**
 * Parse an "rgb(r, g, b)" CSS string to a hex color.
 * Falls back to brand primary on parse failure.
 */
export function rgbStringToHex(rgb: string): string {
  const match = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return "#2872A1";
  return rgbToHex(
    parseInt(match[1]),
    parseInt(match[2]),
    parseInt(match[3])
  );
}

// ---------------------------------------------------------------------------
// Palette manipulation
// ---------------------------------------------------------------------------

/**
 * Blend a hex color toward white by a given ratio.
 * ratio = 0 → original color
 * ratio = 1 → pure white (#ffffff)
 */
export function lightenColor(hex: string, ratio: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = Math.max(0, Math.min(1, ratio));
  return rgbToHex(
    Math.round(r + (255 - r) * t),
    Math.round(g + (255 - g) * t),
    Math.round(b + (255 - b) * t)
  );
}

/**
 * Darken a hex color toward black by a given ratio.
 * ratio = 0 → original color
 * ratio = 1 → pure black (#000000)
 */
export function darkenColor(hex: string, ratio: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = Math.max(0, Math.min(1, ratio));
  return rgbToHex(
    Math.round(r * (1 - t)),
    Math.round(g * (1 - t)),
    Math.round(b * (1 - t))
  );
}

/**
 * Increase color saturation by blending toward a more vivid version.
 * Simple approach: push each channel further from the average.
 */
export function saturateColor(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const avg = (r + g + b) / 3;
  return rgbToHex(
    Math.round(r + (r - avg) * amount),
    Math.round(g + (g - avg) * amount),
    Math.round(b + (b - avg) * amount)
  );
}

// ---------------------------------------------------------------------------
// Palette generation
// ---------------------------------------------------------------------------

/**
 * Generate a soft, UI-safe palette from a dominant hex color.
 *
 * Returns:
 *   primary — the dominant color, saturated slightly for use as accent
 *   soft    — a very light tint, suitable for range highlights and backgrounds
 *   text    — a dark tint of the same hue, suitable for readable body text
 */
export function generatePalette(dominantHex: string): ThemePalette {
  // Slightly saturate the dominant color so it reads well as a UI accent
  const primary = saturateColor(dominantHex, 0.15);
  // Soft = 72% toward white — makes a gentle range-highlight background
  const soft = lightenColor(dominantHex, 0.72);
  // Text = 48% toward black — keeps the same hue but is dark enough to read
  const text = darkenColor(dominantHex, 0.48);

  return { primary, soft, text };
}

// ---------------------------------------------------------------------------
// DOM application
// ---------------------------------------------------------------------------

/**
 * Apply a ThemePalette as CSS custom properties on the document root element.
 *
 * Because globals.css defines `@theme inline` tokens that reference these vars,
 * all Tailwind utility classes (bg-cal-primary, text-cal-text, etc.) will
 * update reactively without any React re-renders.
 *
 * Safe to call in browser-only contexts (guarded against SSR).
 */
export function applyPaletteToDOM(palette: ThemePalette): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--cal-primary", palette.primary);
  root.style.setProperty("--cal-soft", palette.soft);
  root.style.setProperty("--cal-text", palette.text);

  // Also derive and update the hover and soft-primary variants
  root.style.setProperty("--cal-primary-hover", darkenColor(palette.primary, 0.15));
  root.style.setProperty("--cal-primary-soft", lightenColor(palette.primary, 0.82));
  root.style.setProperty("--cal-range", lightenColor(palette.primary, 0.55));
  root.style.setProperty("--cal-border", lightenColor(palette.primary, 0.65));
}

/**
 * Reset all dynamic palette CSS variables, restoring the static brand defaults
 * defined in globals.css :root.
 *
 * Call this when navigating away from a themed month or when the user
 * explicitly resets the theme.
 */
export function resetPalette(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const vars = [
    "--cal-primary",
    "--cal-primary-hover",
    "--cal-primary-soft",
    "--cal-soft",
    "--cal-text",
    "--cal-range",
    "--cal-border",
  ];
  vars.forEach((v) => root.style.removeProperty(v));
}

// ---------------------------------------------------------------------------
// Accessibility helper
// ---------------------------------------------------------------------------

/**
 * Calculate relative luminance of a hex color per WCAG 2.1 spec.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const sRGB = channel / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two hex colors.
 * Returns a value from 1 (no contrast) to 21 (black on white).
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Given a background color, returns "#FFFFFF" or a dark text color
 * that achieves at least a 4.5:1 WCAG AA contrast ratio.
 * Useful for ensuring text on dynamically-themed surfaces is readable.
 */
export function getAccessibleTextColor(
  backgroundHex: string,
  darkTextHex = "#183042"
): string {
  const onWhite = getContrastRatio(backgroundHex, "#FFFFFF");
  const onDark = getContrastRatio(backgroundHex, darkTextHex);
  return onWhite >= onDark ? "#FFFFFF" : darkTextHex;
}
