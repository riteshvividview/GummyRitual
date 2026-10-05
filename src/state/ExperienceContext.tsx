import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ExperienceMode = "kids" | "adults";

interface ExperienceContextValue {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

/**
 * Holds which experience (Kids / Adults) is currently active. Kids is the
 * default and only fully-built experience today; Adults is a placeholder
 * (see components/Hero/AdultHero.tsx) until its own visual system is built.
 */
export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ExperienceMode>("kids");

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
