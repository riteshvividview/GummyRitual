/**
 * "Made for Little Rituals" (section 05) copy, kept separate from the
 * component tree so it maps onto Shopify section settings / metafields
 * later.
 */

export interface MomentCard {
  id: string;
  icon: "sun" | "moon";
  title: string;
  description: string;
  /** "light" sits over the bright morning side of the photo, "dark" sits
   * over the night sky side — the glass card tint/text color flips to
   * stay legible against whichever half it's on. */
  theme: "light" | "dark";
}

export interface RoutineStep {
  id: string;
  icon: "sun" | "utensils" | "moon";
  label: string;
  description: string;
  /** Only "Wake Up" is lit up in the reference — the rest read as
   * upcoming/muted steps in the same day. */
  active: boolean;
}

export const dailyRoutineContent = {
  eyebrow: "MADE FOR LITTLE RITUALS",
  headline: ["Daily", "Routine"],
  description:
    "A simple, delicious ritual to support their everyday growth, from morning energy to peaceful nights.",
  moments: [
    {
      id: "morning",
      icon: "sun",
      title: "Morning Boost",
      description: "Fuel their day with essential nutrition.",
      theme: "light",
    },
    {
      id: "evening",
      icon: "moon",
      title: "Evening Support",
      description: "Help them wind down with calm and care.",
      theme: "dark",
    },
  ] satisfies MomentCard[],
  steps: [
    {
      id: "wake-up",
      icon: "sun",
      label: "Wake Up",
      description: "A tasty start to a brighter day.",
      active: true,
    },
    {
      id: "breakfast",
      icon: "utensils",
      label: "With Breakfast",
      description: "Easily fits into their morning routine.",
      active: false,
    },
    {
      id: "playtime",
      icon: "sun",
      label: "After Playtime",
      description: "Replenish and stay balanced.",
      active: false,
    },
    {
      id: "before-bed",
      icon: "moon",
      label: "Before Bed",
      description: "Supports calm, restful nights.",
      active: false,
    },
  ] satisfies RoutineStep[],
};
