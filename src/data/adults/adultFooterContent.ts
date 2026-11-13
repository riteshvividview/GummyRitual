/**
 * Adults footer copy — separate from the Kids footer (src/data/footerContent.ts)
 * so each experience keeps its own voice, links and imagery.
 */
import { footerContent, type FooterColumn } from "../footerContent";

export interface AdultFooterStandard {
  label: string;
  /** Font Awesome solid icon class. */
  icon: string;
}

export const adultFooterContent = {
  brand: {
    tagline: "Daily wellbeing, held lightly.",
    description:
      "Plant-based gummies for every hour of your day — four quiet rituals, one routine.",
  },
  socials: footerContent.socials,
  columns: [
    {
      heading: "Shop",
      links: [
        { label: "Super Essentials", href: "#" },
        { label: "Skin & Hair", href: "#" },
        { label: "Gut Health", href: "#" },
        { label: "Women's Daily Ritual", href: "#" },
      ],
    },
    {
      heading: "Learn",
      links: [
        { label: "Our Story", href: "#" },
        { label: "Ingredients", href: "#" },
        { label: "Science & Quality", href: "#" },
        { label: "Journal", href: "#" },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: "Track Your Order", href: "#" },
        { label: "Shipping & Delivery", href: "#" },
        { label: "Returns & Refunds", href: "#" },
        { label: "Contact Us", href: "#" },
      ],
    },
  ] satisfies FooterColumn[],
  newsletter: {
    heading: "Join the Ritual",
    description: "New rituals, quiet offers and notes on everyday wellbeing.",
    placeholder: "Your email address",
  },
  standards: [
    { label: "Plant based", icon: "fa-seedling" },
    { label: "No added sugar", icon: "fa-ban" },
    { label: "No artificial colours", icon: "fa-droplet" },
    { label: "Third-party tested", icon: "fa-flask" },
  ] satisfies AdultFooterStandard[],
  legal: {
    ...footerContent.legal,
    links: [
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
};
