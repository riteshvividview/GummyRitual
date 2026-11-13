/**
 * Vite-resolved URLs for every Adults asset, keyed by file basename.
 * Source files come from scripts/optimize-adult-assets.mjs.
 */
import type { AdultProductId } from "../../../data/adults/adultProducts";
import type { DayImage, IngredientKey, NeedImage } from "../../../data/adults/adultSectionsContent";

const all = import.meta.glob<string>("../../../assets/adults/**/*.webp", {
  eager: true,
  import: "default",
});

const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(all)) {
  const name = path.split("/").pop()!.replace(/\.webp$/, "");
  byName[name] = url;
}

const tearFrameUrls = Object.entries(all)
  .filter(([path]) => path.includes("/tear-frames/"))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

const videos = import.meta.glob<string>("../../../assets/adults/**/*.mp4", {
  eager: true,
  query: "?url",
  import: "default",
});
const videoUrl = (name: string) => {
  const hit = Object.entries(videos).find(([path]) => path.endsWith(`/${name}.mp4`));
  if (!hit) throw new Error(`Missing Adults video: ${name}`);
  return hit[1];
};
const tearVideo = videoUrl("texture-tear");

function get(name: string) {
  const url = byName[name];
  if (!url) throw new Error(`Missing Adults asset: ${name}`);
  return url;
}

const plateFile: Record<AdultProductId, string> = {
  essentials: "hero-plate-01-essentials",
  "skin-hair": "hero-plate-02-skin-hair",
  gut: "hero-plate-03-gut",
  womens: "hero-plate-04-womens",
};

export const adultImages = {
  plate: (id: AdultProductId) => get(plateFile[id]),
  plateDepth: (id: AdultProductId) => get(`${plateFile[id]}-depth`),
  pouch: (id: AdultProductId) => get(`pouch-${id}-front`),
  pouchDepth: (id: AdultProductId) => get(`pouch-${id}-front-depth`),
  room: (id: AdultProductId) => get(`room-${id}`),
  sachet: (id: AdultProductId) => get(`sachet-${id}`),
  roomDepth: (id: AdultProductId) => get(`room-${id}-depth`),
  gummies: (id: AdultProductId) => get(`gummy-pair-${id}`),
  need: (id: NeedImage) => get(`need-${id}`),
  ingredient: (id: IngredientKey) => get(`ingredient-${id}`),
  ingredientDepth: (id: IngredientKey) => get(`ingredient-${id}-depth`),
  ingredientIcon: (id: IngredientKey) => get(`icon-${id}`),
  paper: () => get("archive-paper"),
  day: (id: DayImage) => get(`day-${id}`),
  dayDepth: (id: DayImage) => get(`day-${id}-depth`),
  trustLab: () => get("trust-lab-still-life"),
  trustHands: () => get("trust-hands-detail"),
  lineup: () => get("cta-lineup"),
  lineupDepth: () => get("cta-lineup-depth"),
  turntableVideo: () => videoUrl("turntable"),
  turntablePoster: () => get("turntable-poster"),
  textureStart: () => get("texture-start-frame"),
  textureVideo: () => tearVideo,
  /** Ordered scroll-scrub frames for section 06. */
  tearFrames: () => tearFrameUrls,
  crossSection: (id: AdultProductId) => get(`cross-section-${id}`),
};
