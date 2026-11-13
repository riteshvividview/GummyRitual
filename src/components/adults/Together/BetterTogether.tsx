import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../../animations/gsap";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { adultTogetherContent as content } from "../../../data/adults/adultSectionsContent";
import loop from "../../../assets/adults/05b-together/together-loop.mp4";
import poster from "../../../assets/adults/05b-together/together-poster.jpg";
import red from "../../../assets/adults/05b-together/gummy-red.webp";
import orange from "../../../assets/adults/05b-together/gummy-orange.webp";
import yellow from "../../../assets/adults/05b-together/gummy-yellow.webp";
import pink from "../../../assets/adults/05b-together/gummy-pink.webp";
import droplets from "../../../assets/adults/05b-together/particles-droplets.webp";
import sugar from "../../../assets/adults/05b-together/particles-sugar.webp";
import styles from "./BetterTogether.module.css";

/**
 * Floating layer around the film window. x / y are the element's centre
 * (% of the section), w its width (% of section width), r rotation,
 * blur in px (depth of field), d the parallax depth — bigger moves more,
 * and the blurred foreground pieces get the biggest values.
 */
type Piece = { src: string; x: number; y: number; w: number; r: number; blur?: number; d: number; flip?: boolean };

const GUMMIES: Piece[] = [
  { src: red, x: 29.5, y: 22.5, w: 9, r: -14, d: 1 },
  { src: orange, x: 70.5, y: 21.5, w: 9, r: 16, d: 1.1, flip: true },
  { src: pink, x: 74.5, y: 32, w: 5.4, r: 8, blur: 1.2, d: 0.6 },
  { src: red, x: 94, y: 28, w: 10.5, r: -22, blur: 14, d: 2.2, flip: true },
  { src: yellow, x: 31.5, y: 71.5, w: 9, r: 22, d: 1.2 },
  { src: red, x: 70.5, y: 77, w: 8.6, r: -9, d: 1.05, flip: true },
  { src: pink, x: 24, y: 85, w: 5.8, r: -26, blur: 2.2, d: 0.7 },
  { src: yellow, x: 47, y: 3, w: 7, r: 30, blur: 9, d: 1.8, flip: true },
  { src: orange, x: 14, y: 90, w: 11, r: -12, blur: 16, d: 2.4 },
];

/** Little clouds of sugar/droplets around the gummies. */
const DUST: Piece[] = [
  { src: sugar, x: 37, y: 12, w: 7, r: 0, d: 0.5 },
  { src: droplets, x: 30, y: 44, w: 6, r: 40, d: 0.8 },
  { src: sugar, x: 74, y: 17, w: 8, r: 90, d: 0.55 },
  { src: droplets, x: 71, y: 41, w: 6, r: 0, d: 0.75 },
  { src: sugar, x: 23, y: 72, w: 6, r: 200, d: 0.5 },
  { src: droplets, x: 76, y: 68, w: 7, r: 120, d: 0.7 },
  { src: sugar, x: 64, y: 88, w: 6, r: 300, d: 0.6 },
];

/**
 * Between 05 (Day) and 06 (Texture): friends sharing gummies.
 *
 * Desktop: the section pins. The film sits in a small window between the
 * two halves of the headline (which is a difference blend, so "not"
 * inverts where it crosses the film), with gummies and sugar floating at
 * different depths around it — they follow the cursor and drift with
 * scroll. On scroll the window opens to full bleed, the gummies scatter
 * outwards, the words part, then a single line settles over the film.
 * Mobile / reduced motion: no pin, no floating layer.
 */
