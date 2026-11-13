/**
 * Adults homepage copy for sections 01–04, kept apart from the component
 * tree so each block maps onto Shopify section settings / blocks later.
 */
import type { AdultProductId } from "./adultProducts";

/* ------------------------------------------------------------------ */
/* 01 · Hero — The Light Dial                                          */
/* ------------------------------------------------------------------ */

export interface HeroPlate {
  product: AdultProductId;
  /** Hour of day the plate's light represents (drives the dial). */
  hour: number;
  moment: string;
  /** Wall colour sampled from the plate — page background on mobile. */
  wall: string;
  /** Ink colour that keeps the headline legible over this plate. */
  ink: string;
  inkMuted: string;
  /** Headline accent (second line) for this plate. */
  accent: string;
  /** Shader wall light behind the headline: > 0 lifts (dark text), < 0 deepens (light text). */
  wallLight: number;
  /** Small labels (eyebrow, moment) and the CTA button. */
  label: string;
  button: string;
  buttonText: string;
}

export const adultHeroContent = {
  eyebrow: "Daily Wellbeing Rituals",
  headline: ["Better habits.", "A healthier you."],
  description:
    "Plant-based gummies for every hour of your day. Four rituals, one quiet routine.",
  primaryCta: "Shop the Ritual",
  scrollHint: "Scroll through the day",
  plates: [
    { product: "essentials", hour: 7, moment: "Morning", wall: "#294740", ink: "#f3f6f1", inkMuted: "#dfe9e4", accent: "#8fc2bd", wallLight: -0.2, label: "#a9d6cd", button: "#e8f4f1", buttonText: "#1d3b37" },
    { product: "skin-hair", hour: 11, moment: "Late morning", wall: "#eab26f", ink: "#ffffff", inkMuted: "#fffaf2", accent: "#ffffff", wallLight: -0.32, label: "#ffffff", button: "#ffffff", buttonText: "#3a1f24" },
    { product: "gut", hour: 15, moment: "Afternoon", wall: "#b1aed7", ink: "#fbfaff", inkMuted: "#efedff", accent: "#e9d5ff", wallLight: -0.3, label: "#e8e4ff", button: "#f5f3ff", buttonText: "#2b2350" },
    { product: "womens", hour: 20, moment: "Evening", wall: "#c57b7b", ink: "#fff4f2", inkMuted: "#fbe3e0", accent: "#ffe6c4", wallLight: -0.24, label: "#f8d3d6", button: "#fff6f8", buttonText: "#2a1520" },
  ] satisfies HeroPlate[],
};

/* ------------------------------------------------------------------ */
/* 02 · The Edit — Collection                                          */
/* ------------------------------------------------------------------ */

export const adultCollectionContent = {
  eyebrow: "The Collection",
  headline: ["Four rituals.", "One quiet routine."],
  description:
    "Each formula is made for a moment of your day — plant based, no added sugar, nothing artificial.",
  viewLabel: "View ritual",
  addLabel: "Add to bag",
  drawer: {
    benefitsLabel: "What it does",
    ingredientsLabel: "Key ingredients",
    flavourLabel: "Flavour",
    sizeLabel: "Size",
    ritualLabel: "Your ritual",
    ritual: "Chew one gummy a day, with or without food.",
  },
};

/* ------------------------------------------------------------------ */
/* 03 · What your body asks for                                        */
/* ------------------------------------------------------------------ */

export type NeedImage = "glow" | "strength" | "energy" | "rest" | "balance";

export interface Need {
  id: NeedImage;
  word: string;
  product: AdultProductId;
  line: string;
  ingredients: string;
}

export const adultNeedsContent = {
  eyebrow: "Find your ritual",
  headline: "What does your body ask for?",
  hint: "Choose one",
  needs: [
    { id: "glow", word: "Glow", product: "skin-hair", line: "Beauty that begins within — skin that looks rested and bright.", ingredients: "Liposomal Glutathione · Hyaluronic Acid · Vitamin C" },
    { id: "strength", word: "Strength", product: "skin-hair", line: "Fuller, stronger-looking hair, one day at a time.", ingredients: "Essential Vitamins · Nutrients · Vitamin C" },
    { id: "energy", word: "Energy", product: "essentials", line: "A steady foundation for long, full days.", ingredients: "Vitamins A C D E K · B Complex · Minerals" },
    { id: "rest", word: "Care", product: "womens", line: "Daily nourishment for her health and vitality.", ingredients: "Cranberry Extract · Prebiotics · Probiotics" },
    { id: "balance", word: "Balance", product: "gut", line: "A balanced gut, better digestion — and everything that follows.", ingredients: "Prebiotic + Probiotic Blend" },
  ] satisfies Need[],
};

