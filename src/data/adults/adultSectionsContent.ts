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
    "Plant-based gummies for every hour of your day. Five rituals, one quiet routine.",
  primaryCta: "Shop the Ritual",
  scrollHint: "Scroll through the day",
  plates: [
    { product: "multivitamin", hour: 7, moment: "Morning", wall: "#c9a685", ink: "#f6efe8", inkMuted: "#eee2d4", accent: "#f2dcc4", wallLight: -0.3, label: "#e9d6c2", button: "#4f4038", buttonText: "#f6efe8" },
    { product: "skin", hour: 10, moment: "Late morning", wall: "#cf9a8c", ink: "#ffe8e1", inkMuted: "#fdd6cc", accent: "#f6c0b5", wallLight: -0.3, label: "#efc0b6", button: "#a4695f", buttonText: "#ffe8e1" },
    { product: "hair", hour: 13, moment: "Midday", wall: "#adb096", ink: "#f2f5f8", inkMuted: "#e6ebf1", accent: "#eedcc2", wallLight: -0.28, label: "#f0e4d2", button: "#2d221e", buttonText: "#eedcc2" },
    { product: "gut", hour: 17, moment: "Afternoon", wall: "#9bb0ad", ink: "#f3f1ec", inkMuted: "#e6e3dc", accent: "#dcd9d2", wallLight: -0.28, label: "#ece6dc", button: "#19273c", buttonText: "#f3f1ec" },
    { product: "sleep", hour: 22, moment: "Night", wall: "#45333e", ink: "#f7f3ec", inkMuted: "#ece2d6", accent: "#e6c8c0", wallLight: -0.22, label: "#e2b4b6", button: "#d4a0a3", buttonText: "#2b1d24" },
  ] satisfies HeroPlate[],
};

/* ------------------------------------------------------------------ */
/* 02 · The Edit — Collection                                          */
/* ------------------------------------------------------------------ */

