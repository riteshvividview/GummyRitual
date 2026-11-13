import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { adultImages } from "../common/adultImages";
import styles from "./TheLineup.module.css";

/**
 * A slow turntable portrait of the Super Essentials pouch beside the closing
 * headline. The source clip is cropped to the pouch and encoded as a
 * ping-pong loop (forward + reversed) so it turns away and back with no
 * jump-cut — see scripts/optimize-adult-assets.mjs. It only plays while
 * on screen, and reduced motion gets the still poster frame.
 */
export function TurntableFrame({ caption }: { caption: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload !== "auto") video.preload = "auto";
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <figure className={styles.turntable}>
      <div className={styles.turntableFrame} data-turntable>
        {reduced ? (
          <img src={adultImages.turntablePoster()} alt="Super Essentials pouch on a stone turntable" className={styles.turntableMedia} />
        ) : (
          <video
            ref={videoRef}
            className={styles.turntableMedia}
            src={adultImages.turntableVideo()}
            poster={adultImages.turntablePoster()}
            muted
            loop
            playsInline
            preload="none"
            aria-label="Super Essentials pouch turning slowly on a stone turntable"
          />
        )}
      </div>
      <figcaption className={styles.turntableCaption}>{caption}</figcaption>
    </figure>
  );
}
