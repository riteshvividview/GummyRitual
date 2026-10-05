import { useEffect, useRef } from "react";
import { Leaf, PawPrint } from "lucide-react";
import { useExperience, type ExperienceMode } from "../../state/ExperienceContext";
import styles from "./ModeToggle.module.css";

const options: { mode: ExperienceMode; label: string; icon: typeof PawPrint }[] = [
  { mode: "kids", label: "Kids", icon: PawPrint },
  { mode: "adults", label: "Adults", icon: Leaf },
];

/**
 * Premium pill toggle switching the active experience. The active-state
 * indicator is positioned imperatively (measured from the DOM) rather than
 * via React state, so it never causes an extra render pass.
 */
export function ModeToggle() {
  const { mode, setMode } = useExperience();
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const optionRefs = useRef<Partial<Record<ExperienceMode, HTMLButtonElement | null>>>({});

  useEffect(() => {
    const target = optionRefs.current[mode];
    const indicator = indicatorRef.current;
    if (!target || !indicator) return;
    indicator.style.width = `${target.offsetWidth}px`;
    indicator.style.transform = `translateX(${target.offsetLeft - 4}px)`;
  }, [mode]);

  return (
    <div className={styles.toggle} role="radiogroup" aria-label="Experience">
      <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
      {options.map(({ mode: optionMode, label, icon: Icon }) => (
        <button
          key={optionMode}
          ref={(el) => {
            optionRefs.current[optionMode] = el;
          }}
          type="button"
          role="radio"
          aria-checked={mode === optionMode}
          className={`${styles.option} ${mode === optionMode ? styles.optionActive : ""}`}
          onClick={() => setMode(optionMode)}
        >
          <Icon size={14} strokeWidth={2.25} />
          <span className={styles.optionLabel}>{label}</span>
        </button>
      ))}
    </div>
  );
}
