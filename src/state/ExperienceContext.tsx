import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getLenis } from "../hooks/useLenis";
import { ScrollTrigger } from "../animations/gsap/gsapConfig";

export type ExperienceMode = "kids" | "adults";

interface ExperienceContextValue {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);
const STORAGE_KEY = "gr:mode";

function readStoredMode(): ExperienceMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "adults" ? "adults" : "kids";
  } catch {
    return "kids";
  }
}

/**
 * Holds which experience (Kids / Adults) is active. The choice is
 * remembered (localStorage), so a refresh keeps the visitor where they
 * were — and the browser's own scroll restoration returns them to the
 * same spot. Switching experiences always starts the new one at the top.
 */
export function ExperienceProvider({ children }: { children: ReactNode }) {
  // Read synchronously so the first render is already the right page
  // (no Kids flash, and scroll restoration has the right document).
  const [mode, setMode] = useState<ExperienceMode>(readStoredMode);
  const firstRender = useRef(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Storage unavailable (private mode) — the choice just isn't remembered.
    }
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // A switch is a new page: start at the top, then re-measure triggers.
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>
  );
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error("useExperience must be used within an ExperienceProvider");
  }
  return ctx;
}
