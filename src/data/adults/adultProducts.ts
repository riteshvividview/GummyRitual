/**
 * Adults product catalogue — the single source of truth every Adults
 * section reads from. Shaped like a Shopify product + metafields so it
 * can be swapped for Storefront data later without touching components.
 */

export type AdultProductId = "essentials" | "skin-hair" | "gut" | "womens";

export interface AdultProduct {
  id: AdultProductId;
  name: string;
  /** Short title used on the dial / index ("Multivitamin", "Gut Health"). */
  title: string;
  flavour: string;
  /** The three on-pack benefit words. */
  benefits: [string, string, string];
  keyIngredients: string[];
  /** One-line editorial description. */
  description: string;
  count: string;
  price: string;
  /** Packaging tint + a deeper tone for text accents on light grounds. */
  tint: string;
  tintDeep: string;
  /** A pale wash of the tint for full-section backgrounds. */
  wash: string;
}

export const adultProducts: Record<AdultProductId, AdultProduct> = {
  essentials: {
    id: "essentials",
    name: "Super Essentials Gummies",
    title: "Super Essentials",
    flavour: "Mixed Fruit",
    benefits: ["Daily Nutrition", "6 Fruits & Botanicals", "Whole Body Wellbeing"],
    keyIngredients: ["Vitamins A, C, D, E, K", "B Complex", "Zinc", "Copper", "Iodine", "Selenium", "Chromium"],
    description: "Every essential vitamin and mineral, with six fruits and botanicals — one quiet foundation.",
    count: "30 gummies",
    price: "₹1,199",
    tint: "#2f6b66",
    tintDeep: "#1d4a46",
    wash: "#dfe9e6",
  },
  "skin-hair": {
    id: "skin-hair",
    name: "Skin & Hair Gummies",
    title: "Skin & Hair",
    flavour: "Strawberry",
    benefits: ["Beauty Begins Within", "Hydration", "Glow"],
    keyIngredients: ["Liposomal Glutathione", "Hyaluronic Acid", "Vitamin C", "Essential Vitamins & Nutrients"],
    description: "Glutathione, hyaluronic acid and vitamin C — beauty that begins within.",
    count: "30 gummies",
    price: "₹1,399",
    tint: "#d9667f",
    tintDeep: "#9a3a53",
    wash: "#f6ead2",
  },
  gut: {
    id: "gut",
    name: "Gut Health Gummies",
    title: "Gut Health",
    flavour: "Pineapple",
    benefits: ["Balanced Gut", "Better Digestion", "Overall Wellness"],
    keyIngredients: ["Prebiotic + Probiotic Blend", "Gut Microbiome Support", "Immune System Support"],
    description: "A prebiotic and probiotic blend for a balanced gut, better digestion and overall wellness.",
    count: "30 gummies",
    price: "₹1,299",
    tint: "#9b8fe0",
    tintDeep: "#5b4fa0",
    wash: "#e7e5fa",
  },
  womens: {
    id: "womens",
    name: "Women's Daily Ritual Gummies",
    title: "Women's Daily Ritual",
    flavour: "Pineapple",
    benefits: ["Healthy pH", "Urinary Tract Health", "Microflora Balance"],
    keyIngredients: ["Cranberry Extract", "Prebiotics", "Probiotics"],
    description: "Daily nourishment for her health and vitality — cranberry, prebiotics and probiotics.",
    count: "30 gummies",
    price: "₹1,299",
    tint: "#e07a9b",
    tintDeep: "#a03f63",
    wash: "#f7e1e8",
  },
};

/** Display order across the collection. */
export const adultProductOrder: AdultProductId[] = ["essentials", "skin-hair", "gut", "womens"];
