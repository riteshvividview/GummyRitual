/**
 * Generates grayscale depth maps (white = near) for the hero plates with
 * Depth Anything (transformers.js, runs locally). Output sits next to the
 * plates as *-depth.webp. Run: node scripts/make-depth-maps.mjs
 */
import { pipeline, RawImage } from "@huggingface/transformers";
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "src/assets/adults/01-hero");

const estimator = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", {
  dtype: "fp32",
});

for (const f of readdirSync(dir).filter((f) => f.startsWith("hero-plate-") && !f.includes("-depth"))) {
  const png = await sharp(join(dir, f)).png().toBuffer();
  const image = await RawImage.fromBlob(new Blob([png]));
  const { depth } = await estimator(image);
  const { width, height } = await sharp(join(dir, f)).metadata();
  await sharp(Buffer.from(depth.data), { raw: { width: depth.width, height: depth.height, channels: 1 } })
    .resize(Math.round(width / 2), Math.round(height / 2))
    .blur(2)
    .normalise()
    .webp({ quality: 85 })
    .toFile(join(dir, f.replace(".webp", "-depth.webp")));
  console.log("✓", f);
}
