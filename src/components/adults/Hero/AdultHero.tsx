import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "../../../animations/gsap";
import { adultHeroContent } from "../../../data/adults/adultSectionsContent";
import { adultProducts } from "../../../data/adults/adultProducts";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { getLenis } from "../../../hooks/useLenis";
import { onSiteRevealed } from "../../../lib/siteReveal";
import { PlateCanvas, type PlateCanvasHandle } from "../common/PlateCanvas";
import { adultImages } from "../common/adultImages";
import { LightDial } from "./LightDial";
import { DIAL_C, hourToDeg } from "./dialGeometry";
import styles from "./AdultHero.module.css";

const { plates } = adultHeroContent;
const LAST = plates.length - 1;
const PLATE_URLS = plates.map((p) => adultImages.plate(p.product));
const PLATE_DEPTH = plates.map((p) => adultImages.plateDepth(p.product));
const PLATE_ALTS = plates.map(
  (p) => `${adultProducts[p.product].name} on a travertine block in ${p.moment.toLowerCase()} studio light`
);
const HOURS = plates.map((p) => p.hour);
/** Light on the wall behind the headline, per plate (desktop only). */
const WALL_LIGHT = plates.map((p) => p.wallLight);

/** Every plate change takes exactly this long, however hard you scroll. */
const STEP_DURATION = 0.7;
/** A pause this long between wheel events starts a new gesture. */
const GESTURE_GAP_MS = 160;
const WHEEL_THRESHOLD = 12;
const SWIPE_THRESHOLD = 40;

const formatTime = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.floor(((h - hh) * 60) / 5) * 5;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

/**
 * 01 · The Light Dial.
 * One studio set, four lighting setups — each light belongs to one
 * product. On desktop the hero is a stepped sequence: while the page is
 * at the top, every scroll gesture (wheel, trackpad, keys, swipe) moves
 * exactly one plate with a fixed-length focus pull, and input is held
 * until it finishes — so a fast flick can't skip past the products.
 * After the last plate the next gesture releases into the page;
 * scrolling back to the top re-enters the sequence. Mobile and reduced
 * motion use tap (plus gentle autoplay on mobile).
 */
