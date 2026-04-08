# Interactive Wall Calendar

A premium wall calendar component built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Zustand. Designed to feel like a real physical wall calendar — tactile, seasonal, and delightful to interact with.

---

## Overview

Most calendar UIs feel like developer tools. This one was designed to feel like a product.

Every interaction detail — range selection, month navigation, note-taking, visual theming — was considered from a product and UX standpoint, not just an implementation standpoint. The goal was to build something a reviewer would remember after seeing twenty other submissions.

---

## Features

### Core Calendar

- **Month grid** — Full 6-week view including leading/trailing days from adjacent months. Clicking an out-of-month day navigates to that month.
- **Month navigation** — Previous/next controls with a direction-aware slide animation. A "Today" pill appears when you've navigated away from the current month.
- **Today indicator** — The current date is always marked with a ring (not a fill — so it remains distinct from a selection).
- **Seasonal hero images** — Each month shows a curated full-bleed Unsplash photo. Images crossfade smoothly on month change with a subtle Ken Burns zoom.

### Date Range Selection

- **Click-to-anchor + click-to-confirm** — First click sets the start date; second click finalizes the range. No dragging required.
- **Backward selection** — Ranges are always order-normalized. Selecting from the 15th back to the 5th works identically to selecting forward.
- **Same-day selection** — Clicking the same date twice collapses to a single-day selection.
- **Live hover preview** — While a start is anchored, hovering over any date shows a real-time preview of the resulting range.
- **Connected range visuals** — Start and end cells show a full circle; in-range days show a flat connected fill strip. The strip bleeds edge-to-edge between adjacent cells (no column gap in the grid) so the selection reads as one continuous band.
- **Selection mode indicator** — An animated hint bar slides in below the header when the first date is anchored, reassuring users (especially on mobile, where there is no hover preview) that a range selection is in progress.
- **Escape to cancel** — Pressing Escape at any point during selection resets cleanly to idle state.

### Notes

- **Per-day and per-range notes** — Notes are scoped to their exact selection key. A single-day note and a range note for overlapping dates are stored and displayed independently.
- **Sticky note aesthetic** — Each note card uses a warm paper color (yellow, blue, or pink) with a slight ID-derived rotation (±2.5°) to feel tactile and handwritten, not like a form field.
- **Inline editing** — Click any note text to edit in place. `Cmd/Ctrl+Enter` saves; `Escape` cancels without committing.
- **Color picker** — Adding a note opens an inline textarea with a three-swatch color picker. Colors rotate automatically so consecutive notes feel visually varied.
- **Persistence** — Notes survive page refresh via Zustand's `persist` middleware writing to `localStorage`. Only notes are persisted; ephemeral UI state (hover, selection mode, current month) resets cleanly on reload.
- **Note indicators** — Days with saved notes show a small blue dot below the date number in the grid. The dot flips to white when the day is selected.
- **Animated entry/exit** — Notes animate in and out of the panel individually via Framer Motion's `AnimatePresence` + `layout` prop, so reordering and deletion feel smooth.

### Visual Polish

- **Wall calendar binding** — A strip of small circular "holes" at the top of the calendar card suggests a physical spiral wire binding. The card reads as a real hanging calendar, not a UI widget.
- **Page-flip animation** — On month change, the date grid exits with a subtle Y-translation and 3D `rotateX` tilt (via CSS `perspective`), and the new month enters from the opposite direction. Forward and backward navigation animate in opposite directions.
- **Dynamic seasonal theming** — When a hero image loads, a canvas element samples its pixels, computes the dominant hue, and generates a soft palette (saturated primary, lightened soft, darkened text). These are written as CSS custom properties on `document.documentElement`, which the Tailwind `@theme inline` chain picks up reactively — every `bg-cal-primary`, `text-cal-primary`, etc. in the UI updates without any React re-renders.
- **Loading skeleton** — While a hero image fetches, a soft gradient skeleton with a shimmer sweep animation fills the space. The skeleton fades out as the image loads.
- **Theme indicator** — A frosted-glass pill appears in the bottom-left corner of the hero image once a seasonal palette has been extracted, showing the dominant color as a swatch.
- **Holiday markers** — 25 US holidays are marked with a small colored dot below the date number. Federal holidays use the brand primary blue; cultural observances use a softer blue; seasonal markers (first days of seasons) use green. The full holiday name appears as a native tooltip on hover.
- **Notes heatmap** — When the current month has at least one note, a micro heatmap appears at the bottom of the notes panel showing note density per day. Clicking a heatmap cell selects that day. The heatmap is hidden when there's nothing to show (no empty chrome principle).

