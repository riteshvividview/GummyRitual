/**
 * "Our Gummies" (section 02) copy, kept separate from the component tree so
 * it maps onto Shopify section settings / metafields later.
 */

export interface HeadlineLine {
  text: string;
  /** Words sharing this key get the shared gradient-accent treatment
   * (see OurGummies.module.css .accent). Plain lines omit it. */
  accent?: boolean;
}

export interface IconBenefit {
  label: string;
  description: string;
  /** Keys into the iconMap in OurGummies.tsx (lucide-react — no
   * Font Awesome dependency in this project; lucide is the icon set
   * already used throughout Header/Hero). */
  icon: "shieldPlus" | "trendingUp" | "zap" | "heart";
  tint: "pink" | "orange" | "blue" | "green";
}

export interface TrustPoint {
  label: string;
  description: string;
  /** Keys into the trustImageMap in OurGummies.tsx (client-supplied
   * illustrations in src/assets/homepage/02-our-gummies/images/). */
  image: "leaf" | "strawberry" | "bear" | "sun";
}

export const ourGummies = {
  eyebrow: "OUR GUMMIES",
  headline: {
    lines: [
      { text: "Nutrition" },
      { text: "Made for" },
      { text: "Growing", accent: true },
    ] satisfies HeadlineLine[],
    /** Trailing word on the same visual line as "Growing" but never
     * accented — kept separate so the component can lay it out inline
     * without folding accent logic into a per-word array. */
    trailingWord: "Kids",
  },
  description:
    "Delicious, science-backed gummies crafted with natural ingredients to support your child's everyday growth and well-being.",
  benefits: [
    {
      label: "Immunity",
      description: "Stronger little bodies",
      icon: "shieldPlus",
      tint: "pink",
    },
    {
      label: "Growth",
      description: "Support development",
      icon: "trendingUp",
      tint: "orange",
    },
    {
      label: "Energy",
      description: "Active every day",
      icon: "zap",
      tint: "blue",
    },
    {
      label: "Overall Health",
      description: "A healthier, happier tomorrow",
      icon: "heart",
      tint: "green",
    },
  ] satisfies IconBenefit[],
  trustPoints: [
    {
      label: "Natural Ingredients",
      description: "Made with nature's goodness your kids will love.",
      image: "leaf",
    },
    {
      label: "Great Taste",
      description: "Delicious flavours that make healthy habits easy.",
      image: "strawberry",
    },
    {
      label: "Science-Backed",
      description: "Thoughtfully formulated for real benefits.",
      image: "bear",
    },
    {
      label: "Happier Tomorrows",
      description: "Every gummy supports a brighter, healthier future.",
      image: "sun",
    },
  ] satisfies TrustPoint[],
};
