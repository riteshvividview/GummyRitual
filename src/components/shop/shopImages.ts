/**
 * Image sets for the shop — pack cutout (listing + buy-page hero) and an
 * ordered gallery per product. Kids art is optimised into
 * src/assets/shop/kids/ (WebP copies of the homepage sources); Adults
 * reuses the existing adultImages resolver.
 */
import { adultImages } from "../adults/common/adultImages";
import type { AdultProductId } from "../../data/adults/adultProducts";
import type { CatalogProduct } from "../../data/catalog";

const kids = import.meta.glob<string>("../../assets/shop/kids/*.webp", { eager: true, import: "default" });
const kid = (name: string) => {
  const hit = Object.entries(kids).find(([p]) => p.endsWith(`/${name}.webp`));
  if (!hit) throw new Error(`Missing shop image: ${name}`);
  return hit[1];
};

/** cutout = transparent, shown contained on the tint wash; photo = full-bleed. */
export interface GalleryImage {
  src: string;
  kind: "cutout" | "photo";
  alt: string;
}

export function packImage(p: CatalogProduct): string {
  return p.range === "kids" ? kid(`pack-${p.id}`) : adultImages.pouch(p.id as AdultProductId);
}

/** A lifestyle/scene image used behind the pack on the listing (hover). */
export function sceneImage(p: CatalogProduct): string {
  return p.range === "kids" ? kid(`scene-${p.id}`) : adultImages.room(p.id as AdultProductId);
}

export function gallery(p: CatalogProduct): GalleryImage[] {
  if (p.range === "kids") {
    return [
      { src: kid(`pack-${p.id}`), kind: "cutout", alt: `${p.title} pouch with fruit and gummies` },
      { src: kid(`scene-${p.id}`), kind: "photo", alt: `${p.title} pouch` },
      { src: kid(`gummy-${p.id}`), kind: "photo", alt: "Close-up of the gummy" },
      { src: kid("duo-kids"), kind: "photo", alt: "Kids Multivitamin and Kids Calcium together" },
    ];
  }
  const id = p.id as AdultProductId;
  return [
    { src: adultImages.pouch(id), kind: "cutout", alt: `${p.title} pouch` },
    { src: adultImages.room(id), kind: "photo", alt: `${p.title} at home` },
    { src: adultImages.gummies(id), kind: "cutout", alt: "Two gummies" },
    { src: adultImages.crossSection(id), kind: "cutout", alt: "Inside the gummy" },
    { src: adultImages.sachet(id), kind: "cutout", alt: `${p.title} sachet` },
  ];
}
