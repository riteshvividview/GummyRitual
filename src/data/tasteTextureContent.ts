/**
 * Kids homepage section 6 — "Taste & Texture", kept separate from the
 * component tree so it maps onto Shopify section settings / metafields
 * later.
 */

export interface TextureCard {
  id: string;
  index: string;
  label: string;
  description: string;
  ctaLabel: string;
  /** Key into the imported image map in TasteTexture.tsx. */
  image: "texture" | "chewyBite" | "shape" | "ingredients";
}

export const tasteTextureContent = {
  eyebrow: "TASTE & TEXTURE",
  headline: {
    text: "A gummy experience",
    accentWord: "they'll love",
  },
  /** Which card id starts expanded, before any hover/focus/tap. */
  defaultActiveId: "chewy-bite",
  cards: [
    {
      id: "texture",
      index: "01",
      label: "TEXTURE",
      description: "Soft, bouncy, and perfectly squeezable in every little bite.",
      ctaLabel: "EXPLORE",
      image: "texture",
    },
    {
      id: "chewy-bite",
      index: "02",
      label: "CHEWY BITE",
      description: "Soft on the outside, delightfully chewy on the inside.",
      ctaLabel: "EXPLORE",
      image: "chewyBite",
    },
    {
      id: "shape",
      index: "03",
      label: "SHAPE",
      description: "Playful little bear shapes made for small hands to love.",
      ctaLabel: "EXPLORE",
      image: "shape",
    },
    {
      id: "ingredients",
      index: "04",
      label: "INGREDIENTS",
      description: "Real fruit flavor with gentle, trusted everyday nutrients.",
      ctaLabel: "EXPLORE",
      image: "ingredients",
    },
  ] satisfies TextureCard[],
};
