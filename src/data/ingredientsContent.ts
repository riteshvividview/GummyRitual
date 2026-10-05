/**
 * "Inside Every Gummy" (section 04) copy, kept separate from the
 * component tree so it maps onto Shopify section settings / metafields
 * later.
 */

export interface IngredientBenefit {
  title: string;
  description: string;
}

export interface IngredientStat {
  /** e.g. "60%" or "0g" — kept as a string since not every stat is a
   * percentage (see "No Added Sugar"). */
  value: string;
  label: string;
}

export interface Ingredient {
  id: string;
  label: string;
  /** Shown on the floating left info card. */
  description: string;
  /** Filename (not a path) resolved via Ingredients/ingredientImages.ts's
   * glob import — the full-bleed background photo for this ingredient. */
  background: string;
  /** Filename for the small icon shown in the bottom selector row. */
  icon: string;
  /** The headline stat shown on the right-side table panel. */
  stat: IngredientStat;
  /** 3 short, factual benefit rows for the right-side table. */
  benefits: IngredientBenefit[];
  /** Which hero bear mascot (Hero/HeroDecor.tsx's bearImage map) to float
   * beside the table — purely decorative, picked per ingredient for tonal
   * variety rather than any functional meaning. */
  mascot: "orange" | "pink" | "green" | "blue";
}

export const ingredientsContent = {
  eyebrow: "INSIDE EVERY GUMMY",
  ingredients: [
    {
      id: "real-fruits",
      label: "Real Fruits",
      description: "Naturally delicious flavours kids love.",
      background: "Golden Gummy Bear Real fruits.png",
      icon: "below-ingredient-real-fruits.png",
      stat: { value: "60%", label: "Real fruit purée in every gummy" },
      benefits: [
        {
          title: "Natural Vitamin C",
          description: "From real orange and berry purée, not synthetic additives.",
        },
        {
          title: "No Artificial Flavours",
          description: "Sweetness and taste come from the fruit itself.",
        },
        {
          title: "Gentle on Digestion",
          description: "Naturally occurring fibre supports healthy digestion.",
        },
      ],
      mascot: "orange",
    },
    {
      id: "vitamins",
      label: "Vitamins",
      description: "Essential vitamins for everyday growth.",
      background: "Golden Vitamin Gummy Bear Terrace.png",
      icon: "below-ingredient-Vitamin.png",
      stat: { value: "100%", label: "Daily value of Vitamin C & D" },
      benefits: [
        {
          title: "Immune Support",
          description: "Vitamin C helps support a child's natural defences.",
        },
        {
          title: "Bone & Teeth Growth",
          description: "Vitamin D supports calcium absorption for healthy growth.",
        },
        {
          title: "Everyday Energy",
          description: "B-Vitamins help convert food into usable energy.",
        },
      ],
      mascot: "blue",
    },
    {
      id: "antioxidants",
      label: "Antioxidants",
      description: "Powerful antioxidants that protect little bodies.",
      background: "Antioxidant Berry Gummy Bear Splash.png",
      icon: "below-ingredient-Antioxidant.png",
      stat: { value: "45%", label: "Sourced from real berries & botanicals" },
      benefits: [
        {
          title: "Cell Protection",
          description: "Antioxidants help protect growing cells from everyday stress.",
        },
        {
          title: "Rich in Anthocyanins",
          description: "Naturally sourced from blueberries, not synthetic dyes.",
        },
        {
          title: "Supports Skin Health",
          description: "Helps maintain healthy, resilient skin.",
        },
      ],
      mascot: "pink",
    },
    {
      id: "botanicals",
      label: "Botanicals",
      description: "Nature's botanicals for gentle, everyday wellness.",
      background: "Mediterranean Botanical Gummy Bear Ad.png",
      icon: "below-ingredient-botanical.png",
      stat: { value: "30%", label: "Botanical extract blend" },
      benefits: [
        {
          title: "Gentle Wellness",
          description: "Hibiscus and chamomile support calm, everyday balance.",
        },
        {
          title: "Naturally Sourced",
          description: "Plant-based extracts, not artificial compounds.",
        },
        {
          title: "Soothing Properties",
          description: "Traditionally used to support relaxation and digestion.",
        },
      ],
      mascot: "green",
    },
    {
      id: "minerals",
      label: "Minerals",
      description: "Vital minerals to support healthy growth.",
      background: "Golden Gummy Bear Crystal Paradise.png",
      icon: "below-ingredient-minerals.png",
      stat: { value: "50%", label: "Daily value of Zinc & Calcium" },
      benefits: [
        {
          title: "Strong Bones",
          description: "Calcium supports healthy bone density during growth.",
        },
        {
          title: "Immune Function",
          description: "Zinc plays a key role in a healthy immune response.",
        },
        {
          title: "Muscle Function",
          description: "Essential minerals support everyday muscle movement.",
        },
      ],
      mascot: "blue",
    },
    {
      id: "no-added-sugar",
      label: "No Added Sugar",
      description: "Deliciously sweet, naturally — never added sugar.",
      background: "Gummy Bear Sugar-Free Seaside Escape.png",
      icon: "below-ingredient-no-added-sugars.png",
      stat: { value: "0g", label: "Added sugar — naturally sweetened" },
      benefits: [
        {
          title: "Tooth-Friendly",
          description: "No added sugar means less risk for little teeth.",
        },
        {
          title: "Stable Energy",
          description: "Avoids sugar spikes and crashes between meals.",
        },
        {
          title: "Naturally Sweet",
          description: "Sweetness comes from real fruit, not syrups.",
        },
      ],
      mascot: "orange",
    },
  ] satisfies Ingredient[],
};
