import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../../../animations/gsap";
import { adultTrustContent } from "../../../data/adults/adultSectionsContent";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { adultImages } from "../common/adultImages";
import { StandardIconSvg } from "./StandardIcons";
import { Ornament } from "../ornaments/Ornament";
import styles from "./FormulatedWithCare.module.css";

const { standards, proof } = adultTrustContent;

/**
 * 07 · Formulated with care.
 * An editorial spread: the lab still life with the gloved-hands detail
 * laid over its corner (drifting at a different scroll speed), beside
 * four standards whose line icons draw themselves in, and a row of
 * proof figures that count up once.
 */
export function FormulatedWithCare() {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current!;
      const q = gsap.utils.selector(section);

      if (reduced) {
        q("[data-standard]").forEach((el) => el.classList.add(styles.drawn));
        return;
      }

      gsap.from(q("[data-reveal]"), {
        y: 44,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 70%" },
      });

      // Photo spread: the main plate opens with a clip reveal, the
      // inset drifts against it.
      gsap.fromTo(
        q("[data-plate]"),
        { clipPath: "inset(12% 8% 12% 8%)", scale: 1.08 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: q("[data-spread]")[0], start: "top 75%" },
        }
      );
      if (!isMobile) {
        gsap.fromTo(
          q("[data-inset]"),
          { yPercent: 18 },
          {
            yPercent: -14,
            ease: "none",
            scrollTrigger: {
              trigger: q("[data-spread]")[0],
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      }

      // Standards: each icon draws itself as its row enters.
      q("[data-standard]").forEach((row) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 82%",
          once: true,
          onEnter: () => row.classList.add(styles.drawn),
        });
      });

      // Proof figures count up once.
      q("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const state = { v: 0 };
        gsap.to(state, {
          v: target,
          duration: target > 10 ? 1.8 : 1.1,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(state.v));
          },
        });
      });
    },
    { scope: sectionRef, dependencies: [isMobile, reduced], revertOnUpdate: true }
  );

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="adult-trust-title">
      <Ornament art="lattice" place="trust" parallax={40} />
      <div className={styles.grid}>
        {/* Photo spread ------------------------------------------------- */}
        <div className={styles.spread} data-spread>
          <figure className={styles.plate} data-plate>
            <img
              src={adultImages.trustLab()}
              alt="Three gummies in a glass dish beside a beaker and a brass scale holding powder"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <figure className={styles.inset} data-inset>
            <img
              src={adultImages.trustHands()}
              alt="Gloved hands holding a gummy with tweezers over a petri dish"
              loading="lazy"
              decoding="async"
            />
            <figcaption>{adultTrustContent.caption}</figcaption>
          </figure>
        </div>

        {/* Copy + standards --------------------------------------------- */}
        <div className={styles.copy}>
          <p className={styles.eyebrow} data-reveal>
            <span className={styles.eyebrowIndex}>07</span>
            {adultTrustContent.eyebrow}
          </p>
          <h2 id="adult-trust-title" className={styles.headline} data-split>
            <span>{adultTrustContent.headline[0]}</span>
            <em>{adultTrustContent.headline[1]}</em>
          </h2>
          <p className={styles.description} data-reveal>
            {adultTrustContent.description}
          </p>

          <ol className={styles.standards}>
            {standards.map((s) => (
              <li key={s.index} className={styles.standard} data-standard>
                <span className={styles.iconWrap}>
                  <StandardIconSvg icon={s.icon} className={styles.icon} />
                </span>
                <div className={styles.standardBody}>
                  <span className={styles.standardIndex}>{s.index}</span>
                  <h3 className={styles.standardTitle}>{s.title}</h3>
                  <p className={styles.standardText}>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Proof row ------------------------------------------------------ */}
      <dl className={styles.proof}>
        {proof.map((p) => (
          <div key={p.label} className={styles.proofItem} data-reveal>
            <dt className={styles.proofValue}>
              {p.prefix}
              <span data-count={p.value}>{reduced ? p.value : 0}</span>
              {p.suffix && <span className={styles.proofSuffix}>{p.suffix}</span>}
            </dt>
            <dd className={styles.proofLabel}>{p.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
