/**
 * Adults asset pipeline: raw client uploads (Organize-adult-section/) →
 * optimized WebP under src/assets/adults/<section>/.
 *
 * Cutouts (transparent PNGs from AI background removal) arrive with a
 * faint low-alpha halo and a subject that's only ~90% opaque. We remap
 * alpha (LO → 0, HI → 255, linear between) to kill the halo and make the
 * subject solid, then trim the empty border so every cutout's bounding
 * box hugs the object.
 *
 * Run: node scripts/optimize-adult-assets.mjs
 */
import sharp from "sharp";
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "Organize-adult-section");
const OUT = join(root, "src/assets/adults");

/** [match prefix, section folder, max width, isCutout] */
const RULES = [
  ["hero-plate-", "01-hero", 1920, false],
  ["tin-", "shared/tins", 900, true],
  ["room-", "02-collection", 1100, false],
  ["sachet-", "02-collection/sachets", 900, true],
  ["gummy-pair-", "02-collection/gummies", 800, true],
  ["need-", "03-needs", 1100, false],
  ["ingredient-", "04-ingredients", 1920, false],
  ["icon-", "04-ingredients/icons", 520, true],
  ["archive-paper", "04-ingredients", 1600, false],
  ["day-", "05-day", 1400, false],
  ["trust-", "07-trust", 1600, false],
  ["cta-lineup", "08-final-cta", 2400, false],
  ["cross-section-", "06-texture/cross-sections", 900, true],
  ["texture-start-frame", "06-texture", 1920, false],
];

const LO = 70;
const HI = 185;

async function cleanCutout(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i];
    data[i] = a <= LO ? 0 : a >= HI ? 255 : Math.round(((a - LO) / (HI - LO)) * 255);
  }
  return sharp(data, { raw: info }).trim({ threshold: 1 });
}

// Top-level files plus one level of client sub-folders ("Section 5", …).
const files = readdirSync(SRC).flatMap((entry) =>
  statSync(join(SRC, entry)).isDirectory()
    ? readdirSync(join(SRC, entry)).map((f) => join(entry, f))
    : [entry]
);

for (const rel of files.filter((f) => f.endsWith(".mp4"))) {
  const file = basename(rel);
  if (file.startsWith("cta-turntable")) {
    // 08 · Crop the 1280×720 source to the tin (keeps the "Veo" mark and
    // most of a studio softbox out of frame; the rest sits under a CSS
    // veil), then ping-pong it (forward + reversed) for a seamless loop.
    const out = join(OUT, "08-final-cta");
    mkdirSync(out, { recursive: true });
    const crop = "crop=460:640:430:20";
    execFileSync("ffmpeg", [
      "-v", "error", "-y", "-i", join(SRC, rel), "-an",
      "-filter_complex", `[0:v]${crop},split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,format=yuv420p[v]`,
      "-map", "[v]", "-c:v", "libx264", "-crf", "24", "-preset", "slow", "-movflags", "+faststart",
      join(out, "turntable.mp4"),
    ]);
    execFileSync("ffmpeg", [
      "-v", "error", "-y", "-i", join(SRC, rel), "-vf", crop, "-frames:v", "1",
      "-c:v", "libwebp", "-quality", "82", join(out, "turntable-poster.webp"),
    ]);
    console.log("✓ 08-final-cta turntable → ping-pong mp4 + poster");
    continue;
  }
  if (!file.startsWith("texture-tear-loop")) continue;
  const input = join(SRC, rel);
  // Desktop: scroll-scrubbed WebP frame sequence (12 fps of the 24 fps
  // source is plenty when scroll is the clock).
  const framesDir = join(OUT, "06-texture/tear-frames");
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", input,
    "-vf", "fps=12,scale=1280:-2",
    "-c:v", "libwebp", "-quality", "74", "-compression_level", "5",
    join(framesDir, "tear-%03d.webp"),
  ]);
  // Mobile: a light, silent, fast-start MP4 that plays once in view.
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", input, "-an",
    "-vf", "scale=960:-2", "-c:v", "libx264", "-crf", "26", "-preset", "slow",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    join(OUT, "06-texture/texture-tear.mp4"),
  ]);
  console.log("✓ 06-texture video → frames + mp4");
}

for (const rel of files.filter((f) => f.endsWith(".png"))) {
  const file = basename(rel);
  const rule = RULES.find(([prefix]) => file.startsWith(prefix));
  if (!rule) {
    console.warn("skip (no rule):", file);
    continue;
  }
  const [, folder, maxWidth, cutout] = rule;
  const base = file.replace(/\.(jpg|png)\.png$/, "").replace(/\.png$/, "");
  const outDir = join(OUT, folder);
  mkdirSync(outDir, { recursive: true });

  let img = cutout ? await cleanCutout(join(SRC, rel)) : sharp(join(SRC, rel));
  // trim() must be materialised before resize can read the new size.
  if (cutout) img = sharp(await img.png().toBuffer());
  await img
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: cutout ? 86 : 80, alphaQuality: 90, effort: 5 })
    .toFile(join(outDir, `${base}.webp`));
  console.log("✓", folder, base);
}
