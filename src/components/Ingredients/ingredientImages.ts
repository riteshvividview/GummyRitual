/**
 * Ingredient background + icon images, resolved via Vite's glob import —
 * same approach as FeaturedCollection/productImages.ts and
 * Hero/FrameSequence.ts (fingerprinted for production, and doesn't error
 * at build time if a file is missing).
 */

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

const rawModules = import.meta.glob(
  "../../assets/homepage/04-ingredients/images/*.{png,jpg,jpeg,webp}",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const imagesByFilename: Record<string, string> = Object.fromEntries(
  Object.entries(rawModules).map(([path, url]) => [basename(path), url])
);

export function getIngredientImage(filename?: string): string | undefined {
  if (!filename) return undefined;
  return imagesByFilename[filename];
}
