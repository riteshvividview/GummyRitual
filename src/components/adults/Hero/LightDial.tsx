import type { Ref } from "react";
import styles from "./AdultHero.module.css";
import { DIAL_C, DIAL_R, hourToDeg } from "./dialGeometry";

interface LightDialProps {
  hours: number[];
  labels: string[];
  active: number;
  onSelect: (index: number) => void;
  arcRef: Ref<SVGCircleElement>;
  markerRef: Ref<SVGGElement>;
  timeRef: Ref<HTMLSpanElement>;
}


/**
 * The hero's signature control: a 24-hour dial. Its arc, marker and
 * clock text are driven imperatively by scroll (see AdultHero), while the
 * five ticks are real buttons so the dial works by tap and keyboard too.
 */
export function LightDial({ hours, labels, active, onSelect, arcRef, markerRef, timeRef }: LightDialProps) {
  const size = 140;
  const c = size / 2;
  return (
    <div className={styles.dial}>
      <svg className={styles.dialSvg} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={c} cy={c} r={DIAL_R} className={styles.dialTrack} />
        {/* 24 hour hairlines */}
        {Array.from({ length: 24 }, (_, h) => {
          const a = ((hourToDeg(h) - 90) * Math.PI) / 180;
          const r1 = DIAL_R + 5;
          const r2 = DIAL_R + (h % 6 === 0 ? 10 : 7);
          return (
            <line
              key={h}
              x1={c + Math.cos(a) * r1}
              y1={c + Math.sin(a) * r1}
              x2={c + Math.cos(a) * r2}
              y2={c + Math.sin(a) * r2}
              className={styles.dialHair}
            />
          );
        })}
        <circle
          ref={arcRef}
          cx={c}
          cy={c}
          r={DIAL_R}
          className={styles.dialArc}
          strokeDasharray={`0 ${DIAL_C}`}
          transform={`rotate(${hourToDeg(hours[0]) - 90} ${c} ${c})`}
        />
        <g ref={markerRef} style={{ transformOrigin: `${c}px ${c}px` }}>
          <circle cx={c} cy={c - DIAL_R} r={4.5} className={styles.dialMarker} />
          <circle cx={c} cy={c - DIAL_R} r={9} className={styles.dialMarkerHalo} />
        </g>
      </svg>
      {hours.map((h, i) => {
        const a = ((hourToDeg(h) - 90) * Math.PI) / 180;
        const r = DIAL_R;
        return (
          <button
            key={h}
            type="button"
            className={`${styles.dialTick} ${i === active ? styles.dialTickActive : ""}`}
            style={{
              left: `${((c + Math.cos(a) * r) / size) * 100}%`,
              top: `${((c + Math.sin(a) * r) / size) * 100}%`,
            }}
            onClick={() => onSelect(i)}
            aria-label={`${labels[i]}, ${String(h).padStart(2, "0")}:00`}
            aria-pressed={i === active}
          />
        );
      })}
      <div className={styles.dialCenter}>
        <span ref={timeRef} className={styles.dialTime}>
          07:00
        </span>
      </div>
    </div>
  );
}
