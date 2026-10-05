/**
 * Kids hero copy, kept separate from the component tree so it maps onto
 * Shopify section settings / metafields later.
 */

export type HeadlineAccent = false | "orange" | "red";

export interface HeadlineLine {
  text: string;
  accent: HeadlineAccent;
}

export const kidsHero = {
  eyebrow: "SMALL GUMMIES. BIGGER FUTURES.",
  headline: {
    lines: [
      { text: "Little", accent: false },
      { text: "Gummies", accent: false },
      { text: "for Big", accent: "orange" },
      { text: "Possibilities", accent: "red" },
    ] satisfies HeadlineLine[],
  },
  description:
    "Delicious, nutrition-packed gummies to support your child's growth, immunity, and focus.",
  /** Product name shown per active hero frame sequence, keyed by the same
   * bear identifier used throughout (see benefits below). */
  productTitles: {
    orange: "Kids Multivitamin",
    pink: "Kids Iron",
    green: "Kids Focus",
    blue: "Kids Calcium",
  },
  productCta: {
    addToCart: "Add to Cart",
    viewProduct: "View Product",
  },
  sideEyebrow: "NATURAL INGREDIENTS FOR HAPPIER KIDS",
  /** The 4 on-pack benefits per product, shown in the side rail for
   * whichever bear/sequence is currently active — keyed the same way as
   * productTitles. */
  productBenefits: {
    orange: ["Immunity", "Growth", "Energy", "Overall Health"],
    pink: ["Iron Absorption", "Energy", "Immunity", "Red Blood Cells"],
    green: ["Brain", "Focus", "Memory", "Mental Attention"],
    blue: ["Bone Health", "Teeth Support", "Growth", "Muscle Function"],
  },
  benefits: [
    { label: "Immune Support", bear: "orange" as const },
    { label: "Healthy Growth", bear: "pink" as const },
    { label: "Better Focus", bear: "green" as const },
    { label: "Active Lifestyle", bear: "blue" as const },
  ],
};
