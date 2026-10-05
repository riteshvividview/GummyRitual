/**
 * Site footer copy, kept separate from the component tree so it maps
 * onto Shopify theme settings / navigation menus later.
 */

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  /** Font Awesome brand icon class, e.g. "fa-instagram". */
  icon: string;
}

export interface TrustBadge {
  label: string;
  /** Font Awesome solid icon class, e.g. "fa-shield-halved". */
  icon: string;
  tint: "orange" | "blue" | "green" | "pink";
}

export const footerContent = {
  brand: {
    tagline: ["Small gummies.", "Big possibilities."],
    description:
      "Thoughtfully formulated nutrition to support your child's brighter, healthier tomorrow.",
  },
  socials: [
    { label: "Instagram", href: "#", icon: "fa-instagram" },
    { label: "Facebook", href: "#", icon: "fa-facebook-f" },
    { label: "YouTube", href: "#", icon: "fa-youtube" },
    { label: "Pinterest", href: "#", icon: "fa-pinterest-p" },
  ] satisfies SocialLink[],
  columns: [
    {
      heading: "Shop",
      links: [
        { label: "Kids Multivitamin", href: "#" },
        { label: "Kids Calcium", href: "#" },
        { label: "Kids Focus", href: "#" },
        { label: "Kids Iron", href: "#" },
        { label: "All Products", href: "#" },
      ],
    },
    {
      heading: "Learn",
      links: [
        { label: "Our Story", href: "#" },
        { label: "Ingredients", href: "#" },
        { label: "Science & Safety", href: "#" },
        { label: "Parent Guide", href: "#" },
        { label: "FAQs", href: "#" },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: "Track Your Order", href: "#" },
        { label: "Shipping & Delivery", href: "#" },
        { label: "Returns & Refunds", href: "#" },
        { label: "Contact Us", href: "#" },
        { label: "Size Guide", href: "#" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Our Values", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Privacy Policy", href: "#" },
      ],
    },
  ] satisfies FooterColumn[],
  newsletter: {
    heading: "Join the Gummy Ritual",
    description: "Get updates, offers and parenting nutrition tips.",
    placeholder: "Your email address",
  },
  trustBadges: [
    { label: "Trusted by Parents", icon: "fa-shield-halved", tint: "orange" },
    { label: "High-Quality Ingredients", icon: "fa-leaf", tint: "blue" },
    { label: "Scientifically Formulated", icon: "fa-flask", tint: "green" },
    { label: "Loved by Kids", icon: "fa-heart", tint: "pink" },
  ] satisfies TrustBadge[],
  legal: {
    copyright: `© ${new Date().getFullYear()} The Gummy Ritual. All rights reserved.`,
    paymentLabel: "Secure Payments",
    paymentIcons: [
      { icon: "fa-cc-visa", label: "Visa" },
      { icon: "fa-cc-mastercard", label: "Mastercard" },
      { icon: "fa-cc-apple-pay", label: "Apple Pay" },
    ],
  },
};