export function BetterTogether() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reduced) return;
      const q = gsap.utils.selector(root);

      if (isMobile) {
        gsap.from(q("[data-film]"), {
          clipPath: "inset(8% 6% 8% 6% round 1.4rem)",
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "top 20%", scrub: 0.5 },
        });
        gsap.from(q("[data-after] > *"), {
          y: 24, autoAlpha: 0, stagger: 0.08, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 40%" },
        });
        return;
      }

      const floats = q<HTMLElement>("[data-float]");

      // 1 · Idle bob — each piece breathes on its own clock.
      floats.forEach((el) => {
        const inner = el.querySelector("img")!;
        gsap.set(inner, { rotation: Number(inner.dataset.r) || 0, scaleX: inner.dataset.flip ? -1 : 1 });
        gsap.to(inner, {
          y: gsap.utils.random(-14, 14),
          rotation: `+=${gsap.utils.random(-8, 8)}`,
          duration: gsap.utils.random(2.6, 4.2),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: gsap.utils.random(0, 1.5),
        });
      });

      // 2 · Cursor parallax on the depth layers (and a touch on the film).
      const movers = floats.map((el) => {
        const d = Number(el.dataset.depth) || 1;
        return {
          d,
          x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" }),
        };
      });
      const filmX = gsap.quickTo(q("[data-video]"), "xPercent", { duration: 1.4, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach((m) => {
          m.x(-nx * 46 * m.d);
          m.y(-ny * 34 * m.d);
        });
        filmX(nx * 1.2);
      };
      root.addEventListener("pointermove", onMove);

      // 3 · Pinned scroll story.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top top", end: "+=170%", pin: true, scrub: 0.8 },
      });
      tl.fromTo(
        q("[data-film]"),
        { clipPath: "inset(28% 32% 27% 33% round 1.6rem)" },
        { clipPath: "inset(0% 0% 0% 0% round 0rem)", duration: 1 },
        0.15
      )
        .fromTo(q("[data-video]"), { scale: 1.3 }, { scale: 1.04, duration: 1 }, 0.15)
        .to(q("[data-word='l']"), { xPercent: -60, autoAlpha: 0, duration: 0.7 }, 0.15)
        .to(q("[data-word='r']"), { xPercent: 60, autoAlpha: 0, duration: 0.7 }, 0.15);

      // Gummies scatter away from the centre, deeper ones faster.
      q<HTMLElement>("[data-scatter]").forEach((el) => {
        const d = Number(el.dataset.depth) || 1;
        const cx = parseFloat(el.style.left) - 50;
        const cy = parseFloat(el.style.top) - 50;
        tl.to(
          el,
          { xPercent: cx * 9 * d, yPercent: cy * 9 * d, scale: 1 + 0.5 * d, autoAlpha: 0, duration: 0.8 },
          0.15
        );
      });

      // Before the window opens, the layer drifts up with scroll (depth).
      floats.forEach((el) => {
        const d = Number(el.dataset.depth) || 1;
        gsap.fromTo(
          el.querySelector("[data-drift]"),
          { yPercent: 40 * d },
          { yPercent: -10 * d, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "top top", scrub: 0.6 } }
        );
      });

      tl.fromTo(q("[data-shade]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.75)
        .from(q("[data-after] > *"), { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.35, ease: "power2.out" }, 0.9)
        .to({}, { duration: 0.35 });

      return () => root.removeEventListener("pointermove", onMove);
    },
    { scope: ref, dependencies: [reduced, isMobile] }
  );

  const piece = (p: Piece, i: number, kind: "gummy" | "dust") => (
    <div
      key={`${kind}${i}`}
      className={kind === "gummy" ? styles.gummy : styles.dust}
      data-float
      data-scatter
      data-depth={p.d}
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: `${p.w}%`,
        filter: p.blur ? `blur(${p.blur}px)` : undefined,
        zIndex: p.blur && p.blur > 6 ? 4 : 2,
      }}
    >
      <div data-drift>
        <img
          src={p.src}
          alt=""
          draggable={false}
          data-r={p.r}
          data-flip={p.flip ? 1 : undefined}
        />
      </div>
    </div>
  );

  return (
    <section ref={ref} className={styles.section} aria-label={content.eyebrow}>
      <div className={styles.film} data-film>
        <video
          className={styles.video}
          data-video
          src={loop}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className={styles.shade} data-shade aria-hidden />
      </div>

      <h2 className={styles.headline} aria-hidden>
        <span data-word="l">{content.wordLeft}</span>
        <span data-word="r">{content.wordRight}</span>
      </h2>

      <div className={styles.decor} aria-hidden>
        <div className={styles.floorShadow} data-scatter data-depth="0.3" style={{ left: "50%", top: "84%" }} />
        {DUST.map((p, i) => piece(p, i, "dust"))}
        {GUMMIES.map((p, i) => piece(p, i, "gummy"))}
      </div>

      <div className={styles.after} data-after>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <p className={styles.line}>{content.line}</p>
        <p className={styles.sub}>{content.sub}</p>
      </div>
    </section>
  );
}
