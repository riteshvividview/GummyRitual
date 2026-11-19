import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Bone, Brain, Heart, ShieldPlus, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import { gsap, ScrollTrigger } from "../../animations/gsap/gsapConfig";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { benefitDetails, benefitsIntro, type BenefitDetail } from "../../data/benefitsContent";
import { catalog, formatINR, getProduct } from "../../data/catalog";
import { scrollToHash } from "../../lib/router";
import { useCart } from "../../state/CartContext";
import { useExperience } from "../../state/ExperienceContext";
import { packImage } from "./shopImages";
import styles from "./BenefitsPage.module.css";

const icons: Record<BenefitDetail["icon"], LucideIcon> = {
  shieldPlus: ShieldPlus,
  trendingUp: TrendingUp,
  brain: Brain,
  bone: Bone,
  zap: Zap,
  heart: Heart,
};

const art = import.meta.glob<string>("../../assets/shop/benefits/*.webp", { eager: true, import: "default" });
const image = (name: string) => Object.entries(art).find(([p]) => p.endsWith(`/${name}.webp`))?.[1] ?? "";

/**
 * /benefits — the long version of the homepage's "Why Gummy Rituals?"
 * pills. A cinematic hero, a sticky benefit navigator that tracks where
 * you are, then one chapter per benefit (alternating sides) with the
 * nutrients behind it and the gummies that deliver it — each one buyable.
 */
export function BenefitsPage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(benefitDetails[0].id);
  const { setMode } = useExperience();

  // A Kids page — header + footer follow.
  useEffect(() => setMode("kids"), [setMode]);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const q = gsap.utils.selector(root);

      // Which chapter is on screen drives the navigator.
      q<HTMLElement>("[data-chapter]").forEach((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(el.id),
        })
      );

      if (reduced) return;
      gsap.from(q("[data-hero-in]"), { y: 40, autoAlpha: 0, duration: 1.2, ease: "power3.out", stagger: 0.1, delay: 0.1 });
      gsap.fromTo(q("[data-hero-img]"), { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "power2.out" });
      gsap.to(q("[data-hero-img]"), {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "+=100%", scrub: true },
      });

      q<HTMLElement>("[data-chapter]").forEach((el) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 75%" } });
        tl.from(el.querySelector("[data-frame]"), {
          clipPath: "inset(12% 12% 12% 12% round 2rem)",
          duration: 1.3,
          ease: "power3.out",
        })
          .from(el.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.07 }, 0.15);
        gsap.fromTo(
          el.querySelector("[data-img]"),
          { yPercent: -8 },
          { yPercent: 8, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }
        );
      });

      gsap.from(q("[data-close] > *"), {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: q("[data-close]")[0], start: "top 80%" },
      });
    },
    { scope: ref, dependencies: [reduced] }
  );

  const kids = catalog.filter((p) => p.range === "kids");

  return (
    <div ref={ref} className={styles.page}>
      <section className={styles.hero}>
        <img src={image("hero")} alt="" className={styles.heroImg} data-hero-img />
        <div className={styles.heroShade} aria-hidden />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow} data-hero-in>
            {benefitsIntro.eyebrow}
          </p>
          <h1 className={styles.title} data-hero-in>
            {benefitsIntro.title[0]}
            <br />
            <span>{benefitsIntro.title[1]}</span>
          </h1>
          <p className={styles.lede} data-hero-in>
            {benefitsIntro.lede}
          </p>
        </div>
      </section>

      <nav className={styles.nav} aria-label="Benefits">
        <ul>
          {benefitDetails.map((b) => {
            const Icon = icons[b.icon];
            const on = active === b.id;
            return (
              <li key={b.id}>
                <a
                  href={`#${b.id}`}
                  className={`${styles.navLink} ${on ? styles.navOn : ""}`}
                  style={{ ["--tint" as string]: b.tint }}
                  aria-current={on ? "true" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    history.replaceState(null, "", `#${b.id}`);
                    scrollToHash(`#${b.id}`);
                  }}
                >
                  <Icon size={16} strokeWidth={2} />
                  {b.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {benefitDetails.map((b, i) => (
        <Chapter key={b.id} b={b} index={i} />
      ))}

      <section className={styles.close} data-close>
        <p className={styles.eyebrow}>Start their ritual</p>
        <h2 className={styles.closeTitle}>
          One gummy a day.
          <br />
          <span>Every benefit, covered.</span>
        </h2>
        <div className={styles.closePacks}>
          {kids.map((p) => (
            <a key={p.id} href={`/shop/${p.id}`} className={styles.closePack} style={{ ["--wash" as string]: p.wash }}>
              <img src={packImage(p)} alt="" draggable={false} />
              <span className={styles.closeName}>{p.title}</span>
              <span className={styles.closePrice}>{formatINR(p.price)}</span>
            </a>
          ))}
        </div>
        <div className={styles.closeActions}>
          <a href="/shop?range=kids" className={styles.primary}>
            Shop kids gummies <ArrowRight size={16} />
          </a>
          <a href="/shop?range=adults" className={styles.secondary}>
            Rituals for grown-ups
          </a>
        </div>
      </section>
    </div>
  );
}

function Chapter({ b, index }: { b: BenefitDetail; index: number }) {
  const Icon = icons[b.icon];
  const { add } = useCart();
  const flip = index % 2 === 1;
  return (
    <section
      id={b.id}
      data-chapter
      className={`${styles.chapter} ${flip ? styles.flip : ""}`}
      style={{ ["--tint" as string]: b.tint, ["--wash" as string]: b.wash }}
      aria-labelledby={`${b.id}-h`}
    >
      <div className={styles.frame} data-frame>
        <img src={image(b.image)} alt="" className={styles.chapterImg} data-img loading="lazy" />
        <span className={styles.frameNo}>{String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className={styles.text}>
        <p className={styles.kicker} data-in>
          <span className={styles.icon}>
            <Icon size={20} strokeWidth={2} />
          </span>
          {b.label}
        </p>
        <h2 id={`${b.id}-h`} className={styles.headline} data-in>
          {b.headline}
        </h2>
        <p className={styles.body} data-in>
          {b.body}
        </p>

        <ul className={styles.nutrients}>
          {b.nutrients.map((n) => (
            <li key={n.name} data-in>
              <span className={styles.nName}>{n.name}</span>
              <span className={styles.nNote}>{n.note}</span>
            </li>
          ))}
        </ul>

        <p className={styles.foundIn} data-in>
          Found in
        </p>
        <div className={styles.products}>
          {b.products.map((id) => {
            const p = getProduct(id);
            if (!p) return null;
            return (
              <div key={id} className={styles.product} data-in style={{ ["--pwash" as string]: p.wash, ["--deep" as string]: p.tintDeep }}>
                <a href={`/shop/${p.id}`} className={styles.productLink}>
                  <span className={styles.productThumb}>
                    <img src={packImage(p)} alt="" loading="lazy" draggable={false} />
                  </span>
                  <span className={styles.productText}>
                    <span className={styles.productName}>{p.title}</span>
                    <span className={styles.productPrice}>{formatINR(p.price)}</span>
                  </span>
                </a>
                <button
                  type="button"
                  className={styles.productAdd}
                  onClick={() => add({ productId: p.id, packSize: 1, subscribe: false, quantity: 1 })}
                >
                  Add to bag
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
