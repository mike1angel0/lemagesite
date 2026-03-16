/**
 * Centralized placeholder image paths.
 * When real content images are missing, these are used as fallbacks.
 * Update these paths to swap all placeholders at once.
 */

/**
 * Tiny 4x3 dark blur placeholder for Next.js Image blurDataURL.
 * Matches the site's dark background color.
 */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSIzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMiIGZpbGw9IiMxMDE4MjgiLz48L3N2Zz4=";

export const PLACEHOLDER = {
  /** Generic fallback for any content type */
  generic: "/images/placeholder.svg",
  /** Poetry and poems */
  poem: "/images/placeholder.svg",
  /** Photography */
  photo: "/images/placeholder.svg",
  /** Book covers */
  book: "/images/placeholder.svg",
  /** Essay thumbnails */
  essay: "/images/placeholder.svg",
  /** Music album art */
  album: "/images/placeholder.svg",
  /** Product images */
  product: "/images/placeholder.svg",
  /** Event hero images */
  event: "/images/placeholder.svg",
  /** Portrait / about */
  portrait: "/images/placeholder.svg",
} as const;