/* ------------------------------------------------------------------ */
/* 04 · Inside every gummy                                             */
/* ------------------------------------------------------------------ */

export type IngredientKey =
  | "collagen"
  | "hyaluronic"
  | "vitamin-c"
  | "zinc"
  | "biotin"
  | "magnesium"
  | "melatonin"
  | "probiotic"
  | "fiber";

export interface AdultIngredient {
  id: IngredientKey;
  name: string;
  product: AdultProductId;
  /** Accent sampled from the scene backdrop. */
  tone: string;
  /** Whether the scene backdrop is dark enough to need light text. */
  dark?: boolean;
  /** Optional custom text colours (headline/body, secondary). */
  ink?: string;
  inkMuted?: string;
  /** Small labels ("In Hair", point titles). */
  label?: string;
  summary: string;
  stat: { value: string; label: string };
  points: { title: string; text: string }[];
}

export const adultIngredientsContent = {
  eyebrow: "Inside every gummy",
  headline: ["Nine actives.", "Nothing to hide."],
  description:
    "Every ingredient earns its place. Tap through what's inside each ritual.",
  ingredients: [
    {
      id: "collagen", name: "Collagen", product: "skin-hair", tone: "#b1625d", dark: true, ink: "#fffaf8", inkMuted: "#f8d2ca", label: "#f3b9ae",
      summary: "The protein that gives skin its structure and spring.",
      stat: { value: "2.5g", label: "hydrolysed collagen peptides per daily serving" },
      points: [
        { title: "Firmness", text: "Supports the skin's natural elasticity." },
        { title: "Hydration", text: "Works with hyaluronic acid to hold moisture." },
        { title: "Easily absorbed", text: "Hydrolysed into small, bioavailable peptides." },
      ],
    },
    {
      id: "hyaluronic", name: "Hyaluronic Acid", product: "skin-hair", tone: "#d99c98", dark: true, ink: "#fff7f5", inkMuted: "#feeeea", label: "#fbdcd5",
      summary: "A moisture magnet that holds up to 1,000× its weight in water.",
      stat: { value: "120mg", label: "hyaluronic acid in every serving" },
      points: [
        { title: "Plumpness", text: "Helps skin look smoother and fuller." },
        { title: "Barrier", text: "Supports a comfortable, hydrated skin barrier." },
        { title: "Gentle", text: "Naturally present in the body already." },
      ],
    },
    {
      id: "vitamin-c", name: "Vitamin C", product: "skin-hair", tone: "#d49a6f", dark: true, ink: "#fffaf3", inkMuted: "#fdf0e3", label: "#fadfc2",
      summary: "The everyday antioxidant behind immunity and collagen formation.",
      stat: { value: "100%", label: "of your daily vitamin C need" },
      points: [
        { title: "Immunity", text: "Contributes to normal immune function." },
        { title: "Collagen", text: "Needed for natural collagen formation." },
        { title: "Antioxidant", text: "Protects cells from oxidative stress." },
      ],
    },
    {
      id: "zinc", name: "Zinc", product: "essentials", tone: "#99967f", dark: true, ink: "#fbfaf4", inkMuted: "#f2f0e6", label: "#e9e6d4",
      summary: "A trace mineral quietly working in hair, skin and immunity.",
      stat: { value: "10mg", label: "zinc per serving" },
      points: [
        { title: "Hair", text: "Contributes to the maintenance of normal hair." },
        { title: "Skin & nails", text: "Supports normal skin and nails." },
        { title: "Immunity", text: "Plays a role in immune defence." },
      ],
    },
    {
      id: "biotin", name: "Biotin", product: "skin-hair", tone: "#a5a38a", dark: true, ink: "#fbfaf4", inkMuted: "#f3f2e8", label: "#e9ecd9",
      summary: "Vitamin B7 — the best-known nutrient for hair strength.",
      stat: { value: "5000µg", label: "biotin in every daily serving" },
      points: [
        { title: "Strength", text: "Supports the keratin structure of hair." },
        { title: "Energy", text: "Helps turn food into usable energy." },
        { title: "Nails", text: "Contributes to stronger-looking nails." },
      ],
    },
    {
      id: "magnesium", name: "Magnesium", product: "essentials", tone: "#c6a4b1", dark: true, ink: "#fdf8fa", inkMuted: "#f8ecf1", label: "#f1dae3",
      summary: "The calming mineral that helps muscles and mind unwind.",
      stat: { value: "100mg", label: "magnesium per serving" },
      points: [
        { title: "Relaxation", text: "Contributes to normal muscle function." },
        { title: "Nervous system", text: "Supports a calm nervous system." },
        { title: "Less tiredness", text: "Helps reduce tiredness and fatigue." },
      ],
    },
    {
      id: "melatonin", name: "Melatonin", product: "womens", tone: "#7f5b5d", dark: true, ink: "#fbf3ee", inkMuted: "#ecd7d2", label: "#e1b8b5",
      summary: "Your body's own night-time signal, gently topped up.",
      stat: { value: "1mg", label: "melatonin, taken before bed" },
      points: [
        { title: "Fall asleep", text: "Helps reduce the time it takes to fall asleep." },
        { title: "Non-habit forming", text: "A gentle, low dose for nightly use." },
        { title: "Jet lag", text: "Eases the effects of a shifted body clock." },
      ],
    },
    {
      id: "probiotic", name: "Probiotics", product: "gut", tone: "#85928e", dark: true, ink: "#f6fbfa", inkMuted: "#dceae7", label: "#c8e0dc",
      summary: "Live cultures that keep your gut's ecosystem in balance.",
      stat: { value: "1B", label: "CFU of live cultures per serving" },
      points: [
        { title: "Digestion", text: "Supports comfortable, regular digestion." },
        { title: "Balance", text: "Helps maintain healthy gut flora." },
        { title: "Shelf stable", text: "Spore-forming strains that survive the shelf." },
      ],
    },
    {
      id: "fiber", name: "Prebiotic Fibre", product: "gut", tone: "#6e7b76", dark: true, ink: "#f7faf5", inkMuted: "#e1e9e3", label: "#e6d3a6",
      summary: "Food for your good bacteria — gentle, plant-based fibre.",
      stat: { value: "3g", label: "prebiotic fibre per serving" },
      points: [
        { title: "Feeds", text: "Nourishes the beneficial bacteria already there." },
        { title: "Regularity", text: "Supports smooth, regular digestion." },
        { title: "Plant based", text: "From chicory root inulin." },
      ],
    },
  ] satisfies AdultIngredient[],
};

