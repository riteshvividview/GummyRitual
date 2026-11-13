import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../../animations/gsap";
import { getFrameLoader } from "../../../animations/frameLoader";
import { adultTextureContent } from "../../../data/adults/adultSectionsContent";
import { adultProducts } from "../../../data/adults/adultProducts";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { adultImages } from "../common/adultImages";
import styles from "./UpClose.module.css";

const { chapters, flavours } = adultTextureContent;
const FRAME_URLS = adultImages.tearFrames();
/**
 * The frame loader is cached app-wide and preloads only once, so its
 * progress callback can't belong to one mount (StrictMode remounts would
 * orphan it). Mounts subscribe here instead.
 */
const frameListeners = new Set<() => void>();
const notifyFrame = () => frameListeners.forEach((fn) => fn());

/** Share of the pinned scroll spent on the opening title card. */
const INTRO = 0.12;

/**
 * 06 · Up close.
 * Desktop: a pinned, scroll-scrubbed image sequence (scroll progress →
 * ScrollTrigger → frame index → canvas) of a gummy being pressed,
 * stretched and pulled apart, narrated in three chapters. Mobile plays
 * the same footage once as a light MP4; reduced motion shows the
 * still frames. Below, a flavour row of cross-section cutouts.
 */
export function UpClose() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [chapter, setChapter] = useState(-1);
  const [flavour, setFlavour] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const scrubbed = !isMobile && !reduced;

  // Desktop scrub ---------------------------------------------------------
  useGSAP(
    () => {
      if (!scrubbed) return;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const loader = getFrameLoader(FRAME_URLS);
      let current = -1;
      /** The frame scroll is asking for — redrawn as frames finish loading. */
      let target = 0;

      const fit = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        current = -1;
        draw(target);
      };

      // object-fit: cover, biased slightly low so hands + gummy stay framed.
      const draw = (index: number) => {
        target = index;
        const i = loader.isLoaded(index) ? index : loader.nearestLoaded(index);
        if (i < 0 || i === current) return;
        current = i;
        const img = loader.get(i);
        const cw = canvas.width;
        const ch = canvas.height;
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (cw - w) / 2, (ch - h) * 0.62, w, h);
      };

      // Every arriving frame re-checks whether it's closer to the target.
      const onFrame = () => draw(target);
      frameListeners.add(onFrame);
      loader.ready().then(() => {
        fit();
        loader.preloadRemaining(notifyFrame);
      });
      window.addEventListener("resize", fit);

      const state = { p: 0 };
      const last = FRAME_URLS.length - 1;
      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=340%",
          pin: stageRef.current,
          scrub: 0.6,
        },
        onUpdate: () => {
          const p = state.p;
          // Title card dissolves into the footage over the intro span.
          const t = gsap.utils.clamp(0, 1, p / INTRO);
          if (introRef.current) {
            introRef.current.style.opacity = String(1 - t);
            introRef.current.style.transform = `scale(${1 + t * 0.06})`;
          }
          const fp = gsap.utils.clamp(0, 1, (p - INTRO * 0.6) / (1 - INTRO * 0.6));
          draw(Math.round(fp * last));
          if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;
          let c = -1;
          chapters.forEach((ch, i) => {
            if (p >= ch.at) c = i;
          });
          setChapter((prev) => (prev === c ? prev : c));
        },
      });

      return () => {
        window.removeEventListener("resize", fit);
        frameListeners.delete(onFrame);
      };
    },
    { scope: sectionRef, dependencies: [scrubbed], revertOnUpdate: true }
  );

  // Mobile: play once when the clip is in view ----------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (scrubbed || reduced || !video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && video.paused && !video.ended) {
          video.play().catch(() => undefined);
        }
      },
      { threshold: 0.6 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [scrubbed, reduced]);

  const replay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    setVideoEnded(false);
    v.play().catch(() => undefined);
  };

  // Section-level reveals
  useGSAP(
    () => {
      gsap.from(sectionRef.current!.querySelectorAll("[data-reveal]"), {
        y: 40,
        autoAlpha: 0,
        duration: 1.1,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-flavours]", start: "top 75%" },
      });
    },
    { scope: sectionRef }
  );

  const fid = flavours.order[flavour];
  const fp = adultProducts[fid];

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="adult-texture-title">
      {scrubbed ? (
        <div ref={stageRef} className={styles.stage}>
          <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
          <div className={styles.scrim} aria-hidden />

          <div ref={introRef} className={styles.intro}>
            <img src={adultImages.textureStart()} alt="" className={styles.introImg} />
          </div>

          <header className={styles.heading}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowIndex}>06</span>
              {adultTextureContent.eyebrow}
            </p>
            <h2 id="adult-texture-title" className={styles.headline}>
              {adultTextureContent.headline}
            </h2>
            <p className={styles.introLine}>{adultTextureContent.intro}</p>
          </header>

          <div className={styles.chapters} aria-live="polite">
            {chapters.map((ch, i) => (
              <div
                key={ch.index}
                className={`${styles.chapter} ${i === chapter ? styles.chapterActive : ""}`}
                aria-hidden={i !== chapter}
              >
                <span className={styles.chapterIndex}>{ch.index}</span>
                <h3 className={styles.chapterTitle}>{ch.title}</h3>
                <p className={styles.chapterText}>{ch.text}</p>
              </div>
            ))}
          </div>

          <div className={styles.rail} aria-hidden>
            <span className={styles.railTrack}>
              <span ref={barRef} className={styles.railBar} />
            </span>
            {chapters.map((ch, i) => (
              <span
                key={ch.index}
                className={`${styles.railTick} ${i <= chapter ? styles.railTickOn : ""}`}
                style={{ top: `${ch.at * 100}%` }}
              >
                {ch.index}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.mobile}>
          <header className={styles.mobileHeading}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowIndex}>06</span>
              {adultTextureContent.eyebrow}
            </p>
            <h2 id="adult-texture-title" className={styles.headline}>
              {adultTextureContent.headline}
            </h2>
            <p className={styles.introLine}>{adultTextureContent.intro}</p>
          </header>
          <div className={styles.videoWrap}>
            {reduced ? (
              <img src={FRAME_URLS[Math.round(FRAME_URLS.length * 0.55)]} alt="A gummy stretched between two fingers" className={styles.video} />
            ) : (
              <video
                ref={videoRef}
                className={styles.video}
                src={adultImages.textureVideo()}
                poster={FRAME_URLS[0]}
                muted
                playsInline
                preload="metadata"
                onEnded={() => setVideoEnded(true)}
                aria-label="Fingers pressing, stretching and pulling apart a strawberry gummy"
              />
            )}
            {videoEnded && (
              <button type="button" className={styles.replay} onClick={replay}>
                {adultTextureContent.replay}
              </button>
            )}
          </div>
          <ol className={styles.mobileChapters}>
            {chapters.map((ch) => (
              <li key={ch.index}>
                <span className={styles.chapterIndex}>{ch.index}</span>
                <h3 className={styles.chapterTitle}>{ch.title}</h3>
                <p className={styles.chapterText}>{ch.text}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Flavour row ----------------------------------------------------- */}
      <div
        className={styles.flavours}
        data-flavours
        style={{
          // background follows the chosen gummy's own colour
          ["--wash" as string]: `color-mix(in srgb, ${fp.gummy} 16%, #fbf4ee)`,
          ["--deep" as string]: fp.tintDeep,
          ["--tint" as string]: fp.gummy,
        }}
      >
        <div className={styles.flavoursHead}>
          <p className={styles.eyebrow} data-reveal>
            {flavours.eyebrow}
          </p>
          <h3 className={styles.flavoursTitle} data-split>
            {flavours.headline}
          </h3>
        </div>

        <div className={styles.flavourStage}>
          <ul className={styles.flavourRow}>
            {flavours.order.map((id, i) => {
              const p = adultProducts[id];
              const on = i === flavour;
              return (
                <li key={id} data-reveal>
                  <button
                    type="button"
                    className={`${styles.flavour} ${on ? styles.flavourOn : ""}`}
                    onClick={() => setFlavour(i)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setFlavour(i)}
                    aria-pressed={on}
                  >
                    <span className={styles.flavourImgWrap}>
                      <img
                        src={adultImages.crossSection(id)}
                        alt={`${p.flavour} gummy cut in half`}
                        loading="lazy"
                        decoding="async"
                        className={styles.flavourImg}
                      />
                    </span>
                    <span className={styles.flavourName}>{p.flavour}</span>
                    <span className={styles.flavourProduct}>{p.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={styles.flavourNote} key={fid} aria-live="polite">
            <span className={styles.flavourNoteName}>{fp.flavour}.</span> {flavours.notes[fid]}
          </p>
        </div>
      </div>
    </section>
  );
}