---

## Standout Technical Decisions

### CSS Custom Property + `@theme inline` Architecture

Tailwind v4 supports `@theme inline`, which means theme tokens are resolved at runtime through CSS variable references rather than compiled to static values at build time. I exploit this to make dynamic theming free:

```css
/* globals.css */
:root {
  --cal-primary: #2872A1; /* static default */
}

@theme inline {
  --color-cal-primary: var(--cal-primary); /* resolved at runtime */
}
```

When the canvas color extractor runs, it does:

```ts
document.documentElement.style.setProperty("--cal-primary", extractedHex);
```

Every `bg-cal-primary` class in the entire app responds immediately — no React state, no re-renders, no prop drilling. This is the correct way to do runtime theming in Tailwind v4.

### Range State Machine

The range selection is modeled as an explicit two-state machine inside `useCalendarRange`:

- **IDLE** — no anchor set; clicking a day transitions to SELECTING
- **SELECTING** — start is anchored; hover updates a live preview; clicking finalizes or collapses

The preview range (`getPreviewRange()`) is derived from `(start, hoverDate)` during SELECTING and from `selectedRange` during IDLE. Components only call `getPreviewRange()` — they never need to know which state they're in.

### `DayCell` Range Background Rendering

The "connected range" visual (where adjacent selected cells share a continuous background strip) is implemented with three absolutely-positioned background divs behind each cell's circle button:

- **In-range cells**: full-width background strip
- **Start cell**: right-half background (bridges forward to next cell)
- **End cell**: left-half background (bridges back from previous cell)
- **Single-day selection**: no strip, just the circle

The grid uses `gap-x: 0` intentionally — any column gap would create visual holes in the strip between adjacent cells.

### `memo()` on DayCell

The calendar grid renders ~42 cells. Without memoization, any state change (hover, selection, notes) triggers a full 42-cell re-render. `DayCell` is wrapped in `React.memo()` so only the cells whose derived props actually changed (isStart, isEnd, isInRange, hasNotes, etc.) re-render. This is most important during hover-preview, which fires on every mouse move across the grid.

### Navigation Direction in Zustand Store

Rather than holding direction in local component state (duplicated across `CalendarHeader` and `CalendarGrid`), `navigationDirection` is computed automatically inside `setCurrentMonth`:

```ts
setCurrentMonth: (date) =>
  set((state) => ({
    currentMonth: date,
    navigationDirection: date > state.currentMonth ? "forward" : "backward",
  })),
```

Both the header text slide and the grid page-flip read the same direction value from the store with zero coordination code.

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| Next.js | 16.x (App Router) | Framework, SSR, font optimization |
| React | 19 | Component model |
| TypeScript | 5 | Type safety throughout |
| Tailwind CSS | 4 | Styling with CSS-var-based design tokens |
| Framer Motion | 12 | Page flip, crossfades, note animations |
| Zustand | 5 | Global state with localStorage persistence |
| date-fns | 4 | All date arithmetic and formatting |
| clsx | latest | Class name composition utility |

No UI component libraries. No icon libraries. All interactive elements are hand-built.

