/**
 * "Why Gummy Rituals?" (section 03) copy, kept separate from the component
 * tree so it maps onto Shopify section settings / metafields later.
 */

export interface HeadlineLine {
  text: string;
  accent?: boolean;
}

export interface BenefitPill {
  label: string;
  description: string;
  /** Keys into the iconMap in WhyGummyRituals.tsx (lucide-react). */
  icon: "shieldPlus" | "trendingUp" | "brain" | "zap" | "heart";
  tint: "orange" | "blue" | "green" | "pink" | "neutral";
}

export const whyGummyRituals = {
  eyebrow: "WHY GUMMY RITUALS?",
  headline: {
    lines: [
      { text: "Small" },
      { text: "Gummies." },
      { text: "Big", accent: true },
      { text: "Benefits.", accent: true },
    ] satisfies HeadlineLine[],
  },
  description:
    "Thoughtfully crafted with essential nutrients to support your child's growth, immunity, focus and everyday well-being.",
  cta: "Discover the Benefits",
  benefits: [
    {
      label: "Immunity",
      description: "Stronger defences for active little lives.",
      icon: "shieldPlus",
      tint: "orange",
    },
    {
      label: "Growth",
      description: "Essential nutrients for healthy development.",
      icon: "trendingUp",
      tint: "blue",
    },
    {
      label: "Focus",
      description: "Supports learning, memory and concentration.",
      icon: "brain",
      tint: "green",
    },
    {
      label: "Energy",
      description: "Helps keep them active throughout the day.",
      icon: "zap",
      tint: "pink",
    },
    {
      label: "Overall Health",
      description: "A stronger, happier tomorrow.",
      icon: "heart",
      tint: "neutral",
    },
  ] satisfies BenefitPill[],
};
