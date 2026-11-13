import { useId, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../../animations/gsap";
import { adultFinalCtaContent } from "../../../data/adults/adultSectionsContent";
import { adultProducts } from "../../../data/adults/adultProducts";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { getLenis } from "../../../hooks/useLenis";
import { PlateCanvas } from "../common/PlateCanvas";
import { adultImages } from "../common/adultImages";
import { TurntableFrame } from "./TurntableFrame";
import styles from "./TheLineup.module.css";

const { spots, bundle } = adultFinalCtaContent;
const LINEUP_URLS = [adultImages.lineup()];

/** A broad, gently tapered beam over a pouch: ~16% wide at the top, ~24% at the base. */
const beamPoints = (x: number) => `${x - 8},0 ${x + 8},0 ${x + 12},100 ${x - 12},100`;
const LINEUP_ALTS = ["Super Essentials, Skin & Hair, Gut Health and Women's Daily Ritual pouches on a travertine ledge"];

/**
 * 08 · The lineup — final CTA.
 * The page closes on the whole shelf. The photograph is rendered through
 * the same WebGL plate as the hero (cursor-following studio light, film
 * grain), so the experience ends the way it began. Each tin is a real
 * button: choosing one dims the shelf around it like a spotlight and
 * swaps the purchase bar; with nothing chosen the bar offers the bundle.
 */
export function TheLineup() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const section = sectionRef.current!;
      const q = gsap.utils.selector(section);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 65%" },
        defaults: { ease: "power3.out" },
      });
      tl.from(q("[data-line]"), { yPercent: 130, duration: 1.3, stagger: 0.1 })
        .from(q("[data-fade]"), { autoAlpha: 0, y: 24, duration: 1.1, stagger: 0.08 }, "-=0.9")
        .fromTo(
          q("[data-turntable]"),
          { clipPath: "inset(100% 0% 0% 0% round 1.5rem)", y: 40 },
          { clipPath: "inset(0% 0% 0% 0% round 1.5rem)", y: 0, duration: 1.4, ease: "power3.out" },
          "-=1.1"
        )
        // The shelf opens from the centre outwards.
        .fromTo(
          q("[data-shelf]"),
          { clipPath: "inset(0% 50% 0% 50%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power3.inOut" },
          "-=1"
        )
        .from(q("[data-bar]"), { autoAlpha: 0, y: 30, duration: 1 }, "-=0.6");

      gsap.from(q("[data-signoff] span"), {
        yPercent: 60,
        autoAlpha: 0,
        duration: 1.4,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: q("[data-signoff]")[0], start: "top 92%" },
      });
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  const onShop = () => {
    const el = document.getElementById("adult-collection");
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { duration: 2 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const product = selected !== null ? adultProducts[spots[selected].product] : null;

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="adult-final-title"
      style={product ? { ["--accent" as string]: product.tintDeep } : undefined}
    >
      <header className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.eyebrow} data-fade>
            <span className={styles.eyebrowIndex}>08</span>
            {adultFinalCtaContent.eyebrow}
          </p>
          <h2 id="adult-final-title" className={styles.headline}>
            {adultFinalCtaContent.headline.map((line, i) => (
              <span key={line} className={styles.line}>
                <span data-line className={i === 1 ? styles.lineAccent : undefined}>
                  {line}
                </span>
              </span>
            ))}
          </h2>
          <p className={styles.description} data-fade>
            {adultFinalCtaContent.description}
          </p>
        </div>
        <TurntableFrame caption={adultFinalCtaContent.turntableCaption} />
      </header>

      {/* The shelf + purchase bar share one hover zone, so moving from a
          tin down to "Add to bag" keeps the chosen product. */}
      <div className={styles.shop} onPointerLeave={(e) => e.pointerType === "mouse" && setSelected(null)}>
        <div className={styles.shelfScroller}>
          <div className={styles.shelf} data-shelf>
            <PlateCanvas
              urls={LINEUP_URLS}
              alts={LINEUP_ALTS}
              grain={0}
              pointerLight={isMobile ? 0 : 0.06}
            />

            {/* One fixed light per tin: switching tins fades the old light
                off and the new one on in place — nothing travels. */}
            <svg
              className={`${styles.beam} ${selected !== null ? styles.beamOn : ""}`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <filter id={`blur-${uid}`} x="-30%" y="-10%" width="160%" height="120%">
                  <feGaussianBlur stdDeviation="1.3 2.2" />
                </filter>
                <linearGradient id={`light-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff4e4" stopOpacity="0.1" />
                  <stop offset="0.45" stopColor="#fff1de" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#ffeed8" stopOpacity="0.32" />
                </linearGradient>
                {/* the dimming eases in from the top instead of starting as a band */}
                <linearGradient id={`dimfade-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="black" />
                  <stop offset="0.35" stopColor="white" />
                </linearGradient>
                <mask id={`mask-${uid}`}>
                  <rect width="100" height="100" fill={`url(#dimfade-${uid})`} />
                  {spots.map((sp, i) => (
                    <polygon
                      key={sp.product}
                      className={`${styles.beamShape} ${selected === i ? styles.beamShapeOn : ""}`}
                      points={beamPoints(sp.x)}
                      fill="black"
                      filter={`url(#blur-${uid})`}
                    />
                  ))}
                </mask>
              </defs>
              <rect width="100" height="100" fill="rgba(30, 21, 16, 0.42)" mask={`url(#mask-${uid})`} />
              {spots.map((sp, i) => (
                <polygon
                  key={sp.product}
                  className={`${styles.beamShape} ${selected === i ? styles.beamShapeOn : ""}`}
                  points={beamPoints(sp.x)}
                  fill={`url(#light-${uid})`}
                  filter={`url(#blur-${uid})`}
                />
              ))}
            </svg>

            {spots.map((s, i) => {
              const p = adultProducts[s.product];
              const on = selected === i;
              return (
                <button
                  key={s.product}
                  type="button"
                  className={`${styles.spot} ${on ? styles.spotOn : ""}`}
                  style={{ left: `${s.x}%`, ["--i" as string]: i }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(i)}
                  onFocus={() => setSelected(i)}
                  onClick={() => setSelected(on && !isMobile ? null : i)}
                  aria-pressed={on}
                  aria-label={`${p.name}, ${p.price}`}
                >
                  <img className={styles.spotGummy} src={adultImages.gummies(s.product)} alt="" aria-hidden />
                </button>
              );
            })}
          </div>
        </div>

        {/* Purchase bar --------------------------------------------------- */}
        <div className={styles.bar} data-bar aria-live="polite">
          <div className={styles.barInner} key={product?.id ?? "bundle"}>
            <div className={styles.barInfo}>
              <span className={styles.barName}>
                {product && <i className={styles.barDot} style={{ background: product.tint }} aria-hidden />}
                {product ? product.name : bundle.name}
              </span>
              <span className={styles.barDetail}>
                {product ? `${product.benefits.join(" · ")} · ${product.flavour}` : bundle.detail}
              </span>
            </div>
            <div className={styles.barPrice}>
              {product ? product.price : bundle.price}
              {!product && <span className={styles.barSaving}>{bundle.saving}</span>}
            </div>
            <div className={styles.barActions}>
              <button type="button" className={styles.secondary} onClick={onShop}>
                {adultFinalCtaContent.primaryCta}
              </button>
              <button type="button" className={styles.primary}>
                {adultFinalCtaContent.addLabel}
              </button>
            </div>
          </div>
          {!product && <p className={styles.hint}>{adultFinalCtaContent.hint}</p>}
        </div>

      </div>

      {/* Sign-off ------------------------------------------------------- */}
      <p className={styles.signoff} data-signoff aria-label={adultFinalCtaContent.signoff.join(", ")}>
        {adultFinalCtaContent.signoff.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </p>
    </section>
  );
}
