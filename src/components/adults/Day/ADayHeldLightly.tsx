import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../../animations/gsap";
import { adultDayContent } from "../../../data/adults/adultSectionsContent";
import { adultProducts } from "../../../data/adults/adultProducts";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { adultImages } from "../common/adultImages";
import styles from "./ADayHeldLightly.module.css";

const { moments } = adultDayContent;
/** Each moment's node sits over its card's centre (three equal columns). */
const NODE_X = moments.map((_, i) => ((i + 0.5) / moments.length) * 100);
const SUN_FROM = 2;
const SUN_TO = 98;
/** The gummy riding the day line changes with the moment it's nearest. */
const MARKER_GUMMY = ["multivitamin", "hair", "sleep"] as const;

/** Crossfade weights for the marker gummies at position x (%). */
function gummyWeights(x: number) {
  const w = NODE_X.map(() => 0);
  if (x <= NODE_X[0]) w[0] = 1;
  else if (x >= NODE_X[NODE_X.length - 1]) w[w.length - 1] = 1;
  else {
    for (let i = 0; i < NODE_X.length - 1; i++) {
      if (x >= NODE_X[i] && x <= NODE_X[i + 1]) {
        const t = (x - NODE_X[i]) / (NODE_X[i + 1] - NODE_X[i]);
        // hold each gummy, then hand over through the middle of the gap
        const k = gsap.utils.clamp(0, 1, (t - 0.35) / 0.3);
        w[i] = 1 - k;
        w[i + 1] = k;
      }
    }
  }
  return w;
}

/** Map the sun's x (%) to a clock time, piecewise between the moments. */
function hourAt(x: number) {
  const xs = [0, ...NODE_X, 100];
  const hs = [5.5, ...moments.map((m) => m.hour), 23.5];
  for (let i = 0; i < xs.length - 1; i++) {
    if (x <= xs[i + 1]) {
      const t = (x - xs[i]) / (xs[i + 1] - xs[i]);
      return hs[i] + (hs[i + 1] - hs[i]) * t;
    }
  }
  return hs[hs.length - 1];
}

const fmt = (h: number) => {
  const hh = Math.floor(h) % 24;
  const mm = Math.floor(((h - Math.floor(h)) * 60) / 15) * 15;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

/**
 * 05 · A day, held lightly.
 * An editorial three-column spread under a fine day line. A small sun
 * travels the line as the section scrolls past (no pin), and each moment
 * steps forward when the sun reaches it.
 */
export function ADayHeldLightly() {
  const sectionRef = useRef<HTMLElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [lit, setLit] = useState(reduced ? moments.length - 1 : -1);

  useGSAP(
    () => {
      const section = sectionRef.current!;
      const place = (x: number) => {
        section.style.setProperty("--sun", `${x}%`);
        section.style.setProperty("--tilt", `${Math.sin(x / 6) * 7}deg`);
        gummyWeights(x).forEach((w, i) => section.style.setProperty(`--g${i}`, String(w)));
        const h = hourAt(x);
        section.style.setProperty("--night", String(gsap.utils.clamp(0, 1, (h - 19) / 3)));
        if (timeRef.current) timeRef.current.textContent = fmt(h);
        let next = -1;
        NODE_X.forEach((nx, i) => {
          if (x >= nx - 0.5) next = i;
        });
        setLit((prev) => (prev === next ? prev : next));
      };

      if (reduced) {
        place(SUN_TO);
        return;
      }

      gsap.from(section.querySelectorAll("[data-reveal]"), {
        y: 40,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 70%" },
      });
      // The day line draws itself in.
      gsap.from(section.querySelector("[data-rail]"), {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.6,
        ease: "power3.inOut",
        scrollTrigger: { trigger: section, start: "top 65%" },
      });

      place(SUN_FROM);
      const state = { x: SUN_FROM };
      gsap.to(state, {
        x: SUN_TO,
        ease: "none",
        onUpdate: () => place(state.x),
        scrollTrigger: {
          trigger: section.querySelector("[data-axis]"),
          start: "top 80%",
          // Night is reached as the last card is fully on screen.
          endTrigger: section.querySelector("[data-moments]"),
          end: "bottom 95%",
          scrub: 0.7,
        },
      });
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="adult-day-title">
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow} data-reveal>
            <span className={styles.eyebrowIndex}>05</span>
            {adultDayContent.eyebrow}
          </p>
          <h2 id="adult-day-title" className={styles.headline} data-split>
            <span>{adultDayContent.headline[0]}</span>
            <em>{adultDayContent.headline[1]}</em>
          </h2>
        </div>
        <p className={styles.description} data-reveal>
          {adultDayContent.description}
        </p>
      </header>

      {/* Day line --------------------------------------------------------- */}
      <div className={styles.axis} data-axis aria-hidden>
        <div className={styles.rail} data-rail />
        {moments.map((m, i) => (
          <div
            key={m.id}
            className={`${styles.node} ${i <= lit ? styles.nodeLit : ""}`}
            style={{ left: `${NODE_X[i]}%` }}
          >
            <span className={styles.nodeTime}>{String(m.hour).padStart(2, "0")}:00</span>
            <span className={styles.nodeDot} />
          </div>
        ))}
        <div className={styles.sun}>
          <span className={styles.sunGummy}>
            {MARKER_GUMMY.map((id, i) => (
              <img
                key={id}
                src={adultImages.gummies(id)}
                alt=""
                style={{ opacity: `var(--g${i}, ${i === 0 ? 1 : 0})` }}
              />
            ))}
          </span>
          <span ref={timeRef} className={styles.sunTime}>
            06:00
          </span>
        </div>
      </div>

      {/* Moments ---------------------------------------------------------- */}
      <ol className={styles.moments} data-moments>
        {moments.map((m, i) => (
          <li key={m.id} className={`${styles.moment} ${i <= lit ? styles.momentLit : ""}`}>
            <figure className={styles.photo} data-reveal>
              <img
                src={adultImages.day(m.id)}
                alt={`${m.products.map((p) => adultProducts[p].name).join(" and ")} — ${m.moment.toLowerCase()} ritual`}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className={styles.copy} data-reveal>
              <p className={styles.label}>
                <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
                {m.moment}
                <span className={styles.labelTime}>· {String(m.hour).padStart(2, "0")}:00</span>
              </p>
              <h3 className={styles.products}>
                {m.products.map((p, j) => (
                  <span key={p} className={styles.productName}>
                    {j > 0 && <span className={styles.plus}>&amp;</span>}
                    <i style={{ background: adultProducts[p].tint }} aria-hidden />
                    {adultProducts[p].title}
                  </span>
                ))}
              </h3>
              <p className={styles.text}>{m.line}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