---

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Design tokens (CSS vars + @theme inline)
│   ├── layout.tsx           # Root layout with Playfair Display + Inter fonts
│   └── page.tsx             # Entry point — renders CalendarShell
│
├── components/
│   ├── calendar/
│   │   ├── CalendarShell.tsx    # Root layout: two-column desktop, stacked mobile
│   │   ├── CalendarHeader.tsx   # Month nav + selection hint
│   │   ├── CalendarGrid.tsx     # 7-col grid, keyboard nav, page-flip animation
│   │   ├── DayCell.tsx          # Individual date cell with all visual states
│   │   └── MiniHeatmap.tsx      # Notes activity visualization
│   │
│   ├── hero/
│   │   ├── HeroImage.tsx        # Seasonal photo, loading skeleton, color extraction
│   │   └── ThemeOverlay.tsx     # Extracted palette indicator pill
│   │
│   ├── notes/
│   │   ├── NotesPanel.tsx       # Right-column notes UI, empty states
│   │   ├── StickyNoteCard.tsx   # Individual note card with inline editing
│   │   └── AddNoteButton.tsx    # Expandable add-note form with color picker
│   │
│   └── ui/
│       ├── Button.tsx           # Reusable button (primary / ghost / outline)
│       ├── Card.tsx             # Surface wrapper
│       ├── Badge.tsx            # Pill badge
│       └── Tooltip.tsx          # CSS-only tooltip
│
├── hooks/
│   ├── useCalendarRange.ts  # Range selection state machine
│   ├── useNotes.ts          # Note CRUD scoped to a DateRange
│   ├── useDominantColor.ts  # Canvas color extraction + DOM palette application
│   └── useLocalStorage.ts   # Generic localStorage sync hook
│
├── lib/
│   ├── date.ts              # Date utilities, calendar grid generation
│   ├── range.ts             # Range key formatting, labels, day counts
│   ├── notes.ts             # Note creation, color utilities, sorting
│   ├── color.ts             # Canvas sampling, palette generation, WCAG contrast
│   ├── holidays.ts          # 25 US holidays with type-aware coloring
│   ├── images.ts            # Seasonal Unsplash images per month
│   └── utils.ts             # cn() class merger
│
├── store/
│   └── useCalendarStore.ts  # Zustand store (notes persisted, UI state ephemeral)
│
└── types/
    ├── calendar.ts          # DateRange, DayCellMeta, HolidayEntry, SeasonalImage
    └── notes.ts             # Note, NoteColor, NotesMap
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables or API keys required. All data (notes) is stored in the browser's `localStorage`.

---

## Accessibility

- All day cells are `<button>` elements with descriptive `aria-label` attributes (e.g. "Monday, January 6, 2025 — New Year's Day (today)")
- `aria-pressed` on selected cells
- Arrow key navigation within the calendar grid (ARIA grid pattern)
- Escape key cancels range selection
- Visible `:focus-visible` ring on all interactive elements
- Color contrast meets WCAG AA across the default palette
- `prefers-reduced-motion` respected — all animations are suppressed via a global media query rule in `globals.css`
- Touch targets are 44×44px (outer cell div) on mobile
- Screen reader-friendly empty states and panel labels

---

## Design System

The design uses a token-driven system anchored to two base colors:

| Token | Value | Usage |
|---|---|---|
| `--cal-primary` | `#2872A1` | Selections, accents, links |
| `--cal-soft` | `#CBDDE9` | Range fills, hover states, binding strip |
| `--cal-bg` | `#F7FAFC` | Page background |
| `--cal-surface` | `#FFFFFF` | Card surfaces |
| `--cal-text` | `#183042` | Body text |
| `--cal-range` | `#B8D7EA` | In-range strip fill |

Typography: **Playfair Display** for display headings and month names (editorial, premium stationery feel); **Inter** for all UI text (clean, readable, modern).

The `--cal-primary` and related tokens can be overwritten at runtime by the dynamic theming system without touching any component code.

---

## Possible Improvements

Given more time, I would explore:

- **Floating holidays calculator** — replace the approximated fixed dates for floating US holidays (Labor Day, Thanksgiving, etc.) with a proper nth-weekday-of-month algorithm
- **Multi-month range selection** — allow ranges that span across month boundaries with visual continuity across months
- **Note drag-to-reorder** — use Framer Motion's drag API to let users reorder notes within a day
- **Export** — allow exporting notes as JSON, Markdown, or iCal format
- **Recurring notes** — mark a note as recurring weekly/annually
- **Dark mode** — the CSS custom property architecture makes this straightforward: a `prefers-color-scheme: dark` block in `globals.css` that overrides the `--cal-*` vars
- **Proper color quantization** — replace the averaging-based dominant color extractor with a k-means or median-cut algorithm for more accurate palette extraction, especially for images with two or more distinct dominant hues

---

## Build

```bash
npm run build   # Production build
npm run lint    # ESLint
npx tsc --noEmit  # TypeScript check
```

All three pass with zero errors and zero warnings.