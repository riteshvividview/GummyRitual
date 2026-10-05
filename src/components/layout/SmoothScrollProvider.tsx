import { type ReactNode } from "react";
import { useLenis } from "../../hooks/useLenis";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface SmoothScrollProviderProps {
  children: ReactNode;
  /** Set false to defer Lenis init entirely — used by App.tsx to hold off
   * smooth-scroll until the app preloader's reveal transition finishes,
   * so there's nothing to scroll-lock/fight against while the loader
   * overlay is up. Defaults to true (previous, always-on behavior). */
  enabled?: boolean;
}

/**
 * Mounts Lenis smooth scrolling for the app. Automatically falls back to
 * native scrolling when the user has prefers-reduced-motion enabled, so
 * accessibility settings are respected without extra call-site logic.
 */
export function SmoothScrollProvider({ children, enabled = true }: SmoothScrollProviderProps) {
  const prefersReducedMotion = useReducedMotion();
  useLenis({ enabled: enabled && !prefersReducedMotion });

  return <>{children}</>;
}
