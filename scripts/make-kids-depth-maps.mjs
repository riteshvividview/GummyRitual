/**
 * Depth maps (white = near) for the Kids scenes that keep their original
 * art — 04 ingredient scenes, 05 dreamscape, 06 stage + cards. Output sits
 * next to each image as <name>-depth.webp. Run: node scripts/make-kids-depth-maps.mjs [--all]
 */
import { pipeline, RawImage } from "@huggingface/transformers";
import sharp from "sharp";
import { readdirSync, existsSync } from "node:fs";
import { join, dirname, parse } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const H = (p) => join(root, "src/assets/homepage", p);
const files = [
  ...readdirSync(H("04-ingredients/images"))
    .filter((f) => f.endsWith(".png") && !f.startsWith("below-"))
    .map((f) => H(`04-ingredients/images/${f}`)),
  H("02-our-gummies/images/our-gummies-scene.png"),
  H("05-daily-routine/images/Day to Night Gummy Dreamscape bg image.png"),
  ...["bg-image", "texture-bear-image", "chewy-bite-image", "shape-bear-image", "ingredients-bear-image"].map((n) =>
    H(`06-taste-texture/images/${n}.png`)
  ),
];
const ALL = process.argv.includes("--all");
const out = (f) => join(dirname(f), `${parse(f).name}-depth.webp`);

const estimator = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", { dtype: "fp32" });
for (const f of files) {
  if (!ALL && existsSync(out(f))) continue;
  const png = await sharp(f).png().toBuffer();
  const { depth } = await estimator(await RawImage.fromBlob(new Blob([png])));
  const { width, height } = await sharp(f).metadata();
  await sharp(Buffer.from(depth.data), { raw: { width: depth.width, height: depth.height, channels: 1 } })
    .resize(Math.round(width / 2), Math.round(height / 2))
    .blur(2)
    .normalise()
    .webp({ quality: 85 })
    .toFile(out(f));
  console.log("✓", parse(f).name);
}
