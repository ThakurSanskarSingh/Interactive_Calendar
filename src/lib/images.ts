import { SeasonalImage } from "@/types/calendar";

/**
 * Seasonal imagery for the wall calendar.
 * Selected months updated with user-provided Unsplash choices.
 * Note: URLs are converted from Unsplash photo pages to direct image source URLs.
 */
export const SEASONAL_IMAGES: SeasonalImage[] = [
  {
    month: 1,
    src: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1200&q=80&auto=format&fit=crop",
    alt: "Snowy landscape with trees and bright sun",
    credit: "Photo by Unsplash",
  },
  {
    month: 2,
    src: "https://images.unsplash.com/photo-1454311843079-994119d6904f?w=1200&q=80&auto=format&fit=crop",
    alt: "Frozen leaf on a wire fence",
    credit: "Photo by Unsplash",
  },
  {
    month: 3,
    src: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80&auto=format&fit=crop",
    alt: "Green field with a blue sky",
    credit: "Photo by Unsplash",
  },
  {
    month: 4,
    src: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80&auto=format&fit=crop",
    alt: "Rain-kissed tulips blooming in a spring garden",
    credit: "Photo by Unsplash",
  },
  {
    month: 5,
    src: "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?w=1200&q=80&auto=format&fit=crop",
    alt: "Sun shining through clouds in the sky",
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
    src: "https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=1200&q=80&auto=format&fit=crop",
    alt: "A plane flying in a cloudy sky",
    credit: "Photo by Unsplash",
  },
  {
    month: 9,
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80&auto=format&fit=crop",
    alt: "Misty forest with autumn trees and evergreens",
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
    src: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1200&q=80&auto=format&fit=crop",
    alt: "Snow-covered mountain under blue sky during daytime",
    credit: "Photo by Unsplash",
  },
];

/**
 * Get the seasonal hero image config for a given month (1–12).
 * Falls back to January if month is out of range.
 */
export function getSeasonalImage(month: number): SeasonalImage {
  return (
    SEASONAL_IMAGES.find((img) => img.month === month) ?? SEASONAL_IMAGES[0]
  );
}

/**
 * Get the seasonal image src URL for a given Date object.
 */
export function getSeasonalImageForDate(date: Date): SeasonalImage {
  return getSeasonalImage(date.getMonth() + 1);
}