export const adultCollectionContent = {
  eyebrow: "The Collection",
  headline: ["Five rituals.", "One quiet routine."],
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
    { id: "glow", word: "Glow", product: "skin", line: "Skin that looks rested, from the inside out.", ingredients: "Collagen · Hyaluronic Acid · Vitamin C" },
    { id: "strength", word: "Strength", product: "hair", line: "Fuller, stronger-looking hair, one day at a time.", ingredients: "Biotin · Zinc · Folic Acid" },
    { id: "energy", word: "Energy", product: "multivitamin", line: "A steady foundation for long, full days.", ingredients: "Vitamins A–K · Zinc · Selenium" },
    { id: "rest", word: "Rest", product: "sleep", line: "Let the day loosen its grip before you sleep.", ingredients: "Melatonin · Magnesium · L-Theanine" },
    { id: "balance", word: "Balance", product: "gut", line: "A calmer gut, and everything that follows.", ingredients: "Probiotics · Prebiotic Fibre · B6" },
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
      id: "collagen", name: "Collagen", product: "skin", tone: "#b1625d", dark: true, ink: "#fffaf8", inkMuted: "#f8d2ca", label: "#f3b9ae",
      summary: "The protein that gives skin its structure and spring.",
      stat: { value: "2.5g", label: "hydrolysed collagen peptides per daily serving" },
      points: [
        { title: "Firmness", text: "Supports the skin's natural elasticity." },
        { title: "Hydration", text: "Works with hyaluronic acid to hold moisture." },
        { title: "Easily absorbed", text: "Hydrolysed into small, bioavailable peptides." },
      ],
    },
    {
      id: "hyaluronic", name: "Hyaluronic Acid", product: "skin", tone: "#d99c98", dark: true, ink: "#fff7f5", inkMuted: "#feeeea", label: "#fbdcd5",
      summary: "A moisture magnet that holds up to 1,000× its weight in water.",
      stat: { value: "120mg", label: "hyaluronic acid in every serving" },
      points: [
        { title: "Plumpness", text: "Helps skin look smoother and fuller." },
        { title: "Barrier", text: "Supports a comfortable, hydrated skin barrier." },
        { title: "Gentle", text: "Naturally present in the body already." },
      ],
    },
    {
      id: "vitamin-c", name: "Vitamin C", product: "multivitamin", tone: "#d49a6f", dark: true, ink: "#fffaf3", inkMuted: "#fdf0e3", label: "#fadfc2",
      summary: "The everyday antioxidant behind immunity and collagen formation.",
      stat: { value: "100%", label: "of your daily vitamin C need" },
      points: [
        { title: "Immunity", text: "Contributes to normal immune function." },
        { title: "Collagen", text: "Needed for natural collagen formation." },
        { title: "Antioxidant", text: "Protects cells from oxidative stress." },
      ],
    },
    {
      id: "zinc", name: "Zinc", product: "hair", tone: "#99967f", dark: true, ink: "#fbfaf4", inkMuted: "#f2f0e6", label: "#e9e6d4",
      summary: "A trace mineral quietly working in hair, skin and immunity.",
      stat: { value: "10mg", label: "zinc per serving" },
      points: [
        { title: "Hair", text: "Contributes to the maintenance of normal hair." },
        { title: "Skin & nails", text: "Supports normal skin and nails." },
        { title: "Immunity", text: "Plays a role in immune defence." },
      ],
    },
    {
      id: "biotin", name: "Biotin", product: "hair", tone: "#a5a38a", dark: true, ink: "#fbfaf4", inkMuted: "#f3f2e8", label: "#e9ecd9",
      summary: "Vitamin B7 — the best-known nutrient for hair strength.",
      stat: { value: "5000µg", label: "biotin in every daily serving" },
      points: [
        { title: "Strength", text: "Supports the keratin structure of hair." },
        { title: "Energy", text: "Helps turn food into usable energy." },
        { title: "Nails", text: "Contributes to stronger-looking nails." },
      ],
    },
    {
      id: "magnesium", name: "Magnesium", product: "sleep", tone: "#c6a4b1", dark: true, ink: "#fdf8fa", inkMuted: "#f8ecf1", label: "#f1dae3",
      summary: "The calming mineral that helps muscles and mind unwind.",
      stat: { value: "100mg", label: "magnesium per serving" },
      points: [
        { title: "Relaxation", text: "Contributes to normal muscle function." },
        { title: "Nervous system", text: "Supports a calm nervous system." },
        { title: "Less tiredness", text: "Helps reduce tiredness and fatigue." },
      ],
    },
    {
      id: "melatonin", name: "Melatonin", product: "sleep", tone: "#7f5b5d", dark: true, ink: "#fbf3ee", inkMuted: "#ecd7d2", label: "#e1b8b5",
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
    eyebrow: "Five flavours",
    headline: "One texture, five fruits.",
    hint: "Choose a flavour",
    /** Display order across the row, keyed to adultProducts. */
    order: ["skin", "hair", "multivitamin", "sleep", "gut"] as const,
    notes: {
      skin: "Bright, just-ripe strawberry.",
      hair: "Deep, jammy wild blueberry.",
      multivitamin: "Orange, apple and peach together.",
      sleep: "Soft, sun-warm Alphonso mango.",
      gut: "Delicate, floral litchi.",
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
      products: ["multivitamin", "skin"],
      line: "With your first glass of water — foundations and glow, before the day asks anything of you.",
    },
    {
      id: "1300-desk",
      hour: 13,
      moment: "Midday",
      products: ["hair"],
      line: "At your desk, after lunch. A small reset that keeps working long after you've moved on.",
    },
    {
      id: "2200-bedside",
      hour: 22,
      moment: "Night",
      products: ["gut", "sleep"],
      line: "On the bedside table — balance for the gut, then a slow wind-down into sleep.",
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
    { value: 30, label: "days in every tin" },
  ] as ProofStat[],
  caption: "Weighed, tested and logged — batch by batch.",
};

/* ------------------------------------------------------------------ */
/* 08 · The lineup — final CTA                                         */
/* ------------------------------------------------------------------ */

export interface LineupSpot {
  product: AdultProductId;
  /** Tin centre in the lineup photograph, as % of its width. */
  x: number;
}

export const adultFinalCtaContent = {
  eyebrow: "The full ritual",
  headline: ["Small habits.", "A brighter you."],
  description: "Five quiet rituals for every hour of your day. Start with one, or keep the whole shelf.",
  hint: "Choose a ritual",
  turntableCaption: "Multivitamin · in the round",
  spots: [
    { product: "skin", x: 16.1 },
    { product: "hair", x: 33.1 },
    { product: "multivitamin", x: 50 },
    { product: "sleep", x: 66.7 },
    { product: "gut", x: 83.4 },
  ] satisfies LineupSpot[],
  bundle: {
    name: "The Full Ritual",
    detail: "All five · a month of every ritual",
    price: "₹5,999",
    saving: "Save ₹495",
  },
  primaryCta: "Shop the collection",
  addLabel: "Add to bag",
  signoff: ["Wellness", "naturally", "always"],
};
