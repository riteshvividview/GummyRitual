/**
 * Adults product catalogue — the single source of truth every Adults
 * section reads from. Shaped like a Shopify product + metafields so it
 * can be swapped for Storefront data later without touching components.
 */

export type AdultProductId = "multivitamin" | "skin" | "hair" | "gut" | "sleep";

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
  multivitamin: {
    id: "multivitamin",
    name: "Multivitamin Gummies",
    title: "Multivitamin",
    flavour: "Mixed Fruit",
    benefits: ["Energy", "Immunity", "Overall Wellness"],
    keyIngredients: ["Vitamins A, B, C, D, E, K", "Zinc", "Iodine", "Selenium"],
    description: "A complete daily foundation — thirteen essentials in one quiet ritual.",
    count: "30 gummies",
    price: "₹1,199",
    tint: "#cdb08f",
    tintDeep: "#8a6a47",
    wash: "#efe4d4",
  },
  skin: {
    id: "skin",
    name: "Skin Gummies",
    title: "Skin",
    flavour: "Strawberry",
    benefits: ["Glow", "Hydrate", "Protect"],
    keyIngredients: ["Collagen", "Hyaluronic Acid", "Vitamin C", "Zinc"],
    description: "Collagen and hyaluronic acid for skin that looks rested from within.",
    count: "30 gummies",
    price: "₹1,399",
    tint: "#c9918a",
    tintDeep: "#93514a",
    wash: "#f1dfda",
  },
  hair: {
    id: "hair",
    name: "Hair Gummies",
    title: "Hair",
    flavour: "Blueberry",
    benefits: ["Stronger", "Thicker", "Healthier"],
    keyIngredients: ["Biotin", "Zinc", "Folic Acid", "Vitamin D3", "B Vitamins"],
    description: "Biotin and zinc to support stronger, fuller-looking hair over time.",
    count: "30 gummies",
    price: "₹1,299",
    tint: "#8f9d7f",
    tintDeep: "#56654a",
    wash: "#e3e6da",
  },
  gut: {
    id: "gut",
    name: "Gut Health Gummies",
    title: "Gut Health",
    flavour: "Litchi",
    benefits: ["Digestion", "Balance", "A Happier Gut"],
    keyIngredients: ["Probiotics", "Prebiotic Fibre", "Vitamin B6", "Zinc"],
    description: "Live cultures and gentle fibre for a calmer, more balanced gut.",
    count: "30 gummies",
    price: "₹1,299",
    tint: "#7fa3a4",
    tintDeep: "#46696a",
    wash: "#dde8e6",
  },
  sleep: {
    id: "sleep",
    name: "Sleep Gummies",
    title: "Sleep",
    flavour: "Mango",
    benefits: ["Relax", "Unwind", "Better Sleep"],
    keyIngredients: ["Melatonin", "Magnesium", "L-Theanine", "Chamomile"],
    description: "Melatonin and magnesium to help the day let go of you.",
    count: "30 gummies",
    price: "₹1,299",
    tint: "#9a8bb5",
    tintDeep: "#5d4f78",
    wash: "#e6e0ee",
  },
};

/** Display order across the collection (morning → night). */
export const adultProductOrder: AdultProductId[] = [
  "multivitamin",
  "skin",
  "hair",
  "gut",
  "sleep",
];
