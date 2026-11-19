/**
 * Product content lives here, separate from UI/animation code, so it maps
 * cleanly onto Shopify product/metafield data later instead of being
 * hardcoded inside components.
 */

export type Experience = "kids" | "adults";

export interface Product {
  id: string;
  experience: Experience;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  discountLabel?: string;
  rating?: number;
  reviewCount?: number;
  /** Filename (not a path) of the transparent product PNG/WebP — resolved
   * via FeaturedCollection/productImages.ts's glob import. Falls back to a
   * tinted placeholder (see ProductCard.tsx) until a matching file exists
   * in src/assets/homepage/01a-featured-collection/images/. */
  image?: string;
  /** Accent used for the discount badge / placeholder fallback — one of
   * the existing --kids-accent-* pairs in variables.css, matching each
   * product's packaging color. */
  tint?: "blue" | "orange" | "green" | "pink";
}

/* Kids range: two products. Images are interim cutouts of the client's
 * pack mockups (Kid-products/) until the styled scene renders arrive —
 * see kids-visual-prompts.html. */
export const products: Product[] = [
  {
    id: "kids-multivitamin",
    experience: "kids",
    name: "Kids Multivitamin Gummies",
    tagline: "Immunity • Growth • Energy • Overall Health",
    price: 799,
    originalPrice: 999,
    discountLabel: "20% OFF",
    rating: 4.9,
    reviewCount: 521,
    image: "featured-multivitamin.png",
    tint: "orange",
  },
  {
    id: "kids-calcium",
    experience: "kids",
    name: "Kids Calcium Gummies",
    tagline: "Bone Health • Teeth Support • Muscle Function",
    price: 849,
    originalPrice: 999,
    discountLabel: "15% OFF",
    rating: 4.8,
    reviewCount: 320,
    image: "featured-calcium.png",
    tint: "pink",
  },
];
