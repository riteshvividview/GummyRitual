/**
 * Unified shop catalogue — every product from both experiences in one
 * shape, for the /shop listing and /shop/:id buy pages. Built from the
 * existing per-experience sources (products.ts, adults/adultProducts.ts)
 * so name/price/tint stay single-sourced; this file only adds the
 * buy-page detail (ingredients, usage, FAQs). Maps to Shopify product +
 * metafields: id → handle, packs → variants, subscribe → selling plan.
 *
 * Kids ingredient / usage copy is prototype placeholder — confirm against
 * the final label before launch.
 */
import { products as kidsProducts } from "./products";
import { adultProducts, adultProductOrder, type AdultProductId } from "./adults/adultProducts";

export type ShopRange = "kids" | "adults";

export interface CatalogProduct {
  id: string;
  range: ShopRange;
  name: string;
  /** Short display title ("Kids Calcium", "Gut Health"). */
  title: string;
  flavour: string;
  benefits: string[];
  description: string;
  /** Longer buy-page paragraph. */
  story: string;
  keyIngredients: { name: string; note: string }[];
  howTo: string[];
  goodToKnow: string[];
  count: string;
  ageNote?: string;
  /** Single-pouch price (₹). */
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  /** Pack colour, a deeper tone for text, a pale wash for stages. */
  tint: string;
  tintDeep: string;
  wash: string;
}

/** Pack variants — multi-pouch packs carry a saving. */
export const PACKS = [
  { size: 1, label: "1 Pouch", note: "30-day supply", save: 0 },
  { size: 2, label: "2 Pouches", note: "60-day supply", save: 0.1 },
  { size: 3, label: "3 Pouches", note: "90-day supply", save: 0.15 },
] as const;

/** Subscribe & save, on top of the pack saving. */
export const SUBSCRIBE_SAVE = 0.1;

export function packPrice(p: CatalogProduct, size: number, subscribe: boolean) {
  const pack = PACKS.find((k) => k.size === size) ?? PACKS[0];
  const base = p.price * pack.size * (1 - pack.save);
  return Math.round(subscribe ? base * (1 - SUBSCRIBE_SAVE) : base);
}

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const kidsDetail: Record<string, Omit<CatalogProduct, "id" | "range" | "name" | "price" | "compareAt" | "rating" | "reviewCount">> = {
  "kids-multivitamin": {
    title: "Kids Multivitamin",
    flavour: "Mixed Fruit",
    benefits: ["Immunity", "Growth", "Energy", "Overall Health"],
    description: "Daily nutritional support in one bright, fruity gummy kids actually look forward to.",
    story:
      "A complete daily multivitamin for growing bodies — essential vitamins and minerals for immunity, growth and steady energy, made with real fruit and no artificial colours or flavours. One chewy gummy, every morning.",
    keyIngredients: [
      { name: "Vitamin C", note: "Supports natural defences" },
      { name: "Vitamin D3", note: "For growing bones" },
      { name: "Zinc", note: "Everyday immunity" },
      { name: "B-Complex", note: "Energy for busy days" },
      { name: "Vitamins A & E", note: "Eyes, skin & cells" },
      { name: "Real fruit", note: "Naturally fruity taste" },
    ],
    howTo: ["One gummy a day", "Best with breakfast", "Chew well before swallowing"],
    goodToKnow: [
      "Suitable for ages 3+",
      "No artificial colours or flavours",
      "Zero sugar",
      "Keep out of reach of children — not a sweet",
    ],
    count: "30 gummies",
    ageNote: "Ages 3+",
    tint: "#f4863a",
    tintDeep: "#a8500f",
    wash: "#fde9d6",
  },
  "kids-calcium": {
    title: "Kids Calcium",
    flavour: "Strawberry",
    benefits: ["Bone Health", "Teeth Support", "Muscle Function"],
    description: "Calcium with vitamin D3 for strong bones and healthy smiles — in a strawberry gummy.",
    story:
      "Growing bones need calcium, and calcium needs vitamin D to do its job. This strawberry gummy pairs the two for strong bones, healthy teeth and muscle function — a gentle daily habit with no artificial colours or flavours.",
    keyIngredients: [
      { name: "Calcium", note: "Building block for bones" },
      { name: "Vitamin D3", note: "Helps absorb calcium" },
      { name: "Vitamin K2", note: "Guides calcium to bone" },
      { name: "Magnesium", note: "Muscle function" },
      { name: "Real strawberry", note: "Naturally fruity taste" },
    ],
    howTo: ["One gummy a day", "Any time — evening works well", "Chew well before swallowing"],
    goodToKnow: [
      "Suitable for ages 3+",
      "No artificial colours or flavours",
      "Zero sugar",
      "Keep out of reach of children — not a sweet",
    ],
    count: "30 gummies",
    ageNote: "Ages 3+",
    tint: "#f4739a",
    tintDeep: "#a3184a",
    wash: "#fde3ea",
  },
};

