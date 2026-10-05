/**
 * Header nav + mega-menu copy, kept separate from the component tree so
 * it maps onto Shopify's navigation menu settings later. Product data
 * itself still lives in src/data/products.ts — this only adds the
 * header-specific framing (icons, subtitles, which product is featured).
 */

export type HeaderIcon =
  | "shield"
  | "bone"
  | "brain"
  | "droplet"
  | "grid"
  | "trendingUp"
  | "zap"
  | "heart";

export interface ShopCategory {
  /** Matches a Product["id"] in src/data/products.ts, except "all". */
  productId: string | "all";
  subtitle: string;
  icon: HeaderIcon;
}

export interface ShopBenefit {
  label: string;
  icon: HeaderIcon;
}

export interface NavItem {
  label: string;
  href: string;
  dropdown?: "shop" | "ingredients";
}

export const headerContent = {
  primaryNav: [
    { label: "Shop", href: "/shop", dropdown: "shop" },
    { label: "Ingredients", href: "/ingredients", dropdown: "ingredients" },
    { label: "Our Story", href: "/our-story" },
    { label: "Science & Safety", href: "/science-safety" },
    { label: "Parent Guide", href: "/parent-guide" },
    { label: "Blog", href: "/blog" },
  ] satisfies NavItem[],

  shopMenu: {
    categories: [
      { productId: "kids-multivitamin", subtitle: "Everyday nutrition", icon: "shield" },
      { productId: "kids-calcium", subtitle: "Strong bones & teeth", icon: "bone" },
      { productId: "kids-focus", subtitle: "Learning & concentration", icon: "brain" },
      { productId: "kids-iron", subtitle: "Energy & immunity", icon: "droplet" },
    ] satisfies ShopCategory[],
    allProductsLabel: "All Products",
    allProductsSubtitle: "Explore the full range",
    benefitsHeading: "Shop by Benefit",
    benefits: [
      { label: "Immunity", icon: "shield" },
      { label: "Growth", icon: "trendingUp" },
      { label: "Energy", icon: "zap" },
      { label: "Focus", icon: "brain" },
      { label: "Bone Health", icon: "bone" },
      { label: "Overall Health", icon: "heart" },
    ] satisfies ShopBenefit[],
    /** Featured panel on the right — matches a Product["id"]. */
    featuredProductId: "kids-multivitamin",
    featuredBadge: "BESTSELLER",
    featuredDescription: "Daily nutrition for growing kids.",
    featuredCtaLabel: "Shop Now",
  },

  ingredientsMenu: {
    heading: "Explore by Ingredient",
  },
};
