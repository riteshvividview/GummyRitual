import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let isRegistered = false;

/**
 * Registers GSAP plugins exactly once for the whole app.
 * Call this once at app bootstrap (see src/animations/gsap/index.ts).
 */
export function registerGsapPlugins() {
  if (isRegistered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  isRegistered = true;
}

export { gsap, ScrollTrigger, SplitText };