const adultDetail: Record<AdultProductId, { story: string; howTo: string[]; goodToKnow: string[]; rating: number; reviewCount: number }> = {
  essentials: {
    story:
      "A single, considered foundation: the full spread of essential vitamins and minerals, rounded out with six fruits and botanicals. For days that ask a lot — and the quiet habit that holds them together.",
    howTo: ["Two gummies a day", "With your morning ritual", "Consistency over quantity"],
    goodToKnow: ["For adults 18+", "No artificial colours", "Gelatin-free, pectin based", "Consult a doctor if pregnant or on medication"],
    rating: 4.8,
    reviewCount: 412,
  },
  "skin-hair": {
    story:
      "Beauty that begins within. Liposomal glutathione, hyaluronic acid and vitamin C work from the inside out — for hydration, a softer glow, and hair that feels looked after.",
    howTo: ["Two gummies a day", "Morning or evening", "Give it 8–12 weeks"],
    goodToKnow: ["For adults 18+", "No artificial colours", "Gelatin-free, pectin based", "Consult a doctor if pregnant or on medication"],
    rating: 4.9,
    reviewCount: 538,
  },
  gut: {
    story:
      "A prebiotic and probiotic blend that tends the gut quietly — for balanced digestion, a calmer stomach and the immune support that starts there.",
    howTo: ["Two gummies a day", "Before your first meal", "Pair with plenty of water"],
    goodToKnow: ["For adults 18+", "No artificial colours", "Gelatin-free, pectin based", "Consult a doctor if pregnant or on medication"],
    rating: 4.7,
    reviewCount: 296,
  },
  womens: {
    story:
      "Made for her daily balance. Cranberry extract with prebiotics and probiotics supports a healthy pH, urinary tract health and the microflora that keeps everything in quiet equilibrium.",
    howTo: ["Two gummies a day", "Same time each day", "Ritual, not rescue"],
    goodToKnow: ["For women 18+", "No artificial colours", "Gelatin-free, pectin based", "Consult a doctor if pregnant or on medication"],
    rating: 4.8,
    reviewCount: 344,
  },
};

const rupees = (s: string) => Number(s.replace(/[^\d]/g, ""));

export const catalog: CatalogProduct[] = [
  ...kidsProducts.map((k) => ({
    id: k.id,
    range: "kids" as const,
    name: k.name,
    price: k.price,
    compareAt: k.originalPrice,
    rating: k.rating ?? 4.8,
    reviewCount: k.reviewCount ?? 0,
    ...kidsDetail[k.id],
  })),
  ...adultProductOrder.map((id) => {
    const a = adultProducts[id];
    const d = adultDetail[id];
    return {
      id,
      range: "adults" as const,
      name: a.name,
      title: a.title,
      flavour: a.flavour,
      benefits: [...a.benefits],
      description: a.description,
      story: d.story,
      keyIngredients: a.keyIngredients.map((name) => ({ name, note: "" })),
      howTo: d.howTo,
      goodToKnow: d.goodToKnow,
      count: a.count,
      price: rupees(a.price),
      rating: d.rating,
      reviewCount: d.reviewCount,
      tint: a.tint,
      tintDeep: a.tintDeep,
      wash: a.wash,
    };
  }),
];

export const getProduct = (id: string) => catalog.find((p) => p.id === id);