export function AdultHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<PlateCanvasHandle>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  /** The plate the sequence is at or heading to. */
  const indexRef = useRef(0);
  const animatingRef = useRef(false);

  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const stepped = !isMobile && !reduced;

  /**
   * Push a state into every visual: plate `from` → `to` at `mix`.
   * Colours and the dial interpolate directly between the two plates,
   * so dial jumps (e.g. 5 → 1) never cycle through the ones between.
   */
  const applyPair = useCallback((from: number, to: number, mix: number) => {
    const a = plates[from];
    const b = plates[to];
    const section = sectionRef.current;
    if (section) {
      const lerp = gsap.utils.interpolate;
      section.style.setProperty("--wall", lerp(a.wall, b.wall, mix));
      section.style.setProperty("--ink", lerp(a.ink, b.ink, mix));
      section.style.setProperty("--ink-muted", lerp(a.inkMuted, b.inkMuted, mix));
      section.style.setProperty("--accent", lerp(a.accent, b.accent, mix));
      section.style.setProperty("--label", lerp(a.label, b.label, mix));
      section.style.setProperty("--btn", lerp(a.button, b.button, mix));
      section.style.setProperty("--btn-text", lerp(a.buttonText, b.buttonText, mix));
    }
    plateRef.current?.setState(from, to, mix);
    const hour = gsap.utils.interpolate(a.hour, b.hour, mix);
    arcRef.current?.setAttribute("stroke-dasharray", `${((hour - HOURS[0]) / 24) * DIAL_C} ${DIAL_C}`);
    if (markerRef.current) markerRef.current.style.transform = `rotate(${hourToDeg(hour)}deg)`;
    if (timeRef.current) timeRef.current.textContent = formatTime(hour);

    const next = mix < 0.5 ? from : to;
    if (next !== activeRef.current) {
      activeRef.current = next;
      setActive(next);
    }
  }, []);

  /** Fixed-duration transition to a plate. Ignored while one is running. */
  const goTo = useCallback(
    (target: number) => {
      const from = indexRef.current;
      if (target === from || animatingRef.current) return;
      indexRef.current = target;
      animatingRef.current = true;
      const state = { m: 0 };
      tweenRef.current = gsap.to(state, {
        m: 1,
        duration: reduced ? 0 : STEP_DURATION,
        // one gentle curve end to end (the shader adds no easing of its own)
        ease: "sine.inOut",
        onUpdate: () => applyPair(from, target, state.m),
        onComplete: () => {
          animatingRef.current = false;
        },
      });
    },
    [applyPair, reduced]
  );

  useEffect(() => {
    applyPair(0, 0, 0);
    return () => {
      tweenRef.current?.kill();
    };
  }, [applyPair]);

  // ---------------------------------------------------------------------
  // Desktop: stepped sequence while the page is at the top.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!stepped) return;

    const atTop = () => window.scrollY <= 2;
    let locked = atTop();
    // One gesture = at most one plate. The gesture that *arrives* at the
    // top (scrolling up out of the page) is spent, so its inertia can't
    // immediately step the hero back.
    let lastWheel = 0;
    let gestureSpent = false;
    let wheelAcc = 0;

    const release = () => {
      locked = false;
      gestureSpent = true;
      const hero = sectionRef.current;
      const y = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { duration: 1.0 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    };

    const step = (dir: 1 | -1) => {
      if (animatingRef.current) return;
      const i = indexRef.current;
      if (dir > 0) {
        if (i < LAST) goTo(i + 1);
        else release();
      } else if (i > 0) {
        goTo(i - 1);
      }
    };

    // scrollable overlays (e.g. the product drawer) scroll on their own
    const inOverlay = (e: Event) => !!(e.target as Element | null)?.closest?.("[data-lenis-prevent]");

    const onWheel = (e: WheelEvent) => {
      if (!locked || inOverlay(e)) return;
      // Scrolling up at the very top with nothing to go back to: let it be.
      if (e.deltaY < 0 && indexRef.current === 0 && !animatingRef.current) return;
      // Hold the page still; keep Lenis (bubble listener on window) out of it.
      e.preventDefault();
      e.stopImmediatePropagation();

      const now = performance.now();
      if (now - lastWheel > GESTURE_GAP_MS) {
        gestureSpent = false;
        wheelAcc = 0;
      }
      lastWheel = now;
      if (gestureSpent || animatingRef.current) {
        gestureSpent = true;
        return;
      }
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) >= WHEEL_THRESHOLD) {
        gestureSpent = true;
        step(wheelAcc > 0 ? 1 : -1);
        wheelAcc = 0;
      }
    };

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = locked ? e.touches[0].clientY : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!locked || touchY === null || inOverlay(e)) return;
      const dy = touchY - e.touches[0].clientY;
      if (dy < 0 && indexRef.current === 0) return; // pull-down at the top
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!locked || touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      touchY = null;
      if (Math.abs(dy) >= SWIPE_THRESHOLD) step(dy > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (!locked) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const down = ["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey);
      const up = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
      if (!down && !up) return;
      if (up && indexRef.current === 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      step(down ? 1 : -1);
    };

    const onScroll = () => {
      const top = atTop();
      if (top && !locked) {
        locked = true;
        gestureSpent = true; // the arriving gesture doesn't count
      } else if (!top) {
        locked = false;
      }
    };

    // Capture phase on window: runs before Lenis's own listeners.
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("keydown", onKey, { capture: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
      window.removeEventListener("scroll", onScroll);
    };
  }, [stepped, goTo]);

  // Mobile: gentle autoplay through the day.
  useEffect(() => {
    if (stepped || reduced) return;
    const id = window.setInterval(() => {
      goTo((indexRef.current + 1) % plates.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [stepped, reduced, goTo]);

  // ---------------------------------------------------------------------
  // Entrance — on page load (after the loader) and every switch to Adults.
  // ---------------------------------------------------------------------
  useGSAP(
    (_, contextSafe) => {
      if (reduced) return;
      const q = gsap.utils.selector(sectionRef);
      const hidden = [q("[data-in-media]"), q("[data-in]"), q("[data-in-dial]")];
      gsap.set(hidden, { autoAlpha: 0 });

      let cancelled = false;
      const play = contextSafe!(() => {
        if (cancelled) return;
        const headline = q("[data-in-headline]")[0];
        const description = q("[data-in-description]")[0];
        const split = SplitText.create(headline.querySelectorAll("[data-line]"), {
          type: "lines,chars",
          mask: "lines",
        });
        const descSplit = SplitText.create(description, { type: "lines", mask: "lines" });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.fromTo(
          q("[data-in-media]"),
          { autoAlpha: 0, scale: 1.08 },
          { autoAlpha: 1, scale: 1, duration: 2, ease: "power3.out" },
          0
        )
          .set(q("[data-in]"), { autoAlpha: 1 }, 0.15)
          .from(q("[data-in-eyebrow]"), { yPercent: 110, autoAlpha: 0, duration: 1 }, 0.25)
          .from(q("[data-in-rule]"), { scaleX: 0, transformOrigin: "left", duration: 1.2, ease: "power3.inOut" }, 0.35)
          .from(split.chars, { yPercent: 135, duration: 1.2, stagger: 0.018 }, 0.35)
          .from(descSplit.lines, { yPercent: 130, duration: 1, stagger: 0.08 }, 0.85)
          .from(q("[data-in-ritual]"), { y: 24, autoAlpha: 0, duration: 1 }, 1.0)
          .from(q("[data-in-actions]"), { y: 20, autoAlpha: 0, duration: 1 }, 1.1)
          .fromTo(
            q("[data-in-dial]"),
            { autoAlpha: 0, y: 30, scale: 0.94 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out" },
            1.15
          );
      });

      // Start once the page is idle: mounting the Adults page (WebGL,
      // texture uploads) blocks the main thread briefly, and with GSAP lag
      // smoothing off (see useLenis) a timeline started during that block
      // would jump straight to its end.
      const whenIdle = () =>
        new Promise<void>((resolve) => {
          const ric = (window as Window & {
            requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
          }).requestIdleCallback;
          requestAnimationFrame(() =>
            requestAnimationFrame(() => (ric ? ric(() => resolve(), { timeout: 400 }) : setTimeout(resolve, 120)))
          );
        });
      const wait = (document.fonts?.ready ?? Promise.resolve()).then(whenIdle);
      let unsubscribe = () => {};
      wait.then(() => {
        unsubscribe = onSiteRevealed(play);
      });
      return () => {
        cancelled = true;
        unsubscribe();
      };
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  const onSelect = useCallback((i: number) => goTo(i), [goTo]);

  const onShop = () => {
    const el = document.getElementById("adult-collection");
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const plate = plates[active];
  const product = adultProducts[plate.product];
  const labels = useMemo(() => plates.map((p) => adultProducts[p.product].title), []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Gummy Rituals for adults">
      <div className={styles.stage}>
        <div className={styles.media} data-in-media>
          <PlateCanvas
            key={isMobile ? "m" : "d"}
            ref={plateRef}
            urls={PLATE_URLS}
            depthUrls={PLATE_DEPTH}
            parallax={isMobile ? 0.012 : 0.022}
            alts={PLATE_ALTS}
            transition="depth"
            fit={isMobile ? "cover" : "height"}
            focus={isMobile ? [0.74, 0.5] : [0.62, 0.5]}
            grain={0}
            pointerLight={0.05}
            wallLight={isMobile ? undefined : WALL_LIGHT}
          />
        </div>

        <div className={styles.content} data-in>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowText}>
              <span data-in-eyebrow>{adultHeroContent.eyebrow}</span>
            </span>
            <span className={styles.eyebrowRule} aria-hidden data-in-rule />
          </p>
          <h1 className={styles.headline} data-in-headline>
            <span className={styles.line} data-line>
              {adultHeroContent.headline[0]}
            </span>
            <span className={`${styles.line} ${styles.lineAccent}`} data-line>
              {adultHeroContent.headline[1]}
            </span>
          </h1>
          <p className={styles.description} data-in-description>
            {adultHeroContent.description}
          </p>

          <div className={styles.ritual} aria-live="polite" data-in-ritual>
            <div key={active} className={styles.ritualInner}>
              <span className={styles.ritualMoment}>
                {String(plate.hour).padStart(2, "0")}:00 · {plate.moment}
              </span>
              <span className={styles.ritualName}>{product.title}</span>
              <span className={styles.ritualBenefits}>{product.benefits.join(" · ")}</span>
            </div>
          </div>

          <div className={styles.actions} data-in-actions>
            <button type="button" className={styles.primary} onClick={onShop}>
              {adultHeroContent.primaryCta}
            </button>
            <span className={styles.price}>
              {product.title} · {product.price}
            </span>
          </div>
        </div>

        <div className={styles.dialDock} data-in-dial>
          <LightDial
            hours={HOURS}
            labels={labels}
            active={active}
            onSelect={onSelect}
            arcRef={arcRef}
            markerRef={markerRef}
            timeRef={timeRef}
          />
          <div className={styles.dialLegend}>
            <span className={styles.dialCount}>
              {String(active + 1).padStart(2, "0")} <i>/ {String(plates.length).padStart(2, "0")}</i>
            </span>
            <span className={styles.dialHint}>{stepped ? adultHeroContent.scrollHint : "Tap the dial"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