/* ------------------------------------------------------------------ */
/* 06 · Up close — taste & texture                                     */
/* ------------------------------------------------------------------ */

export interface TextureChapter {
  index: string;
  title: string;
  text: string;
  /** Scroll progress (0..1 across the pinned scrub) where it takes over. */
  at: number;
}

export const adultTextureContent = {
  eyebrow: "Taste & Texture",
  headline: "Up close.",
  intro: "Pull one apart. Here's what you'll find.",
  chapters: [
    { index: "01", title: "Soft to the touch", text: "A fine, matte dusting and a gentle give. Never sticky, never glassy.", at: 0.16 },
    { index: "02", title: "A slow, even stretch", text: "Set with plant pectin, not gelatine — it pulls, then lets go cleanly.", at: 0.46 },
    { index: "03", title: "Fruit all the way through", text: "The same real-fruit colour and flavour from the surface to the centre.", at: 0.74 },
  ] satisfies TextureChapter[],
  replay: "Watch again",
  flavours: {
    eyebrow: "Four rituals",
    headline: "One texture, every ritual.",
    hint: "Choose a flavour",
    /** Display order across the row, keyed to adultProducts. */
    order: ["skin-hair", "essentials", "gut", "womens"] as const,
    notes: {
      "skin-hair": "Bright, just-ripe strawberry.",
      essentials: "Orange, apple and peach together.",
      gut: "Sweet, golden pineapple.",
      womens: "Juicy, sun-ripe pineapple.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* 05 · A day, held lightly — daily routine                            */
/* ------------------------------------------------------------------ */

export type DayImage = "0700-vanity" | "1300-desk" | "2200-bedside";

export interface DayMoment {
  id: DayImage;
  hour: number;
  moment: string;
  products: AdultProductId[];
  line: string;
  /** Moment sits on the night end of the gradient — light text. */
  night?: boolean;
}

export const adultDayContent = {
  eyebrow: "Daily ritual",
  headline: ["A day,", "held lightly."],
  description:
    "Three small pauses, each with its own ritual. No pill organisers, no glasses of powder — just a gummy, where you already are.",
  moments: [
    {
      id: "0700-vanity",
      hour: 7,
      moment: "Morning",
      products: ["essentials", "skin-hair"],
      line: "With your first glass of water — your essentials and your glow, before the day asks anything of you.",
    },
    {
      id: "1300-desk",
      hour: 13,
      moment: "Midday",
      products: ["womens"],
      line: "At your desk, after lunch. A small daily ritual of care that keeps working long after you've moved on.",
    },
    {
      id: "2200-bedside",
      hour: 22,
      moment: "Night",
      products: ["gut"],
      line: "On the bedside table — balance for the gut, and a calm close to the day.",
      night: true,
    },
  ] satisfies DayMoment[],
};

/* ------------------------------------------------------------------ */
/* 07 · Formulated with care — science & quality                       */
/* ------------------------------------------------------------------ */

export type StandardIcon = "plant" | "sugar" | "colour" | "tested";

export interface Standard {
  index: string;
  icon: StandardIcon;
  title: string;
  text: string;
}

export interface ProofStat {
  /** Numeric part counts up; prefix/suffix stay static. */
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export const adultTrustContent = {
  eyebrow: "Science & quality",
  headline: ["Formulated", "with care."],
  description:
    "Every ritual starts in the lab, not the flavour house. Clinically studied forms of each active, dosed to be meaningful — then made into something you'll actually want to take.",
  standards: [
    { index: "01", icon: "plant", title: "Plant based", text: "Set with fruit pectin, never gelatine. Suitable for vegetarians and vegans." },
    { index: "02", icon: "sugar", title: "No added sugar", text: "Sweetened lightly with fruit and natural alternatives — not glucose syrup." },
    { index: "03", icon: "colour", title: "No artificial colours", text: "Every shade comes from fruit and vegetable concentrates." },
    { index: "04", icon: "tested", title: "Third-party tested", text: "Each batch is independently checked for potency, purity and heavy metals." },
  ] satisfies Standard[],
  proof: [
    { value: 0, suffix: "g", label: "added sugar per gummy" },
    { value: 100, suffix: "%", label: "plant-based formula" },
    { value: 3, suffix: "×", label: "independent tests per batch" },
    { value: 30, label: "days in every pouch" },
  ] as ProofStat[],
  caption: "Weighed, tested and logged — batch by batch.",
};

/* ------------------------------------------------------------------ */
/* 08 · The lineup — final CTA                                         */
/* ------------------------------------------------------------------ */

export interface LineupSpot {
  product: AdultProductId;
  /** Pouch centre in the lineup photograph, as % of its width. */
  x: number;
}

export const adultFinalCtaContent = {
  eyebrow: "The full ritual",
  headline: ["Small habits.", "A brighter you."],
  description: "Four quiet rituals for every hour of your day. Start with one, or keep the whole shelf.",
  hint: "Choose a ritual",
  turntableCaption: "Super Essentials · in the round",
  spots: [
    { product: "essentials", x: 19.7 },
    { product: "skin-hair", x: 39.8 },
    { product: "gut", x: 59.8 },
    { product: "womens", x: 80.6 },
  ] satisfies LineupSpot[],
  bundle: {
    name: "The Full Ritual",
    detail: "All four · a month of every ritual",
    price: "₹4,799",
    saving: "Save ₹397",
  },
  primaryCta: "Shop the collection",
  addLabel: "Add to bag",
  signoff: ["Wellness", "naturally", "always"],
};

/* 05½ · Better together ------------------------------------------------ */
export const adultTogetherContent = {
  eyebrow: "Better together",
  wordLeft: "Shared,",
  wordRight: "not prescribed.",
  line: "Shared, not prescribed.",
  sub: "A ritual is easier to keep when it's passed around — one small gummy, a few good people.",
};
