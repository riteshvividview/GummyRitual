/**
 * /benefits page copy — one entry per benefit from the homepage's "Why
 * Gummy Rituals?" pills (same labels/icons), expanded with the nutrients
 * behind it and which products deliver it. Kept as data so it maps onto a
 * Shopify page template + metaobjects later.
 *
 * Nutrient copy is prototype placeholder — confirm against final labels.
 */
import type { BenefitPill } from "./whyGummyRitualsContent";

export interface BenefitDetail {
  id: string;
  label: string;
  icon: BenefitPill["icon"];
  tint: string;
  wash: string;
  headline: string;
  body: string;
  nutrients: { name: string; note: string }[];
  /** catalog.ts product ids. */
  products: string[];
  /** Image key resolved in BenefitsPage (see benefitImages there). */
  image: "immunity" | "growth" | "bones" | "energy" | "overall";
}

export const benefitsIntro = {
  eyebrow: "Why Gummy Rituals?",
  title: ["Small gummies.", "Big benefits."],
  lede:
    "Every gummy is built around a few things growing bodies genuinely need — chosen with care, dosed for kids, and made to taste like fruit, not medicine.",
};

export const benefitDetails: BenefitDetail[] = [
  {
    id: "immunity",
    label: "Immunity",
    icon: "shieldPlus",
    tint: "#f4863a",
    wash: "#fde9d6",
    headline: "Stronger defences for active little lives.",
    body:
      "Playgrounds, classrooms, birthday parties — kids meet the world head-on. Vitamin C and zinc help support the body's natural defences, so the everyday sniffles don't slow the fun.",
    nutrients: [
      { name: "Vitamin C", note: "Supports natural defences" },
      { name: "Zinc", note: "Helps the immune system work normally" },
      { name: "Vitamin D3", note: "Plays a role in immune function" },
    ],
    products: ["kids-multivitamin"],
    image: "immunity",
  },
  {
    id: "growth",
    label: "Growth",
    icon: "trendingUp",
    tint: "#5aa7e0",
    wash: "#e3f0fb",
    headline: "Essential nutrients for healthy development.",
    body:
      "Growing up is busy work. A balanced spread of vitamins and minerals helps fill the gaps that picky eating leaves behind — one gummy, every day, quietly doing its part.",
    nutrients: [
      { name: "Vitamin A", note: "For normal growth and vision" },
      { name: "B-Complex", note: "Helps turn food into energy" },
      { name: "Vitamin E", note: "Protects growing cells" },
    ],
    products: ["kids-multivitamin"],
    image: "growth",
  },
  {
    id: "bones-teeth",
    label: "Bones & Teeth",
    icon: "bone",
    tint: "#f4739a",
    wash: "#fde3ea",
    headline: "Calcium for strong bones and healthy smiles.",
    body:
      "Childhood is when bones build most of their strength. Calcium is the building block — vitamin D3 helps the body absorb it, and K2 helps guide it to where it belongs.",
    nutrients: [
      { name: "Calcium", note: "The building block for bones & teeth" },
      { name: "Vitamin D3", note: "Helps absorb calcium" },
      { name: "Vitamin K2", note: "Guides calcium to bone" },
    ],
    products: ["kids-calcium"],
    image: "bones",
  },
  {
    id: "energy",
    label: "Energy",
    icon: "zap",
    tint: "#e5a21f",
    wash: "#fdf0cf",
    headline: "Helps keep them active throughout the day.",
    body:
      "B vitamins help the body release energy from food, and magnesium supports normal muscle function — for kids who'd rather run than walk, from breakfast to bedtime.",
    nutrients: [
      { name: "B-Complex", note: "Releases energy from food" },
      { name: "Magnesium", note: "Normal muscle function" },
      { name: "Iron-free formula", note: "Gentle on little tummies" },
    ],
    products: ["kids-multivitamin", "kids-calcium"],
    image: "energy",
  },
  {
    id: "overall-health",
    label: "Overall Health",
    icon: "heart",
    tint: "#7cc142",
    wash: "#e8f4dc",
    headline: "A stronger, happier tomorrow.",
    body:
      "Good health isn't one big thing — it's lots of small ones, every day. Real fruit, zero sugar and nothing artificial make the daily ritual something kids look forward to.",
    nutrients: [
      { name: "Real fruit", note: "Naturally fruity flavour" },
      { name: "Zero sugar", note: "Kind to growing smiles" },
      { name: "Nothing artificial", note: "No artificial colours or flavours" },
    ],
    products: ["kids-multivitamin", "kids-calcium"],
    image: "overall",
  },
];

/** Homepage pill label → benefits page anchor. */
const aliases: Record<string, string> = { "bone health": "bones-teeth" };
export const benefitAnchor = (label: string) =>
  aliases[label.toLowerCase()] ??
  benefitDetails.find((b) => b.label.toLowerCase() === label.toLowerCase())?.id ??
  "";
