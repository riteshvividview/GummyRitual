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

export const products: Product[] = [
  {
    id: "kids-calcium",
    experience: "kids",
    name: "Kids Calcium Gummies",
    tagline: "Strong Bones • Bright Futures",
    price: 849,
    originalPrice: 999,
    discountLabel: "15% OFF",
    rating: 4.8,
    reviewCount: 320,
    image: "Kids Calcium Gummy Pouch Mockup.png",
    tint: "blue",
  },
  {
    id: "kids-multivitamin",
    experience: "kids",
    name: "Kids Multivitamin Gummies",
    tagline: "Daily Nutritional Support",
    price: 799,
    originalPrice: 999,
    discountLabel: "20% OFF",
    rating: 4.9,
    reviewCount: 521,
    image: "Kids Multivitamin Gummy Pouch with Oranges.png",
    tint: "orange",
  },
  {
    id: "kids-focus",
    experience: "kids",
    name: "Kids Focus Gummies",
    tagline: "Supports Learning • Memory • Concentration",
    price: 849,
    originalPrice: 999,
    discountLabel: "15% OFF",
    rating: 4.7,
    reviewCount: 310,
    image: "Kids Focus Gummy Pouch with Apples.png",
    tint: "green",
  },
  {
    id: "kids-iron",
    experience: "kids",
    name: "Kids Iron Gummies",
    tagline: "Supports Healthy Blood • Energy • Immunity",
    price: 899,
    originalPrice: 999,
    discountLabel: "10% OFF",
    rating: 4.6,
    reviewCount: 287,
    image: "Kids Iron Gummy Supplement Pouch.png",
    tint: "pink",
  },
];
