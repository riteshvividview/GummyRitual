import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { PlateRenderer, type PlateFit, type PlateTransition } from "../../../animations/webgl/PlateRenderer";
import styles from "./PlateCanvas.module.css";

export interface PlateCanvasHandle {
  setState: (from: number, to: number, mix: number) => void;
}

interface PlateCanvasProps {
  ref?: Ref<PlateCanvasHandle>;
  urls: string[];
  depthUrls?: string[];
  parallax?: number;
  alts: string[];
  transition?: PlateTransition;
  fit?: PlateFit;
  focus?: [number, number];
  grain?: number;
  pointerLight?: number;
  /** Per-plate wall light behind the headline (see PlateRenderer). */
  wallLight?: number[];
  lightSide?: "left" | "right";
  className?: string;
  /** Initial plate. */
  initial?: number;
}

/**
 * React wrapper around PlateRenderer. Falls back to stacked <img>
 * crossfades (driven by the same setState API) when WebGL is missing,
 * so every caller can treat it identically.
 */
export function PlateCanvas({
  ref,
  urls,
  depthUrls,
  parallax,
  alts,
  transition = "focus",
  fit = "cover",
  focus,
  grain = 0.045,
  pointerLight = 0,
  wallLight,
  lightSide = "left",
  className,
  initial = 0,
}: PlateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PlateRenderer | null>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const renderer = new PlateRenderer({
        canvas,
        urls,
        depthUrls,
        parallax,
        transition,
        focus,
        grain,
        pointerLight,
        fit,
        wallLight,
        lightSide,
        onReady: () => setReady(true),
      });
      renderer.setState(initial, initial, 0);
      rendererRef.current = renderer;
    } catch (err) {
      console.warn("[PlateCanvas] WebGL unavailable, using image fallback:", err);
      setFallback(true);
    }
    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
    // Renderer is created once per URL set; option changes don't need a rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls]);

  // Cursor light (desktop pointers only — touch never gets a hover light).
  useEffect(() => {
    if (!pointerLight || fallback) return;
    const canvas = canvasRef.current;
    if (!canvas || !window.matchMedia("(hover: hover)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      rendererRef.current?.setPointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointerLight, fallback]);

  useImperativeHandle(
    ref,
    () => ({
      setState(from, to, mix) {
        if (rendererRef.current) {
          rendererRef.current.setState(from, to, mix);
          return;
        }
        imgRefs.current.forEach((img, i) => {
          if (!img) return;
          img.style.opacity = i === from ? String(1 - mix) : i === to ? String(mix) : "0";
        });
      },
    }),
    []
  );

  return (
    <div className={`${styles.wrap} ${className ?? ""}`}>
      {fallback ? (
        urls.map((url, i) => (
          <img
            key={url}
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={url}
            alt={alts[i]}
            className={styles.fallbackImg}
            style={{
              opacity: i === initial ? 1 : 0,
              objectPosition: focus ? `${focus[0] * 100}% ${focus[1] * 100}%` : undefined,
            }}
          />
        ))
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className={`${styles.canvas} ${ready ? styles.ready : ""}`}
            role="img"
            aria-label={alts[initial]}
          />
          {/* First plate as an instant poster while textures upload. */}
          {!ready && (
            <img
              src={urls[initial]}
              alt=""
              aria-hidden
              className={styles.fallbackImg}
              style={{ objectPosition: focus ? `${focus[0] * 100}% ${focus[1] * 100}%` : undefined }}
            />
          )}
        </>
      )}
    </div>
  );
}
