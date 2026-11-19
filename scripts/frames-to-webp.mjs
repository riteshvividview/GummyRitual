/** Converts scroll-sequence PNG frames to WebP in place (deletes the PNGs).
 * Run: node scripts/frames-to-webp.mjs <folder> [<folder>...] */
import sharp from "sharp";
import { readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
for (const dir of process.argv.slice(2)) {
  const pngs = readdirSync(dir).filter((f) => f.endsWith(".png"));
  for (const f of pngs) {
    await sharp(join(dir, f)).webp({ quality: 80, effort: 5 }).toFile(join(dir, f.replace(/\.png$/, ".webp")));
    unlinkSync(join(dir, f));
  }
  console.log("✓", dir, pngs.length);
}
