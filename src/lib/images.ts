import { SeasonalImage } from "@/types/calendar";

export const SEASONAL_IMAGES: SeasonalImage[] = [
  {
    month: 1,
    src: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1200&q=80&auto=format&fit=crop",
    alt: "Snow-covered pine forest blanketed in winter silence",
    credit: "Photo by Claudio Testa on Unsplash",
  },
  {
    month: 2,
    src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80&auto=format&fit=crop",
    alt: "Delicate frost patterns on a winter morning window",
    credit: "Photo by Unsplash",
  },
  {
    month: 3,
    src: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=1200&q=80&auto=format&fit=crop",
    alt: "Soft pink cherry blossom branches against a pale sky",
    credit: "Photo by Boudewijn Huysmans on Unsplash",
  },
  {
    month: 4,
    src: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80&auto=format&fit=crop",
    alt: "Rain-kissed tulips blooming in a spring garden",
    credit: "Photo by Unsplash",
  },
  {
    month: 5,
    src: "https://images.unsplash.com/photo-1490750967868-88df5691cc77?w=1200&q=80&auto=format&fit=crop",
    alt: "Rolling lavender fields glowing in late spring light",
    credit: "Photo by Unsplash",
  },
  {
    month: 6,
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop",
    alt: "Turquoise ocean water lapping a white sand beach in summer",
    credit: "Photo by Sean O. on Unsplash",
  },
  {
    month: 7,
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop",
    alt: "Dramatic mountain peaks towering beneath a vivid summer sky",
    credit: "Photo by Kace Rodriguez on Unsplash",
  },
  {
    month: 8,
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80&auto=format&fit=crop",
    alt: "Warm golden hour light washing over open countryside in August",
    credit: "Photo by Unsplash",
  },
  {
    month: 9,
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80&auto=format&fit=crop",
    alt: "Amber and crimson maple leaves drifting in early autumn",
    credit: "Photo by Unsplash",
  },
  {
    month: 10,
    src: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80&auto=format&fit=crop",
    alt: "Misty forest path carpeted in fallen October leaves",
    credit: "Photo by Unsplash",
  },
  {
    month: 11,
    src: "https://images.unsplash.com/photo-1467139701929-18c0d27a7516?w=1200&q=80&auto=format&fit=crop",
    alt: "Quiet fog rolling over a bare November hillside at dusk",
    credit: "Photo by Unsplash",
  },
  {
    month: 12,
    src: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&q=80&auto=format&fit=crop",
    alt: "Snow-dusted pine boughs glowing with warm Christmas lights",
    credit: "Photo by Jonathan Borba on Unsplash",
  },
];

/**
 * Get the seasonal hero image config for a given month (1–12).
 * Falls back to January if month is out of range.
 */
export function getSeasonalImage(month: number): SeasonalImage {
  return SEASONAL_IMAGES.find((img) => img.month === month) ?? SEASONAL_IMAGES[0];
}

/**
 * Get the seasonal image src URL for a given Date object.
 */
export function getSeasonalImageForDate(date: Date): SeasonalImage {
  return getSeasonalImage(date.getMonth() + 1);
}
